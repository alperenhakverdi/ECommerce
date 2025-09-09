using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IAddressService _addressService;
    private readonly ILogger<AddressController> _logger;

    public AddressController(IAddressService addressService, ILogger<AddressController> logger)
    {
        _addressService = addressService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressResponseDto>>> GetUserAddresses()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Getting addresses for user: {UserId}", userId);
            var addresses = await _addressService.GetUserAddressesAsync(userId);
            return Ok(addresses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user addresses");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AddressResponseDto>> GetAddressById(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Getting address {AddressId} for user: {UserId}", id, userId);
            var address = await _addressService.GetAddressByIdAsync(id, userId);
            
            if (address == null)
                return NotFound("Address not found");

            return Ok(address);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting address {AddressId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("default")]
    public async Task<ActionResult<AddressResponseDto>> GetDefaultAddress()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Getting default address for user: {UserId}", userId);
            var address = await _addressService.GetDefaultAddressAsync(userId);
            
            if (address == null)
                return NotFound("Default address not found");

            return Ok(address);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting default address");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<AddressResponseDto>> CreateAddress([FromBody] CreateAddressDto createAddressDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation("Creating address for user: {UserId}", userId);
            var address = await _addressService.CreateAddressAsync(userId, createAddressDto);
            
            return CreatedAtAction(nameof(GetAddressById), new { id = address.Id }, address);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating address");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AddressResponseDto>> UpdateAddress(Guid id, [FromBody] UpdateAddressDto updateAddressDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation("Updating address {AddressId} for user: {UserId}", id, userId);
            var address = await _addressService.UpdateAddressAsync(id, userId, updateAddressDto);
            
            if (address == null)
                return NotFound("Address not found");

            return Ok(address);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating address {AddressId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Deleting address {AddressId} for user: {UserId}", id, userId);
            var result = await _addressService.DeleteAddressAsync(id, userId);
            
            if (!result)
                return NotFound("Address not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting address {AddressId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPatch("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefaultAddress(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Setting address {AddressId} as default for user: {UserId}", id, userId);
            var result = await _addressService.SetDefaultAddressAsync(id, userId);
            
            if (!result)
                return NotFound("Address not found");

            return Ok(new { message = "Address set as default successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while setting default address {AddressId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) ? userId : Guid.Empty;
    }
}