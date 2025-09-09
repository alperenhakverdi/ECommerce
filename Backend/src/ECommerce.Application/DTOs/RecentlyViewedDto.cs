namespace ECommerce.Application.DTOs;

public class RecentlyViewedItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public ProductDto Product { get; set; } = null!;
    public DateTime ViewedAt { get; set; }
}