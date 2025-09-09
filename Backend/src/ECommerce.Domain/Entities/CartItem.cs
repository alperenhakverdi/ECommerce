using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ProductVariantId { get; set; } // Varyant seçimi (opsiyonel)
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at the time of adding to cart

    // Navigation properties
    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariant? ProductVariant { get; set; } // Seçilen varyant (varsa)
}