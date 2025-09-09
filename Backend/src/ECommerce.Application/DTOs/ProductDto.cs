namespace ECommerce.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; } // Display price (from default variant or base price)
    public decimal BasePrice { get; set; } // Base price for variants
    public int Stock { get; set; } // Total stock across all variants
    public string ImageUrl { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool HasVariants { get; set; }
    public decimal Weight { get; set; }
    public string? Tags { get; set; }
    
    // Store information
    public Guid? StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    
    // Variant information
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<ProductAttributeDto> AvailableAttributes { get; set; } = new();
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; } // Ana fiyat
    public decimal Price { get; set; } // Backward compatibility
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid? StoreId { get; set; } // Optional for admin, required for store owners
    public bool HasVariants { get; set; } = false;
    public decimal Weight { get; set; } = 0;
    public string? Tags { get; set; }
    
    // Varyant oluşturma (opsiyonel)
    public List<CreateProductVariantRequest> Variants { get; set; } = new();
}

public class CreateProductVariantRequest
{
    public string SKU { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public decimal? PriceAdjustment { get; set; } = 0;
    public int Stock { get; set; }
    public decimal Weight { get; set; } = 0;
    public string? ImageUrl { get; set; }
    public bool IsDefault { get; set; } = false;
    
    // Varyant özelliklerini tanımlama: [{"AttributeId": "guid", "ValueId": "guid"}]
    public List<CreateProductVariantAttributeRequest> Attributes { get; set; } = new();
}

public class CreateProductVariantAttributeRequest
{
    public Guid ProductAttributeId { get; set; }
    public Guid ProductAttributeValueId { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public bool IsActive { get; set; }
    public Guid? StoreId { get; set; } // Can be updated by admin only
}