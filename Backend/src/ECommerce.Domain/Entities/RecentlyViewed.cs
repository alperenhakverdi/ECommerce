using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class RecentlyViewed : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}