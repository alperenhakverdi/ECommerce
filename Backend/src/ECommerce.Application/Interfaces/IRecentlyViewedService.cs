using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IRecentlyViewedService
{
    Task<List<RecentlyViewedItemDto>> GetRecentlyViewedAsync(string userId, int take = 10);
    Task AddToRecentlyViewedAsync(string userId, string productId);
    Task<bool> RemoveFromRecentlyViewedAsync(string userId, string productId);
    Task<bool> ClearRecentlyViewedAsync(string userId);
}