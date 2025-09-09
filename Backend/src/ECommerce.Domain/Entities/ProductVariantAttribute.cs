using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductVariantAttribute : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public Guid ProductAttributeId { get; set; }
    public Guid ProductAttributeValueId { get; set; }

    // Navigation properties
    public ProductVariant ProductVariant { get; set; } = null!;
    public ProductAttribute ProductAttribute { get; set; } = null!;
    public ProductAttributeValue ProductAttributeValue { get; set; } = null!;
}

// Bu entity, bir varyantın hangi özelliklere sahip olduğunu tutar
// Örnek: iPhone 15 Mavi 128GB varyantı için:
// - ProductAttributeId: "Renk" özelliği
// - ProductAttributeValueId: "Mavi" değeri