using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IWishlistService
{
    Task<WishlistDto> GetUserWishlistAsync(string userId);
    Task<WishlistDto> AddToWishlistAsync(string userId, AddToWishlistRequest request);
    Task<bool> RemoveFromWishlistAsync(string userId, string productId);
    Task<bool> ClearWishlistAsync(string userId);
    Task<bool> IsInWishlistAsync(string userId, string productId);
}