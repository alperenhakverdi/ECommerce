using Serilog;
using System.Collections.Concurrent;
using System.Diagnostics;

namespace ECommerce.API.Services;

public interface IMetricsService
{
    void RecordApiCall(string endpoint, string method, int statusCode, long durationMs);
    void RecordDatabaseQuery(string operation, long durationMs);
    void RecordCacheHit(string key);
    void RecordCacheMiss(string key);
    void RecordUserAction(string userId, string action);
    Task LogPerformanceMetricsAsync();
}

public class MetricsService : IMetricsService
{
    private readonly ILogger<MetricsService> _logger;
    private readonly ConcurrentDictionary<string, ApiMetrics> _apiMetrics = new();
    private readonly ConcurrentDictionary<string, DatabaseMetrics> _dbMetrics = new();
    private readonly ConcurrentDictionary<string, CacheMetrics> _cacheMetrics = new();
    private readonly ConcurrentDictionary<string, int> _userActions = new();

    public MetricsService(ILogger<MetricsService> logger)
    {
        _logger = logger;
        
        // Start background task to periodically log metrics
        Task.Run(async () =>
        {
            while (true)
            {
                await Task.Delay(TimeSpan.FromMinutes(5)); // Log every 5 minutes
                await LogPerformanceMetricsAsync();
            }
        });
    }

    public void RecordApiCall(string endpoint, string method, int statusCode, long durationMs)
    {
        var key = $"{method}:{endpoint}";
        _apiMetrics.AddOrUpdate(key, 
            new ApiMetrics { Endpoint = endpoint, Method = method, TotalCalls = 1, TotalDurationMs = durationMs, StatusCodes = new ConcurrentDictionary<int, int> { [statusCode] = 1 } },
            (k, existing) => 
            {
                existing.TotalCalls++;
                existing.TotalDurationMs += durationMs;
                existing.StatusCodes.AddOrUpdate(statusCode, 1, (sc, count) => count + 1);
                existing.LastCallTime = DateTime.UtcNow;
                if (durationMs > existing.MaxDurationMs) existing.MaxDurationMs = durationMs;
                if (durationMs < existing.MinDurationMs) existing.MinDurationMs = durationMs;
                return existing;
            });

        // Log slow requests immediately
        if (durationMs > 1000) // More than 1 second
        {
            Log.Warning("Slow API call detected: {Method} {Endpoint} took {Duration}ms with status {StatusCode}",
                method, endpoint, durationMs, statusCode);
        }
    }

    public void RecordDatabaseQuery(string operation, long durationMs)
    {
        _dbMetrics.AddOrUpdate(operation,
            new DatabaseMetrics { Operation = operation, TotalQueries = 1, TotalDurationMs = durationMs, MaxDurationMs = durationMs, MinDurationMs = durationMs },
            (k, existing) =>
            {
                existing.TotalQueries++;
                existing.TotalDurationMs += durationMs;
                if (durationMs > existing.MaxDurationMs) existing.MaxDurationMs = durationMs;
                if (durationMs < existing.MinDurationMs) existing.MinDurationMs = durationMs;
                existing.LastQueryTime = DateTime.UtcNow;
                return existing;
            });

        // Log slow queries immediately
        if (durationMs > 500) // More than 500ms
        {
            Log.Warning("Slow database query detected: {Operation} took {Duration}ms", operation, durationMs);
        }
    }

    public void RecordCacheHit(string key)
    {
        _cacheMetrics.AddOrUpdate(key,
            new CacheMetrics { Key = key, Hits = 1, Misses = 0 },
            (k, existing) => { existing.Hits++; return existing; });
    }

    public void RecordCacheMiss(string key)
    {
        _cacheMetrics.AddOrUpdate(key,
            new CacheMetrics { Key = key, Hits = 0, Misses = 1 },
            (k, existing) => { existing.Misses++; return existing; });
    }

    public void RecordUserAction(string userId, string action)
    {
        var key = $"{userId}:{action}";
        _userActions.AddOrUpdate(key, 1, (k, count) => count + 1);
    }

