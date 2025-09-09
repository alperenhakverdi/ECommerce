using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;

namespace ECommerce.API.HealthChecks;

public class MemoryHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var process = Process.GetCurrentProcess();
        var memoryUsedMB = process.WorkingSet64 / 1024 / 1024;
        
        // Consider unhealthy if using more than 500MB
        if (memoryUsedMB > 500)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy($"Memory usage is too high: {memoryUsedMB}MB"));
        }
        
        // Consider degraded if using more than 250MB
        if (memoryUsedMB > 250)
        {
            return Task.FromResult(HealthCheckResult.Degraded($"Memory usage is high: {memoryUsedMB}MB"));
        }
        
        return Task.FromResult(HealthCheckResult.Healthy($"Memory usage is normal: {memoryUsedMB}MB"));
    }
}

public class DiskSpaceHealthCheck : IHealthCheck
{
    private readonly string _driveName;
    
    public DiskSpaceHealthCheck(string driveName = "/")
    {
        _driveName = driveName;
    }
    
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var driveInfo = new DriveInfo(_driveName);
            var freeSpaceGB = driveInfo.AvailableFreeSpace / 1024 / 1024 / 1024;
            var totalSpaceGB = driveInfo.TotalSize / 1024 / 1024 / 1024;
            var usedPercentage = (double)(totalSpaceGB - freeSpaceGB) / totalSpaceGB * 100;
            
            if (usedPercentage > 90)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy(
                    $"Disk space is critically low: {usedPercentage:F1}% used, {freeSpaceGB}GB free"));
            }
            
            if (usedPercentage > 80)
            {
                return Task.FromResult(HealthCheckResult.Degraded(
                    $"Disk space is getting low: {usedPercentage:F1}% used, {freeSpaceGB}GB free"));
            }
            
            return Task.FromResult(HealthCheckResult.Healthy(
                $"Disk space is sufficient: {usedPercentage:F1}% used, {freeSpaceGB}GB free"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy($"Error checking disk space: {ex.Message}"));
        }
    }
}

public class CpuHealthCheck : IHealthCheck
{
    private static DateTime _lastCheck = DateTime.MinValue;
    private static TimeSpan _lastCpuTime = TimeSpan.Zero;
    private static double _lastCpuUsage = 0;
    
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var currentTime = DateTime.UtcNow;
            var currentCpuTime = process.TotalProcessorTime;
            
            double cpuUsage = 0;
            
            if (_lastCheck != DateTime.MinValue)
            {
                var timeDiff = (currentTime - _lastCheck).TotalMilliseconds;
                var cpuDiff = (currentCpuTime - _lastCpuTime).TotalMilliseconds;
                
                if (timeDiff > 0)
                {
                    cpuUsage = (cpuDiff / timeDiff / Environment.ProcessorCount) * 100;
                }
            }
            
            _lastCheck = currentTime;
            _lastCpuTime = currentCpuTime;
            _lastCpuUsage = cpuUsage;
            
            if (cpuUsage > 80)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy($"CPU usage is too high: {cpuUsage:F1}%"));
            }
            
            if (cpuUsage > 60)
            {
                return Task.FromResult(HealthCheckResult.Degraded($"CPU usage is high: {cpuUsage:F1}%"));
            }
            
            return Task.FromResult(HealthCheckResult.Healthy($"CPU usage is normal: {cpuUsage:F1}%"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy($"Error checking CPU usage: {ex.Message}"));
        }
    }
}

public class LogFileHealthCheck : IHealthCheck
{
    private readonly string _logDirectory;
    
    public LogFileHealthCheck(string logDirectory = "logs")
    {
        _logDirectory = logDirectory;
    }
    
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!Directory.Exists(_logDirectory))
            {
                return Task.FromResult(HealthCheckResult.Degraded("Log directory does not exist"));
            }
            
            var logFiles = Directory.GetFiles(_logDirectory, "*.txt");
            var recentLogFile = logFiles.OrderByDescending(f => File.GetLastWriteTime(f)).FirstOrDefault();
            
            if (recentLogFile == null)
            {
                return Task.FromResult(HealthCheckResult.Degraded("No log files found"));
            }
            
            var lastWrite = File.GetLastWriteTime(recentLogFile);
            var timeSinceLastLog = DateTime.Now - lastWrite;
            
            if (timeSinceLastLog > TimeSpan.FromMinutes(30))
            {
                return Task.FromResult(HealthCheckResult.Degraded($"No recent logs. Last log: {timeSinceLastLog.TotalMinutes:F0} minutes ago"));
            }
            
            var fileInfo = new FileInfo(recentLogFile);
            return Task.FromResult(HealthCheckResult.Healthy($"Logging is active. Recent log: {fileInfo.Name} ({fileInfo.Length / 1024}KB)"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy($"Error checking log files: {ex.Message}"));
        }
    }
}