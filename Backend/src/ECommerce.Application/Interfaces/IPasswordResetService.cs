using ECommerce.Application.DTOs.Auth;

namespace ECommerce.Application.Interfaces;

/// <summary>
/// Service interface for password reset operations
/// </summary>
public interface IPasswordResetService
{
    /// <summary>
    /// Initiate password reset by sending reset email
    /// </summary>
    /// <param name="request">Forgot password request</param>
    /// <param name="ipAddress">Client IP address</param>
    /// <param name="userAgent">Client user agent</param>
    /// <returns>Password reset response</returns>
    Task<PasswordResetResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string? ipAddress = null, string? userAgent = null);

    /// <summary>
    /// Reset password using token
    /// </summary>
    /// <param name="request">Reset password request</param>
    /// <param name="ipAddress">Client IP address</param>
    /// <param name="userAgent">Client user agent</param>
    /// <returns>Password reset response</returns>
    Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request, string? ipAddress = null, string? userAgent = null);

    /// <summary>
    /// Validate password reset token
    /// </summary>
    /// <param name="token">Reset token</param>
    /// <param name="email">Email address</param>
    /// <returns>True if token is valid</returns>
    Task<bool> ValidateResetTokenAsync(string token, string email);

    /// <summary>
    /// Clean up expired tokens (called by background service)
    /// </summary>
    /// <returns>Number of tokens cleaned up</returns>
    Task<int> CleanupExpiredTokensAsync();
}