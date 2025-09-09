using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid input data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()
                });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault();
            
            var result = await _authService.RegisterAsync(request, ipAddress, userAgent);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user registration");
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during registration",
                Errors = new List<string> { "Internal server error" }
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid input data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()
                });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault();
            
            var result = await _authService.LoginAsync(request, ipAddress, userAgent);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user login");
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during login",
                Errors = new List<string> { "Internal server error" }
            });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault();
            
            var result = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken, ipAddress, userAgent);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during token refresh");
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during token refresh",
                Errors = new List<string> { "Internal server error" }
            });
        }
    }

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<ActionResult> RevokeToken([FromBody] RevokeTokenRequestDto request)
    {
        try
        {
            var result = await _authService.RevokeTokenAsync(request.Token);
            
            if (!result)
            {
                return BadRequest(new { success = false, message = "Token revocation failed" });
            }

            return Ok(new { success = true, message = "Token revoked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during token revocation");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "Invalid user token" });
            }

            var user = await _authService.GetCurrentUserAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting current user");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("assign-role")]
    // Temporarily remove admin requirement for testing
    public async Task<ActionResult> AssignRole([FromBody] AssignRoleRequestDto request)
    {
        try
        {
            var result = await _authService.AssignRoleAsync(request.UserId, request.Role);
            
            if (!result)
            {
                return BadRequest(new { success = false, message = "Role assignment failed" });
            }

            _logger.LogInformation("Role {Role} assigned to user {UserId}", request.Role, request.UserId);
            return Ok(new { success = true, message = "Role assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during role assignment");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}