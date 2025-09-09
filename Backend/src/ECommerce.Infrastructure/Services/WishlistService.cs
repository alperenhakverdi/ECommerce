using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class WishlistService : IWishlistService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WishlistService> _logger;

    public WishlistService(IUnitOfWork unitOfWork, ILogger<WishlistService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<WishlistDto> GetUserWishlistAsync(string userId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format");
            }

            var wishlist = await _unitOfWork.Repository<Wishlist>()
                .GetQueryable()
                .Include(w => w.Items)
                    .ThenInclude(wi => wi.Product)
                        .ThenInclude(p => p.Store)
                .FirstOrDefaultAsync(w => w.UserId == userGuid);

            if (wishlist == null)
            {
                // Create empty wishlist if none exists
                return new WishlistDto
                {
                    Id = Guid.Empty.ToString(),
                    UserId = userId,
                    Items = new List<WishlistItemDto>(),
                    TotalItems = 0,
                    UpdatedAt = DateTime.UtcNow
                };
            }

            return MapToWishlistDto(wishlist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting wishlist for user {UserId}", userId);
            throw;
        }
    }

    public async Task<WishlistDto> AddToWishlistAsync(string userId, AddToWishlistRequest request)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format");
            }

            if (!Guid.TryParse(request.ProductId, out var productGuid))
            {
                throw new ArgumentException("Invalid product ID format");
            }

            // Check if product exists
            var product = await _unitOfWork.Repository<Product>()
                .GetByIdAsync(productGuid);

            if (product == null)
            {
                throw new ArgumentException("Product not found");
            }

            // Get or create wishlist
            var wishlist = await _unitOfWork.Repository<Wishlist>()
                .GetQueryable()
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userGuid);

            if (wishlist == null)
            {
                wishlist = new Wishlist
                {
                    UserId = userGuid,
                    Items = new List<WishlistItem>()
                };
                await _unitOfWork.Repository<Wishlist>().AddAsync(wishlist);
            }

            // Check if item already exists
            var existingItem = wishlist.Items.FirstOrDefault(i => i.ProductId == productGuid);
            if (existingItem != null)
            {
                // Item already in wishlist, return current wishlist
                return await GetUserWishlistAsync(userId);
            }

            // Add new item
            var wishlistItem = new WishlistItem
            {
                WishlistId = wishlist.Id,
                ProductId = productGuid,
                AddedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<WishlistItem>().AddAsync(wishlistItem);
            await _unitOfWork.SaveChangesAsync();

            return await GetUserWishlistAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product {ProductId} to wishlist for user {UserId}", request.ProductId, userId);
            throw;
        }
    }

    public async Task<bool> RemoveFromWishlistAsync(string userId, string productId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format");
            }

            if (!Guid.TryParse(productId, out var productGuid))
            {
                throw new ArgumentException("Invalid product ID format");
            }

            var wishlist = await _unitOfWork.Repository<Wishlist>()
                .GetQueryable()
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userGuid);

            if (wishlist == null)
            {
                return false;
            }

            var item = wishlist.Items.FirstOrDefault(i => i.ProductId == productGuid);
            if (item == null)
            {
                return false;
            }

            await _unitOfWork.Repository<WishlistItem>().DeleteAsync(item.Id);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing product {ProductId} from wishlist for user {UserId}", productId, userId);
            throw;
        }
    }

    public async Task<bool> ClearWishlistAsync(string userId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format");
            }

            var wishlist = await _unitOfWork.Repository<Wishlist>()
                .GetQueryable()
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userGuid);

            if (wishlist == null || !wishlist.Items.Any())
            {
                return true; // Already empty
            }

            foreach (var item in wishlist.Items.ToList())
            {
                await _unitOfWork.Repository<WishlistItem>().DeleteAsync(item.Id);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing wishlist for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> IsInWishlistAsync(string userId, string productId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return false;
            }

            if (!Guid.TryParse(productId, out var productGuid))
            {
                return false;
            }

            var exists = await _unitOfWork.Repository<WishlistItem>()
                .GetQueryable()
                .AnyAsync(wi => wi.Wishlist.UserId == userGuid && wi.ProductId == productGuid);

            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if product {ProductId} is in wishlist for user {UserId}", productId, userId);
            return false;
        }
    }

    private static WishlistDto MapToWishlistDto(Wishlist wishlist)
    {
        return new WishlistDto
        {
            Id = wishlist.Id.ToString(),
            UserId = wishlist.UserId.ToString(),
            TotalItems = wishlist.Items?.Count ?? 0,
            UpdatedAt = wishlist.UpdatedAt ?? wishlist.CreatedAt,
            Items = wishlist.Items?.Select(item => new WishlistItemDto
            {
                Id = item.Id.ToString(),
                ProductId = item.ProductId.ToString(),
                ProductName = item.Product.Name,
                ProductPrice = item.Product.Price,
                ProductImageUrl = item.Product.ImageUrl,
                ProductDescription = item.Product.Description,
                StoreId = item.Product.StoreId?.ToString(),
                StoreName = item.Product.Store?.Name,
                IsAvailable = item.Product.IsActive && item.Product.Stock > 0,
                AddedAt = item.AddedAt
            }).ToList() ?? new List<WishlistItemDto>()
        };
    }
}