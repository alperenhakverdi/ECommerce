using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductAttributesController : ControllerBase
{
    private readonly IProductVariantService _variantService;
    private readonly ILogger<ProductAttributesController> _logger;

    public ProductAttributesController(IProductVariantService variantService, ILogger<ProductAttributesController> logger)
    {
        _variantService = variantService;
        _logger = logger;
    }

    /// <summary>
    /// Get all product attributes
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductAttributeDto>>> GetAllAttributes()
    {
        try
        {
            var attributes = await _variantService.GetAllAttributesAsync();
            return Ok(attributes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all attributes");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get attribute by ID
    /// </summary>
    [HttpGet("{attributeId}")]
    public async Task<ActionResult<ProductAttributeDto>> GetAttribute(Guid attributeId)
    {
        try
        {
            var attribute = await _variantService.GetAttributeByIdAsync(attributeId);
            if (attribute == null)
                return NotFound("Attribute not found");

            return Ok(attribute);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting attribute {AttributeId}", attributeId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new product attribute (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductAttributeDto>> CreateAttribute([FromBody] CreateProductAttributeRequest request)
    {
        try
        {
            var attribute = await _variantService.CreateAttributeAsync(request);
            return CreatedAtAction(nameof(GetAttribute), new { attributeId = attribute.Id }, attribute);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating attribute {@Request}", request);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update product attribute (Admin only)
    /// </summary>
    [HttpPut("{attributeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductAttributeDto>> UpdateAttribute(Guid attributeId, [FromBody] CreateProductAttributeRequest request)
    {
        try
        {
            var attribute = await _variantService.UpdateAttributeAsync(attributeId, request);
            return Ok(attribute);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating attribute {AttributeId}", attributeId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete product attribute (Admin only)
    /// </summary>
    [HttpDelete("{attributeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteAttribute(Guid attributeId)
    {
        try
        {
            var success = await _variantService.DeleteAttributeAsync(attributeId);
            if (!success)
                return NotFound("Attribute not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attribute {AttributeId}", attributeId);
            return StatusCode(500, "Internal server error");
        }
    }
}