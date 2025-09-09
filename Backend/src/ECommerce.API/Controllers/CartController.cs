using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<CartDto>> GetCart(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        try
        {
            _logger.LogInformation("Getting cart for user: {UserId}", userId);
            
            // Try to parse as GUID, if it fails, treat as string userId (for guest users)
            if (Guid.TryParse(userId, out var userGuid))
            {
                var cart = await _cartService.GetCartAsync(userGuid);
                return Ok(cart);
            }
            else
            {
                // For non-authenticated users, return empty cart
                var emptyCart = new CartDto
                {
                    Id = Guid.Empty,
                    UserId = Guid.Empty, // Guest users don't have a GUID
                    Items = new List<CartItemDto>(),
                    TotalAmount = 0,
                    TotalItems = 0
                };
                return Ok(emptyCart);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting cart for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{userId}/items")]
    public async Task<ActionResult<CartDto>> AddToCart(string userId, [FromBody] AddToCartDto addToCartDto)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Only authenticated users with GUID can add to cart
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequest("Authentication required to add items to cart");
        }

        try
        {
            _logger.LogInformation("Adding item to cart for user: {UserId}, Product: {ProductId}", 
                userId, addToCartDto.ProductId);
            var cart = await _cartService.AddToCartAsync(userGuid, addToCartDto);
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while adding to cart for user {UserId}", userId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding to cart for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{userId}/items/{cartItemId:guid}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(string userId, Guid cartItemId, 
        [FromBody] UpdateCartItemDto updateCartItemDto)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Only authenticated users with GUID can update cart items
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequest("Authentication required to update cart items");
        }

        try
        {
            _logger.LogInformation("Updating cart item {CartItemId} for user: {UserId}", cartItemId, userId);
            var cart = await _cartService.UpdateCartItemAsync(userGuid, cartItemId, updateCartItemDto);
            
            if (cart == null)
            {
                _logger.LogWarning("Cart item {CartItemId} not found for user {UserId}", cartItemId, userId);
                return NotFound("Cart item not found");
            }

            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while updating cart item {CartItemId} for user {UserId}", 
                cartItemId, userId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating cart item {CartItemId} for user {UserId}", 
                cartItemId, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{userId}/items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveFromCart(string userId, Guid cartItemId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        // Only authenticated users with GUID can remove cart items
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequest("Authentication required to remove cart items");
        }

        try
        {
            _logger.LogInformation("Removing cart item {CartItemId} for user: {UserId}", cartItemId, userId);
            var result = await _cartService.RemoveFromCartAsync(userGuid, cartItemId);
            
            if (!result)
            {
                _logger.LogWarning("Cart item {CartItemId} not found for user {UserId}", cartItemId, userId);
                return NotFound("Cart item not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while removing cart item {CartItemId} for user {UserId}", 
                cartItemId, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> ClearCart(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID cannot be empty");
        }

        // Only authenticated users with GUID can clear cart
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequest("Authentication required to clear cart");
        }

        try
        {
            _logger.LogInformation("Clearing cart for user: {UserId}", userId);
            var result = await _cartService.ClearCartAsync(userGuid);
            
            if (!result)
            {
                _logger.LogWarning("Cart not found for user {UserId}", userId);
                return NotFound("Cart not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while clearing cart for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }
}