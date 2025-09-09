using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Store : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    
    // Contact Information
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    
    // Business Information
    public string BusinessAddress { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    
    // Status & Metrics
    public StoreStatus Status { get; set; } = StoreStatus.Pending;
    public bool IsActive { get; set; } = true; // Keep for backward compatibility
    public bool IsApproved { get; set; } = false; // Keep for backward compatibility
    public string? SuspensionReason { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public decimal Rating { get; set; } = 0;
    public int TotalSales { get; set; } = 0;
    public int TotalProducts { get; set; } = 0;
    
    // Store Owner
    public Guid OwnerId { get; set; }
    
    // Navigation properties
    public ApplicationUser Owner { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}