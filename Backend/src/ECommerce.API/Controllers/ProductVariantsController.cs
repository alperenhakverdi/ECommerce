using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductVariantsController : ControllerBase
{
    private readonly IProductVariantService _variantService;
    private readonly ILogger<ProductVariantsController> _logger;

    public ProductVariantsController(IProductVariantService variantService, ILogger<ProductVariantsController> logger)
    {
        _variantService = variantService;
        _logger = logger;
    }

    /// <summary>
    /// Get all variants for a product
    /// </summary>
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ProductVariantDto>>> GetVariantsByProduct(Guid productId)
    {
        try
        {
            var variants = await _variantService.GetVariantsByProductIdAsync(productId);
            return Ok(variants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting variants for product {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get variant by ID
    /// </summary>
    [HttpGet("{variantId}")]
    public async Task<ActionResult<ProductVariantDto>> GetVariant(Guid variantId)
    {
        try
        {
            var variant = await _variantService.GetVariantByIdAsync(variantId);
            if (variant == null)
                return NotFound("Variant not found");

            return Ok(variant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new product variant (Store Owner only)
    /// </summary>
    [HttpPost("product/{productId}")]
    [Authorize(Roles = "StoreOwner,Admin")]
    public async Task<ActionResult<ProductVariantDto>> CreateVariant(Guid productId, [FromBody] CreateProductVariantRequest request)
    {
        try
        {
            // TODO: Verify that the store owner owns this product
            var variant = await _variantService.CreateVariantAsync(productId, request);
            return CreatedAtAction(nameof(GetVariant), new { variantId = variant.Id }, variant);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating variant for product {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update product variant (Store Owner only)
    /// </summary>
    [HttpPut("{variantId}")]
    [Authorize(Roles = "StoreOwner,Admin")]
    public async Task<ActionResult<ProductVariantDto>> UpdateVariant(Guid variantId, [FromBody] CreateProductVariantRequest request)
    {
        try
        {
            // TODO: Verify ownership
            var variant = await _variantService.UpdateVariantAsync(variantId, request);
            return Ok(variant);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete product variant (Store Owner only)
    /// </summary>
    [HttpDelete("{variantId}")]
    [Authorize(Roles = "StoreOwner,Admin")]
    public async Task<ActionResult> DeleteVariant(Guid variantId)
    {
        try
        {
            // TODO: Verify ownership
            var success = await _variantService.DeleteVariantAsync(variantId);
            if (!success)
                return NotFound("Variant not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update variant stock (Store Owner only)
    /// </summary>
    [HttpPatch("{variantId}/stock")]
    [Authorize(Roles = "StoreOwner,Admin")]
    public async Task<ActionResult> UpdateVariantStock(Guid variantId, [FromBody] UpdateStockRequest request)
    {
        try
        {
            // TODO: Verify ownership
            var success = await _variantService.UpdateVariantStockAsync(variantId, request.Stock);
            if (!success)
                return NotFound("Variant not found");

            return Ok(new { message = "Stock updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating stock for variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get calculated final price for variant
    /// </summary>
    [HttpGet("{variantId}/price")]
    public async Task<ActionResult<decimal>> GetVariantPrice(Guid variantId)
    {
        try
        {
            var price = await _variantService.CalculateFinalPriceAsync(variantId);
            return Ok(new { variantId, finalPrice = price });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating price for variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Check variant availability
    /// </summary>
    [HttpPost("{variantId}/check-availability")]
    public async Task<ActionResult<bool>> CheckAvailability(Guid variantId, [FromBody] CheckAvailabilityRequest request)
    {
        try
        {
            var available = await _variantService.CheckVariantAvailabilityAsync(variantId, request.Quantity);
            return Ok(new { variantId, quantity = request.Quantity, available });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking availability for variant {VariantId}", variantId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Search variants by attributes
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<ProductVariantDto>>> SearchVariants([FromBody] SearchVariantsRequest request)
    {
        try
        {
            var variants = await _variantService.SearchVariantsByAttributesAsync(request.Attributes);
            return Ok(variants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching variants with attributes {@Attributes}", request.Attributes);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get default variant for product
    /// </summary>
    [HttpGet("product/{productId}/default")]
    public async Task<ActionResult<ProductVariantDto>> GetDefaultVariant(Guid productId)
    {
        try
        {
            var variant = await _variantService.GetDefaultVariantForProductAsync(productId);
            if (variant == null)
                return NotFound("No default variant found for this product");

            return Ok(variant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting default variant for product {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }
}

// Request DTOs
public class UpdateStockRequest
{
    public int Stock { get; set; }
}

public class CheckAvailabilityRequest
{
    public int Quantity { get; set; }
}

public class SearchVariantsRequest
{
    public Dictionary<string, string> Attributes { get; set; } = new();
}