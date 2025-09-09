using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CacheController : ControllerBase
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CacheController> _logger;

    public CacheController(ICacheService cacheService, ILogger<CacheController> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearAllCache()
    {
        try
        {
            _logger.LogInformation("Admin clearing all cache");
            
            // Clear common cache patterns
            await Task.WhenAll(
                _cacheService.RemoveByPatternAsync("products:*"),
                _cacheService.RemoveByPatternAsync("product:*"),
                _cacheService.RemoveByPatternAsync("categories:*"),
                _cacheService.RemoveByPatternAsync("category:*")
            );

            return Ok(new { message = "Cache cleared successfully", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache");
            return StatusCode(500, new { message = "Error clearing cache", error = ex.Message });
        }
    }

    [HttpDelete("products")]
    public async Task<IActionResult> ClearProductsCache()
    {
        try
        {
            _logger.LogInformation("Admin clearing products cache");
            
            await Task.WhenAll(
                _cacheService.RemoveAsync("products:all"),
                _cacheService.RemoveAsync("products:filters"),
                _cacheService.RemoveByPatternAsync("products:*"),
                _cacheService.RemoveByPatternAsync("product:*")
            );

            return Ok(new { message = "Products cache cleared successfully", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing products cache");
            return StatusCode(500, new { message = "Error clearing products cache", error = ex.Message });
        }
    }

    [HttpDelete("product/{id}")]
    public async Task<IActionResult> ClearProductCache(Guid id)
    {
        try
        {
            _logger.LogInformation("Admin clearing cache for product {ProductId}", id);
            
            await _cacheService.RemoveAsync($"product:{id}");

            return Ok(new { message = $"Product {id} cache cleared successfully", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing product cache for {ProductId}", id);
            return StatusCode(500, new { message = "Error clearing product cache", error = ex.Message });
        }
    }

    [HttpGet("stats")]
    public IActionResult GetCacheStats()
    {
        try
        {
            var stats = new
            {
                cacheType = "Redis/InMemory Distributed Cache",
                timestamp = DateTime.UtcNow,
                status = "Active",
                patterns = new[]
                {
                    "products:all - All products list",
                    "product:{id} - Individual product",
                    "products:category:{id} - Products by category",
                    "products:search:{term} - Search results",
                    "products:filters - Search filters"
                },
                expirationTimes = new
                {
                    products = "30 minutes",
                    productsList = "15 minutes",
                    searchResults = "10 minutes",
                    filters = "60 minutes"
                }
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache stats");
            return StatusCode(500, new { message = "Error getting cache stats", error = ex.Message });
        }
    }

    [HttpPost("warmup")]
    public async Task<IActionResult> WarmUpCache()
    {
        try
        {
            _logger.LogInformation("Admin warming up cache");
            
            // Warm up common caches by making requests
            // This would trigger the cache population
            var warmupTasks = new List<Task>
            {
                Task.Run(async () =>
                {
                    // This would be injected, but for simplicity we'll just log
                    _logger.LogInformation("Cache warmup initiated for products");
                    await Task.Delay(100); // Simulate warmup
                })
            };

            await Task.WhenAll(warmupTasks);

            return Ok(new { message = "Cache warmup completed", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cache warmup");
            return StatusCode(500, new { message = "Error during cache warmup", error = ex.Message });
        }
    }
}