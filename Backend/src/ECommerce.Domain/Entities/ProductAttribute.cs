using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductAttribute : BaseEntity
{
    public string Name { get; set; } = string.Empty; // "Renk", "Beden", "Kapasite"
    public string DisplayName { get; set; } = string.Empty; // "Color", "Size", "Storage"
    public AttributeType Type { get; set; } = AttributeType.Text;
    public bool IsRequired { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<ProductAttributeValue> Values { get; set; } = new List<ProductAttributeValue>();
    public ICollection<ProductVariantAttribute> ProductVariantAttributes { get; set; } = new List<ProductVariantAttribute>();
}

public enum AttributeType
{
    Text = 0,
    Number = 1,
    Color = 2,
    Image = 3
}