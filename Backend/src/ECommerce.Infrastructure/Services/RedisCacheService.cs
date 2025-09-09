using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace ECommerce.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IConnectionMultiplexer _connectionMultiplexer;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromHours(1);

    public RedisCacheService(
        IDistributedCache distributedCache,
        IConnectionMultiplexer connectionMultiplexer,
        ILogger<RedisCacheService> logger)
    {
        _distributedCache = distributedCache;
        _connectionMultiplexer = connectionMultiplexer;
        _logger = logger;
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        try
        {
            var cachedValue = await _distributedCache.GetStringAsync(key);
            
            if (string.IsNullOrEmpty(cachedValue))
            {
                _logger.LogDebug("Cache miss for key: {Key}", key);
                return null;
            }

            _logger.LogDebug("Cache hit for key: {Key}", key);
            return JsonSerializer.Deserialize<T>(cachedValue, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cached item with key: {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T item, TimeSpan expiration) where T : class
    {
        try
        {
            var serializedItem = JsonSerializer.Serialize(item, _jsonOptions);
            
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            await _distributedCache.SetStringAsync(key, serializedItem, options);
            _logger.LogDebug("Cached item with key: {Key}, expiration: {Expiration}", key, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cached item with key: {Key}", key);
        }
    }

    public async Task SetAsync<T>(string key, T item) where T : class
    {
        await SetAsync(key, item, _defaultExpiration);
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            await _distributedCache.RemoveAsync(key);
            _logger.LogDebug("Removed cached item with key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cached item with key: {Key}", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern)
    {
        try
        {
            var database = _connectionMultiplexer.GetDatabase();
            var server = _connectionMultiplexer.GetServer(_connectionMultiplexer.GetEndPoints().First());
            
            var keys = server.Keys(pattern: pattern);
            
            var keyArray = keys.ToArray();
            if (keyArray.Length > 0)
            {
                await database.KeyDeleteAsync(keyArray);
                _logger.LogDebug("Removed {Count} cached items matching pattern: {Pattern}", keyArray.Length, pattern);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cached items by pattern: {Pattern}", pattern);
        }
    }

    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            var database = _connectionMultiplexer.GetDatabase();
            return await database.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if key exists: {Key}", key);
            return false;
        }
    }

    public async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T?>> getItem, TimeSpan? expiration = null) where T : class
    {
        var cachedItem = await GetAsync<T>(key);
        
        if (cachedItem != null)
        {
            return cachedItem;
        }

        var item = await getItem();
        
        if (item != null)
        {
            await SetAsync(key, item, expiration ?? _defaultExpiration);
        }

        return item;
    }
}

/// <summary>
/// In-memory cache service for development/testing when Redis is not available
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<InMemoryCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromHours(1);

    public InMemoryCacheService(IMemoryCache memoryCache, ILogger<InMemoryCacheService> logger)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        try
        {
            if (_memoryCache.TryGetValue(key, out var cachedValue) && cachedValue is string serializedValue)
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return JsonSerializer.Deserialize<T>(serializedValue, _jsonOptions);
            }
            
            _logger.LogDebug("Cache miss for key: {Key}", key);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cached item with key: {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T item, TimeSpan expiration) where T : class
    {
        try
        {
            var serializedItem = JsonSerializer.Serialize(item, _jsonOptions);
            
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            _memoryCache.Set(key, serializedItem, options);
            _logger.LogDebug("Cached item with key: {Key}, expiration: {Expiration}", key, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cached item with key: {Key}", key);
        }
    }

    public async Task SetAsync<T>(string key, T item) where T : class
    {
        await SetAsync(key, item, _defaultExpiration);
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            _memoryCache.Remove(key);
            _logger.LogDebug("Removed cached item with key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cached item with key: {Key}", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern)
    {
        // In-memory cache doesn't support pattern removal, so this is a no-op
        _logger.LogWarning("Pattern removal not supported in in-memory cache: {Pattern}", pattern);
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            return _memoryCache.TryGetValue(key, out _);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if key exists: {Key}", key);
            return false;
        }
    }

    public async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T?>> getItem, TimeSpan? expiration = null) where T : class
    {
        var cachedItem = await GetAsync<T>(key);
        
        if (cachedItem != null)
        {
            return cachedItem;
        }

        var item = await getItem();
        
        if (item != null)
        {
            await SetAsync(key, item, expiration ?? _defaultExpiration);
        }

        return item;
    }
}