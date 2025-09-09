using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}