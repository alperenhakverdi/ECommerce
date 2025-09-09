using Microsoft.AspNetCore.Identity;

namespace ECommerce.Domain.Entities;

/// <summary>
/// Entity for managing password reset tokens
/// </summary>
public class PasswordResetToken
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    /// <summary>
    /// Check if the token is expired
    /// </summary>
    public bool IsExpired => DateTime.UtcNow > ExpiryDate;

    /// <summary>
    /// Check if the token is valid (not expired and not used)
    /// </summary>
    public bool IsValid => !IsExpired && !IsUsed;

    /// <summary>
    /// Mark the token as used
    /// </summary>
    public void MarkAsUsed()
    {
        IsUsed = true;
    }

    /// <summary>
    /// Generate a secure token for password reset
    /// </summary>
    public static string GenerateSecureToken()
    {
        // Generate a cryptographically secure random token
        var randomBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}