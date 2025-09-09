namespace ECommerce.Application.DTOs.Auth;

/// <summary>
/// Request DTO for initiating password reset
/// </summary>
public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}