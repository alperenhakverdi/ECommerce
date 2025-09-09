using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;
using System.Reflection;
using ECommerce.Infrastructure.Data;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly HealthCheckService _healthCheckService;
    private readonly ECommerceDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        HealthCheckService healthCheckService, 
        ECommerceDbContext context,
        ILogger<HealthController> logger)
    {
        _healthCheckService = healthCheckService;
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var healthReport = await _healthCheckService.CheckHealthAsync();

        var response = new
        {
            status = healthReport.Status.ToString(),
            checks = healthReport.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds,
                data = e.Value.Data
            }),
            totalDuration = healthReport.TotalDuration.TotalMilliseconds
        };

        return healthReport.Status == HealthStatus.Healthy 
            ? Ok(response) 
            : StatusCode(503, response);
    }

    [HttpGet("detailed")]
    public async Task<IActionResult> GetDetailed()
    {
        var healthReport = await _healthCheckService.CheckHealthAsync();
        var process = Process.GetCurrentProcess();
        var assembly = Assembly.GetExecutingAssembly();
        
        var response = new
        {
            status = healthReport.Status.ToString(),
            timestamp = DateTime.UtcNow,
            application = new
            {
                name = "ECommerce.API",
                version = assembly.GetName().Version?.ToString() ?? "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            },
            system = new
            {
                machineName = Environment.MachineName,
                osVersion = Environment.OSVersion.ToString(),
                processorCount = Environment.ProcessorCount,
                workingSet = process.WorkingSet64,
                privateMemory = process.PrivateMemorySize64,
                uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime(),
                threadCount = process.Threads.Count
            },
            checks = healthReport.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds,
                exception = e.Value.Exception?.Message,
                data = e.Value.Data.ToDictionary(kv => kv.Key, kv => kv.Value?.ToString())
            }),
            totalDuration = healthReport.TotalDuration.TotalMilliseconds
        };

        return healthReport.Status == HealthStatus.Healthy 
            ? Ok(response) 
            : StatusCode(503, response);
    }

    [HttpGet("ready")]
    public async Task<IActionResult> GetReady()
    {
        try
        {
            // Check database connectivity
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                return StatusCode(503, new { status = "Not Ready", reason = "Database connection failed" });
            }

            return Ok(new { status = "Ready", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Readiness check failed");
            return StatusCode(503, new { status = "Not Ready", reason = ex.Message });
        }
    }

    [HttpGet("live")]
    public IActionResult GetLive()
    {
        return Ok(new 
        { 
            status = "Alive", 
            timestamp = DateTime.UtcNow,
            uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()
        });
    }

    [HttpGet("metrics")]
    public IActionResult GetMetrics()
    {
        var process = Process.GetCurrentProcess();
        var gcInfo = GC.GetTotalMemory(false);
        
        var metrics = new
        {
            timestamp = DateTime.UtcNow,
            memory = new
            {
                workingSet = process.WorkingSet64,
                privateMemory = process.PrivateMemorySize64,
                gcMemory = gcInfo,
                gen0Collections = GC.CollectionCount(0),
                gen1Collections = GC.CollectionCount(1),
                gen2Collections = GC.CollectionCount(2)
            },
            cpu = new
            {
                totalProcessorTime = process.TotalProcessorTime.TotalMilliseconds,
                userProcessorTime = process.UserProcessorTime.TotalMilliseconds,
                privilegedProcessorTime = process.PrivilegedProcessorTime.TotalMilliseconds
            },
            threads = new
            {
                threadCount = process.Threads.Count,
                threadPoolWorkerThreads = ThreadPool.ThreadCount,
                threadPoolCompletionPortThreads = ThreadPool.CompletedWorkItemCount
            },
            handles = process.HandleCount,
            uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime()
        };

        return Ok(metrics);
    }

    [HttpGet("version")]
    public IActionResult GetVersion()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var version = assembly.GetName().Version;
        var buildDate = System.IO.File.GetLastWriteTime(assembly.Location);
        
        var versionInfo = new
        {
            version = version?.ToString() ?? "1.0.0",
            buildDate = buildDate,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            framework = Environment.Version.ToString(),
            osVersion = Environment.OSVersion.ToString(),
            machineName = Environment.MachineName
        };

        return Ok(versionInfo);
    }
}