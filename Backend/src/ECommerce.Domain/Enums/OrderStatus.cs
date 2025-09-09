namespace ECommerce.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,        // Order created, awaiting payment
    Paid = 2,           // Payment confirmed, ready for processing
    Processing = 3,     // Order is being prepared/packaged
    Shipped = 4,        // Order has been shipped
    Delivered = 5,      // Order delivered to customer
    Cancelled = 6,      // Order cancelled by customer or admin
    Refunded = 7        // Payment refunded (after cancellation)
}