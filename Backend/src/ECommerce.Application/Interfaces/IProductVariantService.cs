using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IProductVariantService
{
    // Product Variant CRUD
    Task<ProductVariantDto?> GetVariantByIdAsync(Guid variantId);
    Task<IEnumerable<ProductVariantDto>> GetVariantsByProductIdAsync(Guid productId);
    Task<ProductVariantDto> CreateVariantAsync(Guid productId, CreateProductVariantRequest request);
    Task<ProductVariantDto> UpdateVariantAsync(Guid variantId, CreateProductVariantRequest request);
    Task<bool> DeleteVariantAsync(Guid variantId);
    
    // Product Attributes Management
    Task<IEnumerable<ProductAttributeDto>> GetAllAttributesAsync();
    Task<ProductAttributeDto?> GetAttributeByIdAsync(Guid attributeId);
    Task<ProductAttributeDto> CreateAttributeAsync(CreateProductAttributeRequest request);
    Task<ProductAttributeDto> UpdateAttributeAsync(Guid attributeId, CreateProductAttributeRequest request);
    Task<bool> DeleteAttributeAsync(Guid attributeId);
    
    // Variant-Attribute relationship
    Task<bool> AddAttributeToVariantAsync(Guid variantId, Guid attributeId, Guid valueId);
    Task<bool> RemoveAttributeFromVariantAsync(Guid variantId, Guid attributeId);
    
    // Stock & Pricing helpers
    Task<bool> UpdateVariantStockAsync(Guid variantId, int newStock);
    Task<decimal> CalculateFinalPriceAsync(Guid variantId);
    Task<bool> CheckVariantAvailabilityAsync(Guid variantId, int quantity);
    
    // Advanced queries
    Task<IEnumerable<ProductVariantDto>> SearchVariantsByAttributesAsync(Dictionary<string, string> attributes);
    Task<ProductVariantDto?> GetDefaultVariantForProductAsync(Guid productId);
}