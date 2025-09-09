using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public long OrderNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public Guid AddressId { get; set; }
    public AddressResponseDto ShippingAddress { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal SubTotal { get; set; }
}

public class CreateOrderDto
{
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public Guid AddressId { get; set; }
}

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}

public class OrderTrackingDto
{
    public Guid Id { get; set; }
    public long OrderNumber { get; set; }
    public OrderStatus Status { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    public AddressResponseDto ShippingAddress { get; set; } = null!;
    public List<OrderTrackingItemDto> Items { get; set; } = new();
    public List<OrderTrackingEventDto> TrackingEvents { get; set; } = new();
    public string? TrackingNumber { get; set; }
    public string? EstimatedDeliveryTime { get; set; }
}

public class OrderTrackingItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal SubTotal { get; set; }
}

public class OrderTrackingEventDto
{
    public DateTime Timestamp { get; set; }
    public OrderStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
}

