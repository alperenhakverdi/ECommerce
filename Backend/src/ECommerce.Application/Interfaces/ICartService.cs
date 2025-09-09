using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId);
    Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto addToCartDto);
    Task<CartDto?> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto updateCartItemDto);
    Task<bool> RemoveFromCartAsync(Guid userId, Guid cartItemId);
    Task<bool> ClearCartAsync(Guid userId);
}