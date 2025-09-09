namespace ECommerce.Application.Interfaces;

public interface ICacheService
{
    /// <summary>
    /// Gets a cached item by key
    /// </summary>
    Task<T?> GetAsync<T>(string key) where T : class;

    /// <summary>
    /// Sets a cached item with expiration
    /// </summary>
    Task SetAsync<T>(string key, T item, TimeSpan expiration) where T : class;

    /// <summary>
    /// Sets a cached item with default expiration (1 hour)
    /// </summary>
    Task SetAsync<T>(string key, T item) where T : class;

    /// <summary>
    /// Removes a cached item
    /// </summary>
    Task RemoveAsync(string key);

    /// <summary>
    /// Removes all cached items matching a pattern
    /// </summary>
    Task RemoveByPatternAsync(string pattern);

    /// <summary>
    /// Checks if a key exists in cache
    /// </summary>
    Task<bool> ExistsAsync(string key);

    /// <summary>
    /// Gets or sets a cached item with factory function
    /// </summary>
    Task<T?> GetOrSetAsync<T>(string key, Func<Task<T?>> getItem, TimeSpan? expiration = null) where T : class;
}