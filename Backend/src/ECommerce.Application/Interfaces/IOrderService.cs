using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto createOrderDto);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId);
    Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId);
    Task<bool> UpdateOrderStatusAsync(Guid orderId, Domain.Enums.OrderStatus status);
    Task<OrderTrackingDto?> GetOrderTrackingAsync(Guid orderId);
    Task<OrderTrackingDto?> GetOrderTrackingByEmailAsync(Guid orderId, string customerEmail);
}