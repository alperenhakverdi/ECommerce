using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public long OrderNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }

    // Foreign Key for Address
    public Guid AddressId { get; set; }
    
    // Foreign Key for Store (optional - multi-vendor orders may not belong to single store)
    public Guid? StoreId { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Address ShippingAddress { get; set; } = null!;
    public Store? Store { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}