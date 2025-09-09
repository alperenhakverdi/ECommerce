using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class ProductVariantService : IProductVariantService
{
    private readonly ECommerceDbContext _context;
    private readonly ILogger<ProductVariantService> _logger;

    public ProductVariantService(ECommerceDbContext context, ILogger<ProductVariantService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Product Variant CRUD

    public async Task<ProductVariantDto?> GetVariantByIdAsync(Guid variantId)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttribute)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttributeValue)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        return variant == null ? null : MapToVariantDto(variant);
    }

    public async Task<IEnumerable<ProductVariantDto>> GetVariantsByProductIdAsync(Guid productId)
    {
        var variants = await _context.ProductVariants
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttribute)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttributeValue)
            .Where(v => v.ProductId == productId && v.IsActive)
            .OrderBy(v => v.IsDefault ? 0 : 1) // Default variant first
            .ThenBy(v => v.CreatedAt)
            .ToListAsync();

        return variants.Select(MapToVariantDto);
    }

    public async Task<ProductVariantDto> CreateVariantAsync(Guid productId, CreateProductVariantRequest request)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            throw new ArgumentException("Product not found");

        // Check if SKU is unique
        if (await _context.ProductVariants.AnyAsync(v => v.SKU == request.SKU))
            throw new ArgumentException("SKU already exists");

        var variant = new ProductVariant
        {
            ProductId = productId,
            SKU = request.SKU,
            VariantName = request.VariantName,
            PriceAdjustment = request.PriceAdjustment,
            Stock = request.Stock,
            Weight = request.Weight,
            ImageUrl = request.ImageUrl,
            IsDefault = request.IsDefault,
            IsActive = true
        };

        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        // Add variant attributes
        foreach (var attr in request.Attributes)
        {
            var variantAttribute = new ProductVariantAttribute
            {
                ProductVariantId = variant.Id,
                ProductAttributeId = attr.ProductAttributeId,
                ProductAttributeValueId = attr.ProductAttributeValueId
            };
            _context.ProductVariantAttributes.Add(variantAttribute);
        }

        // If this is set as default, remove default from other variants
        if (request.IsDefault)
        {
            var otherVariants = await _context.ProductVariants
                .Where(v => v.ProductId == productId && v.Id != variant.Id && v.IsDefault)
                .ToListAsync();
            
            foreach (var other in otherVariants)
            {
                other.IsDefault = false;
            }
        }

        // Update product HasVariants flag
        product.HasVariants = true;

        await _context.SaveChangesAsync();

        return await GetVariantByIdAsync(variant.Id) ?? throw new Exception("Failed to retrieve created variant");
    }

    public async Task<ProductVariantDto> UpdateVariantAsync(Guid variantId, CreateProductVariantRequest request)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.ProductVariantAttributes)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null)
            throw new ArgumentException("Variant not found");

        // Check SKU uniqueness
        if (await _context.ProductVariants.AnyAsync(v => v.SKU == request.SKU && v.Id != variantId))
            throw new ArgumentException("SKU already exists");

        variant.SKU = request.SKU;
        variant.VariantName = request.VariantName;
        variant.PriceAdjustment = request.PriceAdjustment;
        variant.Stock = request.Stock;
        variant.Weight = request.Weight;
        variant.ImageUrl = request.ImageUrl;
        variant.IsDefault = request.IsDefault;

        // Update attributes - remove old ones and add new ones
        _context.ProductVariantAttributes.RemoveRange(variant.ProductVariantAttributes);

        foreach (var attr in request.Attributes)
        {
            var variantAttribute = new ProductVariantAttribute
            {
                ProductVariantId = variant.Id,
                ProductAttributeId = attr.ProductAttributeId,
                ProductAttributeValueId = attr.ProductAttributeValueId
            };
            _context.ProductVariantAttributes.Add(variantAttribute);
        }

        // Handle default variant logic
        if (request.IsDefault)
        {
            var otherVariants = await _context.ProductVariants
                .Where(v => v.ProductId == variant.ProductId && v.Id != variant.Id && v.IsDefault)
                .ToListAsync();
            
            foreach (var other in otherVariants)
            {
                other.IsDefault = false;
            }
        }

        await _context.SaveChangesAsync();

        return await GetVariantByIdAsync(variant.Id) ?? throw new Exception("Failed to retrieve updated variant");
    }

    public async Task<bool> DeleteVariantAsync(Guid variantId)
    {
        var variant = await _context.ProductVariants.FindAsync(variantId);
        if (variant == null) return false;

        variant.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Product Attributes Management

    public async Task<IEnumerable<ProductAttributeDto>> GetAllAttributesAsync()
    {
        var attributes = await _context.ProductAttributes
            .Include(a => a.Values.Where(v => v.IsActive))
            .Where(a => a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ThenBy(a => a.Name)
            .ToListAsync();

        return attributes.Select(MapToAttributeDto);
    }

    public async Task<ProductAttributeDto?> GetAttributeByIdAsync(Guid attributeId)
    {
        var attribute = await _context.ProductAttributes
            .Include(a => a.Values.Where(v => v.IsActive))
            .FirstOrDefaultAsync(a => a.Id == attributeId);

        return attribute == null ? null : MapToAttributeDto(attribute);
    }

    public async Task<ProductAttributeDto> CreateAttributeAsync(CreateProductAttributeRequest request)
    {
        var attribute = new ProductAttribute
        {
            Name = request.Name,
            DisplayName = request.DisplayName,
            Type = (Domain.Entities.AttributeType)request.Type,
            IsRequired = request.IsRequired,
            SortOrder = request.SortOrder,
            IsActive = true
        };

        _context.ProductAttributes.Add(attribute);
        await _context.SaveChangesAsync();

        // Add values
        foreach (var valueRequest in request.Values)
        {
            var value = new ProductAttributeValue
            {
                ProductAttributeId = attribute.Id,
                Value = valueRequest.Value,
                ColorCode = valueRequest.ColorCode,
                ImageUrl = valueRequest.ImageUrl,
                SortOrder = valueRequest.SortOrder,
                IsActive = true
            };
            _context.ProductAttributeValues.Add(value);
        }

        await _context.SaveChangesAsync();

        return await GetAttributeByIdAsync(attribute.Id) ?? throw new Exception("Failed to retrieve created attribute");
    }

    public async Task<ProductAttributeDto> UpdateAttributeAsync(Guid attributeId, CreateProductAttributeRequest request)
    {
        var attribute = await _context.ProductAttributes
            .Include(a => a.Values)
            .FirstOrDefaultAsync(a => a.Id == attributeId);

        if (attribute == null)
            throw new ArgumentException("Attribute not found");

        attribute.Name = request.Name;
        attribute.DisplayName = request.DisplayName;
        attribute.Type = (Domain.Entities.AttributeType)request.Type;
        attribute.IsRequired = request.IsRequired;
        attribute.SortOrder = request.SortOrder;

        // Update values - mark old ones inactive and add new ones
        foreach (var value in attribute.Values)
        {
            value.IsActive = false;
        }

        foreach (var valueRequest in request.Values)
        {
            var value = new ProductAttributeValue
            {
                ProductAttributeId = attribute.Id,
                Value = valueRequest.Value,
                ColorCode = valueRequest.ColorCode,
                ImageUrl = valueRequest.ImageUrl,
                SortOrder = valueRequest.SortOrder,
                IsActive = true
            };
            _context.ProductAttributeValues.Add(value);
        }

        await _context.SaveChangesAsync();

        return await GetAttributeByIdAsync(attribute.Id) ?? throw new Exception("Failed to retrieve updated attribute");
    }

    public async Task<bool> DeleteAttributeAsync(Guid attributeId)
    {
        var attribute = await _context.ProductAttributes.FindAsync(attributeId);
        if (attribute == null) return false;

        attribute.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Helper Methods

    public async Task<bool> AddAttributeToVariantAsync(Guid variantId, Guid attributeId, Guid valueId)
    {
        var existing = await _context.ProductVariantAttributes
            .FirstOrDefaultAsync(pva => pva.ProductVariantId == variantId && 
                                      pva.ProductAttributeId == attributeId);

        if (existing != null)
        {
            existing.ProductAttributeValueId = valueId; // Update existing
        }
        else
        {
            var variantAttribute = new ProductVariantAttribute
            {
                ProductVariantId = variantId,
                ProductAttributeId = attributeId,
                ProductAttributeValueId = valueId
            };
            _context.ProductVariantAttributes.Add(variantAttribute);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveAttributeFromVariantAsync(Guid variantId, Guid attributeId)
    {
        var variantAttribute = await _context.ProductVariantAttributes
            .FirstOrDefaultAsync(pva => pva.ProductVariantId == variantId && 
                                      pva.ProductAttributeId == attributeId);

        if (variantAttribute == null) return false;

        _context.ProductVariantAttributes.Remove(variantAttribute);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateVariantStockAsync(Guid variantId, int newStock)
    {
        var variant = await _context.ProductVariants.FindAsync(variantId);
        if (variant == null) return false;

        variant.Stock = newStock;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> CalculateFinalPriceAsync(Guid variantId)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null) return 0;

        return variant.Product.BasePrice + (variant.PriceAdjustment ?? 0);
    }

    public async Task<bool> CheckVariantAvailabilityAsync(Guid variantId, int quantity)
    {
        var variant = await _context.ProductVariants.FindAsync(variantId);
        return variant != null && variant.IsActive && variant.Stock >= quantity;
    }

    public async Task<IEnumerable<ProductVariantDto>> SearchVariantsByAttributesAsync(Dictionary<string, string> attributes)
    {
        var query = _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttribute)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttributeValue)
            .Where(v => v.IsActive);

        // Apply attribute filters
        foreach (var attr in attributes)
        {
            query = query.Where(v => v.ProductVariantAttributes
                .Any(pva => pva.ProductAttribute.Name == attr.Key && 
                           pva.ProductAttributeValue.Value == attr.Value));
        }

        var results = await query.ToListAsync();
        return results.Select(MapToVariantDto);
    }

    public async Task<ProductVariantDto?> GetDefaultVariantForProductAsync(Guid productId)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttribute)
            .Include(v => v.ProductVariantAttributes)
                .ThenInclude(pva => pva.ProductAttributeValue)
            .FirstOrDefaultAsync(v => v.ProductId == productId && v.IsDefault && v.IsActive);

        return variant == null ? null : MapToVariantDto(variant);
    }

    #endregion

    #region Private Mapping Methods

    private static ProductVariantDto MapToVariantDto(ProductVariant variant)
    {
        return new ProductVariantDto
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            SKU = variant.SKU,
            VariantName = variant.VariantName,
            PriceAdjustment = variant.PriceAdjustment,
            FinalPrice = variant.Product.BasePrice + (variant.PriceAdjustment ?? 0),
            Stock = variant.Stock,
            Weight = variant.Weight,
            ImageUrl = variant.ImageUrl,
            IsActive = variant.IsActive,
            IsDefault = variant.IsDefault,
            Attributes = variant.ProductVariantAttributes.Select(pva => new ProductVariantAttributeDto
            {
                Id = pva.Id,
                ProductAttributeId = pva.ProductAttributeId,
                AttributeName = pva.ProductAttribute.Name,
                AttributeDisplayName = pva.ProductAttribute.DisplayName,
                AttributeType = (Application.DTOs.AttributeType)pva.ProductAttribute.Type,
                ProductAttributeValueId = pva.ProductAttributeValueId,
                Value = pva.ProductAttributeValue.Value,
                ColorCode = pva.ProductAttributeValue.ColorCode,
                ValueImageUrl = pva.ProductAttributeValue.ImageUrl
            }).ToList()
        };
    }

    private static ProductAttributeDto MapToAttributeDto(ProductAttribute attribute)
    {
        return new ProductAttributeDto
        {
            Id = attribute.Id,
            Name = attribute.Name,
            DisplayName = attribute.DisplayName,
            Type = (Application.DTOs.AttributeType)attribute.Type,
            IsRequired = attribute.IsRequired,
            SortOrder = attribute.SortOrder,
            IsActive = attribute.IsActive,
            Values = attribute.Values.Where(v => v.IsActive).Select(v => new ProductAttributeValueDto
            {
                Id = v.Id,
                ProductAttributeId = v.ProductAttributeId,
                Value = v.Value,
                ColorCode = v.ColorCode,
                ImageUrl = v.ImageUrl,
                SortOrder = v.SortOrder,
                IsActive = v.IsActive
            }).OrderBy(v => v.SortOrder).ToList()
        };
    }

    #endregion
}