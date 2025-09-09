namespace ECommerce.Application.DTOs.Auth;

/// <summary>
/// Response DTO for password reset operations
/// </summary>
public class PasswordResetResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}