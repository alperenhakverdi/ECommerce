using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; } // Ana fiyat (varyantlar buna göre hesaplanır)
    public decimal Price { get; set; } // Mevcut fiyat (backward compatibility için)
    public int Stock { get; set; } // Toplam stok (tüm varyantların toplamı)
    public string ImageUrl { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid? StoreId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool HasVariants { get; set; } = false; // Bu ürünün varyantları var mı?
    public decimal Weight { get; set; } = 0; // Ağırlık (gram) - kargo hesaplaması için
    public string? Tags { get; set; } // Arama etiketleri (JSON array olarak saklanabilir)

    // Navigation properties
    public Category Category { get; set; } = null!;
    public Store? Store { get; set; }
    public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<RecentlyViewed> RecentlyViewed { get; set; } = new List<RecentlyViewed>();
}