using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}