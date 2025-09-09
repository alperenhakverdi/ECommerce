namespace ECommerce.Application.DTOs.Auth;

/// <summary>
/// Request DTO for resetting password with token
/// </summary>
public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}