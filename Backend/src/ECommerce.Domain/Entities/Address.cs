using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Address : BaseEntity
{
    public string Title { get; set; } = string.Empty; // e.g., "Home", "Office", "Work"
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Foreign Key
    public Guid UserId { get; set; }

    // Navigation Property
    public ApplicationUser User { get; set; } = null!;
    
    // Navigation properties for orders
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}