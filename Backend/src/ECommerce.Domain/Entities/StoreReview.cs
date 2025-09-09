using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class StoreReview : BaseEntity
{
    public Guid StoreId { get; set; }
    public Guid CustomerId { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string Comment { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false; // Verified purchase
    public bool IsApproved { get; set; } = true; // Admin moderation
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; } // Admin user ID

    // Navigation properties
    public Store Store { get; set; } = null!;
    public ApplicationUser Customer { get; set; } = null!;
    public ApplicationUser? Moderator { get; set; }
}