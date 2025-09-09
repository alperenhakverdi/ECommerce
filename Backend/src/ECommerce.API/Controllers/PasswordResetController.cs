using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECommerce.API.Controllers;

/// <summary>
/// Controller for password reset operations
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _passwordResetService;
    private readonly ILogger<PasswordResetController> _logger;

    public PasswordResetController(
        IPasswordResetService passwordResetService,
        ILogger<PasswordResetController> logger)
    {
        _passwordResetService = passwordResetService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate password reset process
    /// </summary>
    /// <param name="request">Forgot password request</param>
    /// <returns>Password reset response</returns>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(PasswordResetResponse), 200)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    [ProducesResponseType(429)]
    public async Task<ActionResult<PasswordResetResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var ipAddress = GetClientIpAddress();
            var userAgent = HttpContext.Request.Headers.UserAgent.FirstOrDefault();

            _logger.LogInformation("Password reset initiated for email: {Email} from IP: {IpAddress}", 
                request.Email, ipAddress);

            var result = await _passwordResetService.ForgotPasswordAsync(request, ipAddress, userAgent);

            // Always return 200 OK to prevent email enumeration attacks
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request");
            return Ok(new PasswordResetResponse
            {
                Success = true, // Don't reveal internal errors
                Message = "If an account with that email exists, a password reset link has been sent."
            });
        }
    }

    /// <summary>
    /// Reset password using token
    /// </summary>
    /// <param name="request">Reset password request</param>
    /// <returns>Password reset response</returns>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(PasswordResetResponse), 200)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    [ProducesResponseType(429)]
    public async Task<ActionResult<PasswordResetResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            var ipAddress = GetClientIpAddress();
            var userAgent = HttpContext.Request.Headers.UserAgent.FirstOrDefault();

            _logger.LogInformation("Password reset attempted for email: {Email} from IP: {IpAddress}", 
                request.Email, ipAddress);

            var result = await _passwordResetService.ResetPasswordAsync(request, ipAddress, userAgent);

            if (result.Success)
            {
                _logger.LogInformation("Password reset successful for email: {Email}", request.Email);
                return Ok(result);
            }
            else
            {
                _logger.LogWarning("Password reset failed for email: {Email}. Errors: {Errors}", 
                    request.Email, string.Join(", ", result.Errors));
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing reset password request for email: {Email}", request.Email);
            return StatusCode(500, new PasswordResetResponse
            {
                Success = false,
                Message = "An error occurred while resetting your password. Please try again later.",
                Errors = new List<string> { "Internal server error" }
            });
        }
    }

    /// <summary>
    /// Validate password reset token
    /// </summary>
    /// <param name="token">Reset token</param>
    /// <param name="email">Email address</param>
    /// <returns>Token validation result</returns>
    [HttpGet("validate-reset-token")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(429)]
    public async Task<ActionResult> ValidateResetToken([FromQuery] string token, [FromQuery] string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { 
                    valid = false, 
                    message = "Token and email are required" 
                });
            }

            var isValid = await _passwordResetService.ValidateResetTokenAsync(token, email);

            return Ok(new { 
                valid = isValid,
                message = isValid ? "Token is valid" : "Invalid or expired token"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating reset token");
            return BadRequest(new { 
                valid = false, 
                message = "Error validating token" 
            });
        }
    }

    /// <summary>
    /// Get client IP address considering proxies and load balancers
    /// </summary>
    /// <returns>Client IP address</returns>
    private string GetClientIpAddress()
    {
        // Check for forwarded headers (reverse proxy, load balancer)
        var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // Take the first IP if there are multiple
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fallback to connection remote IP
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}