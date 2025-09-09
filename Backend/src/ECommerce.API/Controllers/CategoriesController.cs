using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories()
    {
        try
        {
            _logger.LogInformation("Getting all categories");
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting categories");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetCategoryById(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting category with ID: {CategoryId}", id);
            var category = await _categoryService.GetCategoryByIdAsync(id);
            
            if (category == null)
            {
                _logger.LogWarning("Category with ID {CategoryId} not found", id);
                return NotFound($"Category with ID {id} not found");
            }

            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Creating new category: {CategoryName}", createCategoryDto.Name);
            var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating category {CategoryName}", createCategoryDto.Name);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto updateCategoryDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Updating category with ID: {CategoryId}", id);
            var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
            
            if (category == null)
            {
                _logger.LogWarning("Category with ID {CategoryId} not found for update", id);
                return NotFound($"Category with ID {id} not found");
            }

            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting category with ID: {CategoryId}", id);
            var result = await _categoryService.DeleteCategoryAsync(id);
            
            if (!result)
            {
                _logger.LogWarning("Category with ID {CategoryId} not found for deletion", id);
                return NotFound($"Category with ID {id} not found");
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while deleting category {CategoryId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}