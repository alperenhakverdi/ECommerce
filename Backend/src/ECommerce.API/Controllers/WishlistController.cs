using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;
    private readonly ILogger<WishlistController> _logger;

    public WishlistController(IWishlistService wishlistService, ILogger<WishlistController> logger)
    {
        _wishlistService = wishlistService;
        _logger = logger;
    }

    /// <summary>
    /// Get user's wishlist
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<WishlistDto>> GetWishlist()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var wishlist = await _wishlistService.GetUserWishlistAsync(userId);
            return Ok(wishlist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting wishlist for user");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add product to wishlist
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WishlistDto>> AddToWishlist([FromBody] AddToWishlistRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            if (string.IsNullOrEmpty(request.ProductId))
            {
                return BadRequest("Product ID is required");
            }

            var wishlist = await _wishlistService.AddToWishlistAsync(userId, request);
            return Ok(wishlist);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product to wishlist");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add product to wishlist (alternative endpoint for frontend compatibility)
    /// </summary>
    [HttpPost("items")]
    public async Task<ActionResult<WishlistDto>> AddToWishlistItems([FromBody] AddToWishlistRequest request)
    {
        return await AddToWishlist(request);
    }

    /// <summary>
    /// Remove product from wishlist
    /// </summary>
    [HttpDelete("{productId}")]
    public async Task<ActionResult> RemoveFromWishlist(string productId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var success = await _wishlistService.RemoveFromWishlistAsync(userId, productId);
            if (!success)
            {
                return NotFound("Product not found in wishlist");
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing product from wishlist");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Clear entire wishlist
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult> ClearWishlist()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            await _wishlistService.ClearWishlistAsync(userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing wishlist");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Check if product is in wishlist
    /// </summary>
    [HttpGet("contains/{productId}")]
    public async Task<ActionResult<bool>> IsInWishlist(string productId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var isInWishlist = await _wishlistService.IsInWishlistAsync(userId, productId);
            return Ok(isInWishlist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if product is in wishlist");
            return StatusCode(500, "Internal server error");
        }
    }
}