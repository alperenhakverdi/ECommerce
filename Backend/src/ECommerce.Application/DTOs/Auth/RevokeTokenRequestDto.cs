using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class RevokeTokenRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}