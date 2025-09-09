using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SavedCardsController : ControllerBase
{
    private readonly ISavedCardService _savedCardService;
    private readonly ILogger<SavedCardsController> _logger;

    public SavedCardsController(ISavedCardService savedCardService, ILogger<SavedCardsController> logger)
    {
        _savedCardService = savedCardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SavedCardDto>>> GetUserSavedCards()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        try
        {
            _logger.LogInformation("Getting saved cards for user: {UserId}", userId);
            var savedCards = await _savedCardService.GetUserSavedCardsAsync(userId.Value);
            return Ok(savedCards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting saved cards for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SavedCardDto>> GetSavedCardById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        try
        {
            _logger.LogInformation("Getting saved card {CardId} for user: {UserId}", id, userId);
            var savedCard = await _savedCardService.GetSavedCardByIdAsync(id, userId.Value);
            
            if (savedCard == null)
            {
                _logger.LogWarning("Saved card {CardId} not found for user {UserId}", id, userId);
                return NotFound($"Saved card with ID {id} not found");
            }

            return Ok(savedCard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting saved card {CardId} for user {UserId}", id, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<SavedCardDto>> CreateSavedCard([FromBody] CreateSavedCardDto createCardDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Creating saved card for user: {UserId}", userId);
            var savedCard = await _savedCardService.CreateSavedCardAsync(userId.Value, createCardDto);
            return CreatedAtAction(nameof(GetSavedCardById), new { id = savedCard.Id }, savedCard);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid card data provided for user {UserId}", userId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating saved card for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SavedCardDto>> UpdateSavedCard(Guid id, [FromBody] UpdateSavedCardDto updateCardDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Updating saved card {CardId} for user: {UserId}", id, userId);
            var updatedCard = await _savedCardService.UpdateSavedCardAsync(id, userId.Value, updateCardDto);
            
            if (updatedCard == null)
            {
                _logger.LogWarning("Saved card {CardId} not found for user {UserId}", id, userId);
                return NotFound($"Saved card with ID {id} not found");
            }

            return Ok(updatedCard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating saved card {CardId} for user {UserId}", id, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSavedCard(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        try
        {
            _logger.LogInformation("Deleting saved card {CardId} for user: {UserId}", id, userId);
            var result = await _savedCardService.DeleteSavedCardAsync(id, userId.Value);
            
            if (!result)
            {
                _logger.LogWarning("Saved card {CardId} not found for user {UserId}", id, userId);
                return NotFound($"Saved card with ID {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting saved card {CardId} for user {UserId}", id, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPatch("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefaultCard(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("User ID not found in token");
        }

        try
        {
            _logger.LogInformation("Setting card {CardId} as default for user: {UserId}", id, userId);
            var result = await _savedCardService.SetDefaultCardAsync(id, userId.Value);
            
            if (!result)
            {
                _logger.LogWarning("Saved card {CardId} not found for user {UserId}", id, userId);
                return NotFound($"Saved card with ID {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while setting default card {CardId} for user {UserId}", id, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}