using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

/// <summary>
/// Service for handling password reset operations
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ECommerceDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<PasswordResetService> _logger;
    
    // Token expiry time - 24 hours
    private static readonly TimeSpan TokenExpiryTime = TimeSpan.FromHours(24);

    public PasswordResetService(
        UserManager<ApplicationUser> userManager,
        ECommerceDbContext context,
        IEmailService emailService,
        ILogger<PasswordResetService> logger)
    {
        _userManager = userManager;
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<PasswordResetResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

            // Find user by email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Don't reveal that user doesn't exist for security reasons
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "If an account with that email exists, a password reset link has been sent."
                };
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Password reset requested for inactive user: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "If an account with that email exists, a password reset link has been sent."
                };
            }

            // Invalidate existing tokens for this user
            await InvalidateExistingTokensAsync(user.Id);

            // Generate secure token
            var resetToken = PasswordResetToken.GenerateSecureToken();
            
            // Create password reset token entity
            var passwordResetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                Token = resetToken,
                Email = request.Email.ToLowerInvariant(),
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.Add(TokenExpiryTime),
                CreatedAt = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            // Save token to database
            _context.PasswordResetTokens.Add(passwordResetToken);
            await _context.SaveChangesAsync();

            // Send password reset email
            var userName = $"{user.FirstName} {user.LastName}".Trim();
            var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email!, resetToken, userName);

            if (!emailSent)
            {
                _logger.LogError("Failed to send password reset email to: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Failed to send password reset email. Please try again later.",
                    Errors = new List<string> { "Email service unavailable" }
                };
            }

            _logger.LogInformation("Password reset email sent successfully to: {Email}", request.Email);

            return new PasswordResetResponse
            {
                Success = true,
                Message = "A password reset link has been sent to your email address."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request for email: {Email}", request.Email);
            return new PasswordResetResponse
            {
                Success = false,
                Message = "An error occurred while processing your request. Please try again later.",
                Errors = new List<string> { "Internal server error" }
            };
        }
    }

    public async Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

            // Validate token
            var resetToken = await _context.PasswordResetTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => 
                    rt.Token == request.Token && 
                    rt.Email.ToLower() == request.Email.ToLower() && 
                    rt.IsValid);

            if (resetToken == null)
            {
                _logger.LogWarning("Invalid password reset attempt with token for email: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Invalid or expired reset token.",
                    Errors = new List<string> { "Invalid token" }
                };
            }

            var user = resetToken.User;
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Password reset attempted for inactive user: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Invalid or expired reset token.",
                    Errors = new List<string> { "Invalid token" }
                };
            }

            // Reset password using UserManager
            var removePasswordResult = await _userManager.RemovePasswordAsync(user);
            if (!removePasswordResult.Succeeded)
            {
                _logger.LogError("Failed to remove old password for user: {Email}. Errors: {Errors}", 
                    request.Email, string.Join(", ", removePasswordResult.Errors.Select(e => e.Description)));
                
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Failed to reset password. Please try again.",
                    Errors = removePasswordResult.Errors.Select(e => e.Description).ToList()
                };
            }

            var addPasswordResult = await _userManager.AddPasswordAsync(user, request.NewPassword);
            if (!addPasswordResult.Succeeded)
            {
                _logger.LogError("Failed to set new password for user: {Email}. Errors: {Errors}", 
                    request.Email, string.Join(", ", addPasswordResult.Errors.Select(e => e.Description)));
                
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Failed to reset password. Please check password requirements.",
                    Errors = addPasswordResult.Errors.Select(e => e.Description).ToList()
                };
            }

            // Mark token as used
            resetToken.MarkAsUsed();
            
            // Update user's last modified time
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // Invalidate all refresh tokens for security
            await InvalidateUserRefreshTokensAsync(user.Id);

            _logger.LogInformation("Password reset successful for user: {Email}", request.Email);

            return new PasswordResetResponse
            {
                Success = true,
                Message = "Your password has been reset successfully. Please login with your new password."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email: {Email}", request.Email);
            return new PasswordResetResponse
            {
                Success = false,
                Message = "An error occurred while resetting your password. Please try again later.",
                Errors = new List<string> { "Internal server error" }
            };
        }
    }

    public async Task<bool> ValidateResetTokenAsync(string token, string email)
    {
        try
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(rt => 
                    rt.Token == token && 
                    rt.Email.ToLower() == email.ToLower());

            return resetToken?.IsValid == true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating reset token for email: {Email}", email);
            return false;
        }
    }

    public async Task<int> CleanupExpiredTokensAsync()
    {
        try
        {
            var expiredTokens = await _context.PasswordResetTokens
                .Where(rt => rt.ExpiryDate < DateTime.UtcNow)
                .ToListAsync();

            if (expiredTokens.Any())
            {
                _context.PasswordResetTokens.RemoveRange(expiredTokens);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Cleaned up {Count} expired password reset tokens", expiredTokens.Count);
            }

            return expiredTokens.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired password reset tokens");
            return 0;
        }
    }

    /// <summary>
    /// Invalidate all existing password reset tokens for a user
    /// </summary>
    private async Task InvalidateExistingTokensAsync(Guid userId)
    {
        var existingTokens = await _context.PasswordResetTokens
            .Where(rt => rt.UserId == userId && rt.IsValid)
            .ToListAsync();

        foreach (var token in existingTokens)
        {
            token.MarkAsUsed();
        }

        if (existingTokens.Any())
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Invalidated {Count} existing password reset tokens for user: {UserId}", 
                existingTokens.Count, userId);
        }
    }

    /// <summary>
    /// Invalidate all refresh tokens for a user (for security after password reset)
    /// </summary>
    private async Task InvalidateUserRefreshTokensAsync(Guid userId)
    {
        var refreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        foreach (var token in refreshTokens)
        {
            token.IsRevoked = true;
        }

        if (refreshTokens.Any())
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Invalidated {Count} refresh tokens for user: {UserId} after password reset", 
                refreshTokens.Count, userId);
        }
    }
}