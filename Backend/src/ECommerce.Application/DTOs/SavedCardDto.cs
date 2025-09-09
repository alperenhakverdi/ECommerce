using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs;

public class SavedCardDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CardHolderName { get; set; } = string.Empty;
    public string CardNumberMasked { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string CardType { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSavedCardDto
{
    [Required]
    [StringLength(100)]
    public string CardHolderName { get; set; } = string.Empty;

    [Required]
    [StringLength(19)] // Includes spaces/dashes
    public string CardNumber { get; set; } = string.Empty;

    [Range(1, 12)]
    public int ExpiryMonth { get; set; }

    [Range(2024, 2050)]
    public int ExpiryYear { get; set; }

    public bool IsDefault { get; set; } = false;
}

public class UpdateSavedCardDto
{
    [StringLength(100)]
    public string? CardHolderName { get; set; }

    [Range(1, 12)]
    public int? ExpiryMonth { get; set; }

    [Range(2024, 2050)]
    public int? ExpiryYear { get; set; }

    public bool? IsDefault { get; set; }
}