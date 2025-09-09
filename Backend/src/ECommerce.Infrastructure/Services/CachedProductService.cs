using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

/// <summary>
/// Cached wrapper around ProductService for improved performance
/// </summary>
public class CachedProductService : IProductService
{
    private readonly ProductService _productService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CachedProductService> _logger;

    // Cache key constants
    private const string ALL_PRODUCTS_KEY = "products:all";
    private const string PRODUCT_KEY_PREFIX = "product:";
    private const string CATEGORY_PRODUCTS_KEY_PREFIX = "products:category:";
    private const string SEARCH_KEY_PREFIX = "products:search:";
    private const string FILTERS_KEY = "products:filters";
    
    // Cache expiration times
    private static readonly TimeSpan ProductCacheExpiration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan AllProductsCacheExpiration = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan SearchCacheExpiration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan FiltersCacheExpiration = TimeSpan.FromMinutes(60);

    public CachedProductService(
        ProductService productService, 
        ICacheService cacheService, 
        ILogger<CachedProductService> logger)
    {
        _productService = productService;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        return await _cacheService.GetOrSetAsync(
            ALL_PRODUCTS_KEY,
            () => _productService.GetAllProductsAsync(),
            AllProductsCacheExpiration);
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id)
    {
        var key = $"{PRODUCT_KEY_PREFIX}{id}";
        return await _cacheService.GetOrSetAsync(
            key,
            () => _productService.GetProductByIdAsync(id),
            ProductCacheExpiration);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(Guid categoryId)
    {
        var key = $"{CATEGORY_PRODUCTS_KEY_PREFIX}{categoryId}";
        return await _cacheService.GetOrSetAsync(
            key,
            () => _productService.GetProductsByCategoryAsync(categoryId),
            AllProductsCacheExpiration);
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
    {
        var key = $"{SEARCH_KEY_PREFIX}{searchTerm.ToLower()}";
        return await _cacheService.GetOrSetAsync(
            key,
            () => _productService.SearchProductsAsync(searchTerm),
            SearchCacheExpiration);
    }

    public async Task<ProductSearchResponse> AdvancedSearchAsync(ProductSearchRequest request)
    {
        // Create cache key from search parameters
        var keyParts = new List<string>
        {
            "advanced",
            request.SearchTerm?.ToLower() ?? "null",
            request.CategoryId?.ToString() ?? "null",
            request.MinPrice?.ToString() ?? "null",
            request.MaxPrice?.ToString() ?? "null",
            request.InStockOnly?.ToString() ?? "null",
            request.SortBy?.ToLower() ?? "null",
            request.SortDirection?.ToLower() ?? "null",
            request.Page.ToString(),
            request.PageSize.ToString()
        };
        
        var key = $"{SEARCH_KEY_PREFIX}{string.Join(":", keyParts)}";
        
        return await _cacheService.GetOrSetAsync(
            key,
            () => _productService.AdvancedSearchAsync(request),
            SearchCacheExpiration);
    }

    public async Task<ProductSearchFilters> GetSearchFiltersAsync()
    {
        return await _cacheService.GetOrSetAsync(
            FILTERS_KEY,
            () => _productService.GetSearchFiltersAsync(),
            FiltersCacheExpiration);
    }

    // Write operations invalidate cache
    public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        _logger.LogInformation("Creating product, invalidating product caches");
        
        var result = await _productService.CreateProductAsync(createProductDto);
        
        // Invalidate relevant caches
        await InvalidateProductCaches();
        
        return result;
    }

    public async Task<ProductDto?> UpdateProductAsync(Guid id, UpdateProductDto updateProductDto)
    {
        _logger.LogInformation("Updating product {ProductId}, invalidating product caches", id);
        
        var result = await _productService.UpdateProductAsync(id, updateProductDto);
        
        if (result != null)
        {
            // Invalidate specific product and related caches
            await InvalidateProductCaches();
            await _cacheService.RemoveAsync($"{PRODUCT_KEY_PREFIX}{id}");
        }
        
        return result;
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        _logger.LogInformation("Deleting product {ProductId}, invalidating product caches", id);
        
        var result = await _productService.DeleteProductAsync(id);
        
        if (result)
        {
            // Invalidate all product caches
            await InvalidateProductCaches();
            await _cacheService.RemoveAsync($"{PRODUCT_KEY_PREFIX}{id}");
        }
        
        return result;
    }

    private async Task InvalidateProductCaches()
    {
        try
        {
            var tasks = new List<Task>
            {
                _cacheService.RemoveAsync(ALL_PRODUCTS_KEY),
                _cacheService.RemoveAsync(FILTERS_KEY),
                _cacheService.RemoveByPatternAsync($"{CATEGORY_PRODUCTS_KEY_PREFIX}*"),
                _cacheService.RemoveByPatternAsync($"{SEARCH_KEY_PREFIX}*")
            };

            await Task.WhenAll(tasks);
            _logger.LogDebug("Successfully invalidated product caches");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating product caches");
        }
    }

    // Store-related methods - delegate to underlying service without caching for now
    public async Task<IEnumerable<ProductDto>> GetProductsByStoreAsync(Guid storeId)
    {
        return await _productService.GetProductsByStoreAsync(storeId);
    }

    public async Task<ProductDto> CreateProductForStoreAsync(Guid storeId, CreateProductDto createProductDto)
    {
        var result = await _productService.CreateProductForStoreAsync(storeId, createProductDto);
        await InvalidateProductCaches(); // Invalidate cache after creation
        return result;
    }

    public async Task<ProductDto?> UpdateProductForStoreAsync(Guid productId, Guid storeId, UpdateProductDto updateProductDto)
    {
        var result = await _productService.UpdateProductForStoreAsync(productId, storeId, updateProductDto);
        if (result != null)
        {
            await InvalidateProductCaches(); // Invalidate cache after update
        }
        return result;
    }

    public async Task<bool> DeleteProductForStoreAsync(Guid productId, Guid storeId)
    {
        var result = await _productService.DeleteProductForStoreAsync(productId, storeId);
        if (result)
        {
            await InvalidateProductCaches(); // Invalidate cache after deletion
        }
        return result;
    }

    public async Task<bool> CanUserManageProductAsync(Guid productId, Guid userId)
    {
        return await _productService.CanUserManageProductAsync(productId, userId);
    }
}