    public Task LogPerformanceMetricsAsync()
    {
        try
        {
            var currentTime = DateTime.UtcNow;
            
            // Log API metrics
            foreach (var metric in _apiMetrics.Values)
            {
                var avgDuration = metric.TotalCalls > 0 ? metric.TotalDurationMs / metric.TotalCalls : 0;
                
                Log.Information("API Metrics: {Endpoint} [{Method}] - Calls: {TotalCalls}, Avg: {AvgDuration}ms, Min: {MinDuration}ms, Max: {MaxDuration}ms, Status Codes: {StatusCodes}",
                    metric.Endpoint, metric.Method, metric.TotalCalls, avgDuration, 
                    metric.MinDurationMs, metric.MaxDurationMs, 
                    string.Join(", ", metric.StatusCodes.Select(sc => $"{sc.Key}: {sc.Value}")));
            }

            // Log Database metrics
            foreach (var metric in _dbMetrics.Values)
            {
                var avgDuration = metric.TotalQueries > 0 ? metric.TotalDurationMs / metric.TotalQueries : 0;
                
                Log.Information("DB Metrics: {Operation} - Queries: {TotalQueries}, Avg: {AvgDuration}ms, Min: {MinDuration}ms, Max: {MaxDuration}ms",
                    metric.Operation, metric.TotalQueries, avgDuration, metric.MinDurationMs, metric.MaxDurationMs);
            }

            // Log Cache metrics
            var totalCacheOperations = _cacheMetrics.Values.Sum(c => c.Hits + c.Misses);
            var totalCacheHits = _cacheMetrics.Values.Sum(c => c.Hits);
            var cacheHitRate = totalCacheOperations > 0 ? (double)totalCacheHits / totalCacheOperations * 100 : 0;
            
            if (totalCacheOperations > 0)
            {
                Log.Information("Cache Metrics: Total Operations: {TotalOperations}, Hits: {Hits}, Hit Rate: {HitRate:F2}%",
                    totalCacheOperations, totalCacheHits, cacheHitRate);
            }

            // Log User action metrics
            var uniqueUsers = _userActions.Keys.Select(k => k.Split(':')[0]).Distinct().Count();
            var totalActions = _userActions.Values.Sum();
            
            if (totalActions > 0)
            {
                Log.Information("User Activity Metrics: Unique Users: {UniqueUsers}, Total Actions: {TotalActions}",
                    uniqueUsers, totalActions);
            }

            // Log system metrics
            var process = Process.GetCurrentProcess();
            var memoryUsage = process.WorkingSet64 / 1024 / 1024; // MB
            var cpuTime = process.TotalProcessorTime.TotalMilliseconds;
            
            Log.Information("System Metrics: Memory Usage: {MemoryMB}MB, CPU Time: {CpuTimeMs}ms, Threads: {ThreadCount}",
                memoryUsage, cpuTime, process.Threads.Count);

        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error logging performance metrics");
        }
        
        return Task.CompletedTask;
    }
}

public class ApiMetrics
{
    public string Endpoint { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public int TotalCalls { get; set; }
    public long TotalDurationMs { get; set; }
    public long MaxDurationMs { get; set; }
    public long MinDurationMs { get; set; } = long.MaxValue;
    public ConcurrentDictionary<int, int> StatusCodes { get; set; } = new();
    public DateTime LastCallTime { get; set; } = DateTime.UtcNow;
}

public class DatabaseMetrics
{
    public string Operation { get; set; } = string.Empty;
    public int TotalQueries { get; set; }
    public long TotalDurationMs { get; set; }
    public long MaxDurationMs { get; set; }
    public long MinDurationMs { get; set; } = long.MaxValue;
    public DateTime LastQueryTime { get; set; } = DateTime.UtcNow;
}

public class CacheMetrics
{
    public string Key { get; set; } = string.Empty;
    public int Hits { get; set; }
    public int Misses { get; set; }
}