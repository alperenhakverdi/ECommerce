using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key to ApplicationUser
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    
    // For tracking token usage
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime? UsedAt { get; set; }
    
    // For token replacement (when refreshed)
    public Guid? ReplacedByTokenId { get; set; }
    public RefreshToken? ReplacedByToken { get; set; }
    
    public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
    public bool IsActive => !IsRevoked && !IsExpired;
}