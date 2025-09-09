using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;
    private readonly ICartService _cartService;
    private readonly IEmailService _emailService;

    public OrderService(IUnitOfWork unitOfWork, ECommerceDbContext context, ICartService cartService, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _context = context;
        _cartService = cartService;
        _emailService = emailService;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto createOrderDto)
    {
        var cart = await GetCartWithItemsAsync(userId);
        
        if (cart == null || !cart.Items.Any())
        {
            throw new InvalidOperationException("Cart is empty");
        }

        // Validate stock availability
        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Product.Stock < cartItem.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for product: {cartItem.Product.Name}");
            }
        }

        var order = new Order
        {
            UserId = userId,
            OrderNumber = await GenerateOrderNumberAsync(),
            CustomerEmail = createOrderDto.CustomerEmail,
            CustomerName = createOrderDto.CustomerName,
            AddressId = createOrderDto.AddressId,
            Status = OrderStatus.Pending,
            TotalAmount = cart.Items.Sum(ci => ci.Price * ci.Quantity)
        };

        await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        // Create order items and update product stock
        foreach (var cartItem in cart.Items)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product.Name,
                Quantity = cartItem.Quantity,
                Price = cartItem.Price
            };

            await _unitOfWork.OrderItems.AddAsync(orderItem);

            // Update product stock
            cartItem.Product.Stock -= cartItem.Quantity;
            await _unitOfWork.Products.UpdateAsync(cartItem.Product);
        }

        await _unitOfWork.SaveChangesAsync();

        // Clear the cart
        await _cartService.ClearCartAsync(userId);

        // Get the complete order for the response
        var orderDto = await GetOrderByIdAsync(order.Id) ?? throw new InvalidOperationException("Order not found after creation");
        
        // Send order confirmation email
        try
        {
            var orderDetails = new
            {
                OrderId = orderDto.Id.ToString(),
                CustomerName = orderDto.CustomerName,
                CustomerEmail = orderDto.CustomerEmail,
                TotalAmount = orderDto.TotalAmount,
                OrderDate = orderDto.CreatedAt,
                Status = orderDto.Status.ToString(),
                Items = orderDto.Items.Select(item => new
                {
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    Total = item.Quantity * item.Price
                }).ToList(),
                ShippingAddress = orderDto.ShippingAddress
            };

            await _emailService.SendOrderConfirmationEmailAsync(
                orderDto.CustomerEmail, 
                orderDto.Id.ToString(), 
                orderDetails);
        }
        catch (Exception ex)
        {
            // Log the email error but don't fail the order
            // In a real application, you might want to add logging here
            // The order was successful even if email failed
            Console.WriteLine($"Failed to send order confirmation email: {ex.Message}");
        }

        return orderDto;
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;

        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            OrderNumber = order.OrderNumber,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            CustomerEmail = order.CustomerEmail,
            CustomerName = order.CustomerName,
            AddressId = order.AddressId,
            ShippingAddress = MapAddressToDto(order.ShippingAddress),
            CreatedAt = order.CreatedAt,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            Items = order.Items.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                Quantity = oi.Quantity,
                Price = oi.Price,
                SubTotal = oi.Price * oi.Quantity
            }).ToList()
        };
    }

    public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.ShippingAddress)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            UserId = o.UserId,
            OrderNumber = o.OrderNumber,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CustomerEmail = o.CustomerEmail,
            CustomerName = o.CustomerName,
            AddressId = o.AddressId,
            ShippingAddress = MapAddressToDto(o.ShippingAddress),
            CreatedAt = o.CreatedAt,
            ShippedDate = o.ShippedDate,
            DeliveredDate = o.DeliveredDate,
            Items = o.Items.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                Quantity = oi.Quantity,
                Price = oi.Price,
                SubTotal = oi.Price * oi.Quantity
            }).ToList()
        });
    }

    public async Task<bool> UpdateOrderStatusAsync(Guid orderId, OrderStatus status)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
        if (order == null) return false;

        order.Status = status;

        if (status == OrderStatus.Shipped && order.ShippedDate == null)
        {
            order.ShippedDate = DateTime.UtcNow;
        }
        else if (status == OrderStatus.Delivered && order.DeliveredDate == null)
        {
            order.DeliveredDate = DateTime.UtcNow;
        }

        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<OrderTrackingDto?> GetOrderTrackingAsync(Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;

        return MapToOrderTrackingDto(order);
    }

    public async Task<OrderTrackingDto?> GetOrderTrackingByEmailAsync(Guid orderId, string customerEmail)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerEmail.ToLower() == customerEmail.ToLower());

        if (order == null) return null;

        return MapToOrderTrackingDto(order);
    }

    private async Task<Cart?> GetCartWithItemsAsync(Guid userId)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    private static AddressResponseDto MapAddressToDto(Address address)
    {
        return new AddressResponseDto
        {
            Id = address.Id,
            Title = address.Title,
            FirstName = address.FirstName,
            LastName = address.LastName,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            PhoneNumber = address.PhoneNumber,
            IsDefault = address.IsDefault,
            IsActive = address.IsActive,
            UserId = address.UserId,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt
        };
    }

    private static OrderTrackingDto MapToOrderTrackingDto(Order order)
    {
        var trackingEvents = GenerateTrackingEvents(order);
        var estimatedDelivery = CalculateEstimatedDelivery(order);
        
        return new OrderTrackingDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            TotalAmount = order.TotalAmount,
            CreatedAt = order.CreatedAt,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            CancelledDate = order.Status == OrderStatus.Cancelled ? order.UpdatedAt : null,
            ShippingAddress = MapAddressToDto(order.ShippingAddress),
            Items = order.Items.Select(oi => new OrderTrackingItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductImageUrl = oi.Product?.ImageUrl,
                Quantity = oi.Quantity,
                Price = oi.Price,
                SubTotal = oi.Price * oi.Quantity
            }).ToList(),
            TrackingEvents = trackingEvents,
            TrackingNumber = GenerateTrackingNumber(order.Id),
            EstimatedDeliveryTime = estimatedDelivery
        };
    }

    private static List<OrderTrackingEventDto> GenerateTrackingEvents(Order order)
    {
        var events = new List<OrderTrackingEventDto>();

        // Order Placed Event
        events.Add(new OrderTrackingEventDto
        {
            Timestamp = order.CreatedAt,
            Status = OrderStatus.Pending,
            Title = "Order Placed",
            Description = "Your order has been successfully placed and is awaiting payment confirmation.",
            Location = "Online Store"
        });

        // Payment Confirmed (if status >= Paid)
        if (order.Status >= OrderStatus.Paid)
        {
            events.Add(new OrderTrackingEventDto
            {
                Timestamp = order.CreatedAt.AddMinutes(15), // Simulated payment confirmation time
                Status = OrderStatus.Paid,
                Title = "Payment Confirmed",
                Description = "Payment has been confirmed and your order is being prepared.",
                Location = "Payment Processing Center"
            });
        }

        // Processing (if status >= Processing)
        if (order.Status >= OrderStatus.Processing)
        {
            events.Add(new OrderTrackingEventDto
            {
                Timestamp = order.CreatedAt.AddHours(2),
                Status = OrderStatus.Processing,
                Title = "Order Processing",
                Description = "Your order is being prepared and packaged for shipment.",
                Location = "Fulfillment Center"
            });
        }

        // Shipped (if shipped)
        if (order.ShippedDate.HasValue)
        {
            events.Add(new OrderTrackingEventDto
            {
                Timestamp = order.ShippedDate.Value,
                Status = OrderStatus.Shipped,
                Title = "Order Shipped",
                Description = "Your order has been shipped and is on its way to your address.",
                Location = "Distribution Center"
            });
        }

        // Delivered (if delivered)
        if (order.DeliveredDate.HasValue)
        {
            events.Add(new OrderTrackingEventDto
            {
                Timestamp = order.DeliveredDate.Value,
                Status = OrderStatus.Delivered,
                Title = "Order Delivered",
                Description = "Your order has been successfully delivered to your address.",
                Location = order.ShippingAddress?.City ?? "Delivery Address"
            });
        }

        // Cancelled (if cancelled)
        if (order.Status == OrderStatus.Cancelled)
        {
            events.Add(new OrderTrackingEventDto
            {
                Timestamp = order.UpdatedAt ?? order.CreatedAt,
                Status = OrderStatus.Cancelled,
                Title = "Order Cancelled",
                Description = "This order has been cancelled. If you made a payment, it will be refunded within 3-5 business days.",
                Location = "Customer Service"
            });
        }

        return events.OrderBy(e => e.Timestamp).ToList();
    }

    private static string GenerateTrackingNumber(Guid orderId)
    {
        // Generate a mock tracking number based on order ID
        var hash = orderId.ToString("N")[..8].ToUpper();
        return $"TR{DateTime.UtcNow:yyMMdd}{hash}";
    }

    private static string? CalculateEstimatedDelivery(Order order)
    {
        if (order.Status == OrderStatus.Delivered)
            return null; // Already delivered

        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Refunded)
            return null; // Not applicable

        var estimatedDate = order.Status switch
        {
            OrderStatus.Pending or OrderStatus.Paid => DateTime.UtcNow.AddDays(5),
            OrderStatus.Processing => DateTime.UtcNow.AddDays(3),
            OrderStatus.Shipped => order.ShippedDate?.AddDays(2) ?? DateTime.UtcNow.AddDays(2),
            _ => DateTime.UtcNow.AddDays(3)
        };

        return estimatedDate.ToString("MMM dd, yyyy");
    }

    private async Task<long> GenerateOrderNumberAsync()
    {
        // Get the highest existing order number
        var lastOrderNumber = await _context.Orders
            .OrderByDescending(o => o.OrderNumber)
            .Select(o => o.OrderNumber)
            .FirstOrDefaultAsync();

        // If no orders exist, start with 100000000
        if (lastOrderNumber == 0)
        {
            return 100000000;
        }

        // Increment the last order number
        return lastOrderNumber + 1;
    }
}