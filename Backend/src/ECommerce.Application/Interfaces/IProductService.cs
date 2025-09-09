using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(Guid id);
    Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(Guid categoryId);
    Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
    Task<ProductDto?> UpdateProductAsync(Guid id, UpdateProductDto updateProductDto);
    Task<bool> DeleteProductAsync(Guid id);
    Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
    Task<ProductSearchResponse> AdvancedSearchAsync(ProductSearchRequest request);
    Task<ProductSearchFilters> GetSearchFiltersAsync();
    
    // Store-related methods
    Task<IEnumerable<ProductDto>> GetProductsByStoreAsync(Guid storeId);
    Task<ProductDto> CreateProductForStoreAsync(Guid storeId, CreateProductDto createProductDto);
    Task<ProductDto?> UpdateProductForStoreAsync(Guid productId, Guid storeId, UpdateProductDto updateProductDto);
    Task<bool> DeleteProductForStoreAsync(Guid productId, Guid storeId);
    Task<bool> CanUserManageProductAsync(Guid productId, Guid userId);
}