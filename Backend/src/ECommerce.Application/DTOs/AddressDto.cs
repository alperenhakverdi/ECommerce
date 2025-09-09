namespace ECommerce.Application.DTOs;

public class CreateAddressDto
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
}

public class UpdateAddressDto
{
    public string Title { get; set; } = string.Empty;
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
}

// AddressDto moved from OrderDto.cs to this dedicated file
public class AddressResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Computed property for display
    public string FullName => $"{FirstName} {LastName}";
    public string FullAddress => $"{AddressLine1}" + 
        (string.IsNullOrEmpty(AddressLine2) ? "" : $", {AddressLine2}") + 
        $", {City}, {State} {PostalCode}, {Country}";
}