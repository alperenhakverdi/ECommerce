using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductAttributeValue : BaseEntity
{
    public Guid ProductAttributeId { get; set; }
    public string Value { get; set; } = string.Empty; // "Mavi", "Large", "128GB"
    public string? ColorCode { get; set; } // Renk için hex kod: "#0066CC"
    public string? ImageUrl { get; set; } // Görsel varsa URL
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ProductAttribute ProductAttribute { get; set; } = null!;
    public ICollection<ProductVariantAttribute> ProductVariantAttributes { get; set; } = new List<ProductVariantAttribute>();
}