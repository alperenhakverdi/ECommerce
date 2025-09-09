using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class SavedCard : BaseEntity
{
    public Guid UserId { get; set; }
    public string CardHolderName { get; set; } = string.Empty;
    public string CardNumberMasked { get; set; } = string.Empty; // Only last 4 digits shown (****-****-****-1234)
    public string CardNumberHash { get; set; } = string.Empty; // Hashed version for security
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string CardType { get; set; } = string.Empty; // Visa, MasterCard, etc.
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}