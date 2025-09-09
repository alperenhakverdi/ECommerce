namespace ECommerce.Application.DTOs;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public decimal? PriceAdjustment { get; set; }
    public decimal FinalPrice { get; set; } // BasePrice + PriceAdjustment
    public int Stock { get; set; }
    public decimal Weight { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    
    public List<ProductVariantAttributeDto> Attributes { get; set; } = new();
}

public class ProductVariantAttributeDto
{
    public Guid Id { get; set; }
    public Guid ProductAttributeId { get; set; }
    public string AttributeName { get; set; } = string.Empty; // "Renk", "Beden"
    public string AttributeDisplayName { get; set; } = string.Empty;
    public AttributeType AttributeType { get; set; }
    
    public Guid ProductAttributeValueId { get; set; }
    public string Value { get; set; } = string.Empty; // "Mavi", "Large"
    public string? ColorCode { get; set; }
    public string? ValueImageUrl { get; set; }
}

public enum AttributeType
{
    Text = 0,
    Number = 1,
    Color = 2,
    Image = 3
}