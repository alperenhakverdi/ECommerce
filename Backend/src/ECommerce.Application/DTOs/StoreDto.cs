namespace ECommerce.Application.DTOs;

public class CreateStoreDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    
    // Contact Information
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    
    // Business Information
    public string BusinessAddress { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
}

public class UpdateStoreDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    
    // Contact Information
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    
    // Business Information
    public string BusinessAddress { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    
    // Status (only store owner or admin can update these)
    public bool IsActive { get; set; } = true;
}

public class StoreResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    
    // Contact Information
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    
    // Business Information
    public string BusinessAddress { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    
    // Status & Metrics
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public decimal Rating { get; set; }
    public int TotalSales { get; set; }
    public int TotalProducts { get; set; }
    
    // Owner Information
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Computed Properties
    public string DisplayName => Name;
    public string StatusText => IsActive ? (IsApproved ? "Active" : "Pending Approval") : "Inactive";
    public string RatingText => $"{Rating:F1} ({TotalSales} sales)";
}

public class StoreListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    
    // Status & Metrics
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public decimal Rating { get; set; }
    public int TotalSales { get; set; }
    public int TotalProducts { get; set; }
    
    // Owner Information
    public string OwnerName { get; set; } = string.Empty;
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    
    // Computed Properties
    public string StatusText => IsActive ? (IsApproved ? "Active" : "Pending") : "Inactive";
    public string RatingDisplay => $"⭐ {Rating:F1}";
}

// Store approval DTO for Admin
public class StoreApprovalDto
{
    public bool IsApproved { get; set; }
    public string? ApprovalNotes { get; set; }
    public string? RejectionReason { get; set; }
}

// Store suspension DTO for Admin
public class StoreSuspensionDto
{
    public string SuspensionReason { get; set; } = string.Empty;
    public string? AdditionalNotes { get; set; }
}

// Store statistics DTO
public class StoreStatsDto
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public DateTime LastOrderDate { get; set; }
    public DateTime CreatedAt { get; set; }
}