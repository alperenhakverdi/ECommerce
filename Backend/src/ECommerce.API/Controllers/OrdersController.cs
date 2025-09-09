using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    [HttpPost("{userId}")]
    public async Task<ActionResult<OrderDto>> CreateOrder(string userId, [FromBody] CreateOrderDto createOrderDto)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Creating order for user: {UserId}", userId);
            var order = await _orderService.CreateOrderAsync(Guid.Parse(userId), createOrderDto);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while creating order for user {UserId}", userId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating order for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting order with ID: {OrderId}", id);
            var order = await _orderService.GetOrderByIdAsync(id);
            
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found", id);
                return NotFound($"Order with ID {id} not found");
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting order {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        try
        {
            _logger.LogInformation("Getting orders for user: {UserId}", userId);
            var orders = await _orderService.GetUserOrdersAsync(Guid.Parse(userId));
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting orders for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto updateStatusDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Updating order {OrderId} status to {Status}", id, updateStatusDto.Status);
            var result = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto.Status);
            
            if (!result)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for status update", id);
                return NotFound($"Order with ID {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating order {OrderId} status", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:guid}/track")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderTrackingDto>> TrackOrder(Guid id)
    {
        try
        {
            _logger.LogInformation("Tracking order with ID: {OrderId}", id);
            var tracking = await _orderService.GetOrderTrackingAsync(id);
            
            if (tracking == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for tracking", id);
                return NotFound($"Order with ID {id} not found");
            }

            return Ok(tracking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while tracking order {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id:guid}/track")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderTrackingDto>> TrackOrderByEmail(Guid id, [FromBody] TrackOrderRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Tracking order with ID: {OrderId} and email: {Email}", id, request.CustomerEmail);
            var tracking = await _orderService.GetOrderTrackingByEmailAsync(id, request.CustomerEmail);
            
            if (tracking == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found or email mismatch for tracking", id);
                return NotFound("Order not found or email doesn't match our records");
            }

            return Ok(tracking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while tracking order {OrderId} with email", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        try
        {
            _logger.LogInformation("Cancelling order {OrderId}", id);
            
            // First get the order to verify it exists and check the status
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for cancellation", id);
                return NotFound($"Order with ID {id} not found");
            }

            // Check if order can be cancelled (only Pending or Paid orders can be cancelled)
            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Paid)
            {
                _logger.LogWarning("Order {OrderId} with status {Status} cannot be cancelled", id, order.Status);
                return BadRequest("Order cannot be cancelled. Only pending or paid orders can be cancelled.");
            }

            var result = await _orderService.UpdateOrderStatusAsync(id, OrderStatus.Cancelled);
            
            if (!result)
            {
                _logger.LogWarning("Failed to cancel order with ID {OrderId}", id);
                return StatusCode(500, "Failed to cancel order");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while cancelling order {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class TrackOrderRequestDto
{
    public string CustomerEmail { get; set; } = string.Empty;
}