using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    public bool WantsToBecomeStoreOwner { get; set; } = false;

    // Store Information (only required if WantsToBecomeStoreOwner is true)
    public StoreDataDto? StoreData { get; set; }
}

public class StoreDataDto
{
    [StringLength(200)]
    public string StoreName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string StoreDescription { get; set; } = string.Empty;

    [StringLength(50)]
    public string BusinessCategory { get; set; } = string.Empty;

    [StringLength(20)]
    public string ContactPhone { get; set; } = string.Empty;

    [StringLength(500)]
    public string BusinessAddress { get; set; } = string.Empty;

    [StringLength(50)]
    public string TaxNumber { get; set; } = string.Empty;

    [StringLength(50)]
    public string BusinessType { get; set; } = string.Empty;

    [StringLength(200)]
    public string Website { get; set; } = string.Empty; // Optional
}