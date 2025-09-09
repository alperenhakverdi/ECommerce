using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ProductVariantId { get; set; } // Siparişteki varyant
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at the time of order
    public string ProductName { get; set; } = string.Empty; // Snapshot of product name
    public string? VariantInfo { get; set; } // Varyant bilgisi snapshot (JSON: {"Renk":"Mavi","Beden":"L"})

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariant? ProductVariant { get; set; } // Seçilen varyant (varsa)
}