using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/user/recently-viewed")]
[Authorize]
public class RecentlyViewedController : ControllerBase
{
    private readonly IRecentlyViewedService _recentlyViewedService;
    private readonly ILogger<RecentlyViewedController> _logger;

    public RecentlyViewedController(IRecentlyViewedService recentlyViewedService, ILogger<RecentlyViewedController> logger)
    {
        _recentlyViewedService = recentlyViewedService;
        _logger = logger;
    }

    /// <summary>
    /// Get user's recently viewed products
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<RecentlyViewedItemDto>>> GetRecentlyViewed([FromQuery] int take = 10)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var items = await _recentlyViewedService.GetRecentlyViewedAsync(userId, take);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recently viewed items");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add product to recently viewed (called when user views a product)
    /// </summary>
    [HttpPost("{productId}")]
    public async Task<ActionResult> AddToRecentlyViewed(string productId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            if (string.IsNullOrEmpty(productId))
            {
                return BadRequest("Product ID is required");
            }

            await _recentlyViewedService.AddToRecentlyViewedAsync(userId, productId);
            return Ok();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to recently viewed");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Remove product from recently viewed
    /// </summary>
    [HttpDelete("{productId}")]
    public async Task<ActionResult> RemoveFromRecentlyViewed(string productId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var success = await _recentlyViewedService.RemoveFromRecentlyViewedAsync(userId, productId);
            if (!success)
            {
                return NotFound("Product not found in recently viewed");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing from recently viewed");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Clear all recently viewed products
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult> ClearRecentlyViewed()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            await _recentlyViewedService.ClearRecentlyViewedAsync(userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing recently viewed");
            return StatusCode(500, "Internal server error");
        }
    }
}