using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class AssignRoleRequestDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [StringLength(50)]
    public string Role { get; set; } = string.Empty;
}