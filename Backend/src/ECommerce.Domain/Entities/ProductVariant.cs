using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public string SKU { get; set; } = string.Empty; // Stok kodu: "IPH15-BLU-128"
    public string? VariantName { get; set; } // "iPhone 15 Mavi 128GB"
    public decimal? PriceAdjustment { get; set; } = 0; // Ana fiyattan fark (+50 TL vb.)
    public int Stock { get; set; } = 0;
    public decimal Weight { get; set; } = 0; // Ağırlık (gram)
    public string? ImageUrl { get; set; } // Varyanta özel görsel
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false; // Varsayılan varyant

    // Navigation properties
    public Product Product { get; set; } = null!;
    public ICollection<ProductVariantAttribute> ProductVariantAttributes { get; set; } = new List<ProductVariantAttribute>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}