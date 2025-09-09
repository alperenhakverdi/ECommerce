namespace ECommerce.Application.DTOs;

public class WishlistDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public List<WishlistItemDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class WishlistItemDto
{
    public string Id { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string? ProductImageUrl { get; set; }
    public string? ProductDescription { get; set; }
    public string? StoreId { get; set; }
    public string? StoreName { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime AddedAt { get; set; }
}

public class AddToWishlistRequest
{
    public string ProductId { get; set; } = string.Empty;
}

public class RemoveFromWishlistRequest
{
    public string ProductId { get; set; } = string.Empty;
}