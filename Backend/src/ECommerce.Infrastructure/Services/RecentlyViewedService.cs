using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class RecentlyViewedService : IRecentlyViewedService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RecentlyViewedService> _logger;
    private const int MaxRecentlyViewedItems = 20; // Limit to prevent excessive storage

    public RecentlyViewedService(IUnitOfWork unitOfWork, ILogger<RecentlyViewedService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<RecentlyViewedItemDto>> GetRecentlyViewedAsync(string userId, int take = 10)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return new List<RecentlyViewedItemDto>();
            }

            var recentItems = await _unitOfWork.Repository<RecentlyViewed>()
                .GetQueryable()
                .Include(rv => rv.Product)
                    .ThenInclude(p => p.Category)
                .Include(rv => rv.Product)
                    .ThenInclude(p => p.Store)
                .Where(rv => rv.UserId == userGuid && rv.Product.IsActive)
                .OrderByDescending(rv => rv.ViewedAt)
                .Take(take)
                .ToListAsync();

            return recentItems.Select(item => new RecentlyViewedItemDto
            {
                ProductId = item.ProductId.ToString(),
                ViewedAt = item.ViewedAt,
                Product = MapToProductDto(item.Product)
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recently viewed items for user {UserId}", userId);
            return new List<RecentlyViewedItemDto>();
        }
    }

    public async Task AddToRecentlyViewedAsync(string userId, string productId)
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

            // Check if product exists
            var product = await _unitOfWork.Repository<Product>()
                .GetByIdAsync(productGuid);

            if (product == null || !product.IsActive)
            {
                return; // Don't track inactive products
            }

            // Check if already exists
            var existing = await _unitOfWork.Repository<RecentlyViewed>()
                .GetQueryable()
                .FirstOrDefaultAsync(rv => rv.UserId == userGuid && rv.ProductId == productGuid);

            if (existing != null)
            {
                // Update view time
                existing.ViewedAt = DateTime.UtcNow;
                existing.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Repository<RecentlyViewed>().UpdateAsync(existing);
            }
            else
            {
                // Add new entry
                var recentlyViewed = new RecentlyViewed
                {
                    UserId = userGuid,
                    ProductId = productGuid,
                    ViewedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<RecentlyViewed>().AddAsync(recentlyViewed);

                // Clean up old entries to prevent unlimited growth
                await CleanupOldEntries(userGuid);
            }

            await _unitOfWork.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product {ProductId} to recently viewed for user {UserId}", productId, userId);
            // Don't throw - recently viewed is not critical functionality
        }
    }

    public async Task<bool> RemoveFromRecentlyViewedAsync(string userId, string productId)
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

            var item = await _unitOfWork.Repository<RecentlyViewed>()
                .GetQueryable()
                .FirstOrDefaultAsync(rv => rv.UserId == userGuid && rv.ProductId == productGuid);

            if (item == null)
            {
                return false;
            }

            await _unitOfWork.Repository<RecentlyViewed>().DeleteAsync(item.Id);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing product {ProductId} from recently viewed for user {UserId}", productId, userId);
            return false;
        }
    }

    public async Task<bool> ClearRecentlyViewedAsync(string userId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return false;
            }

            var items = await _unitOfWork.Repository<RecentlyViewed>()
                .GetQueryable()
                .Where(rv => rv.UserId == userGuid)
                .ToListAsync();

            foreach (var item in items)
            {
                await _unitOfWork.Repository<RecentlyViewed>().DeleteAsync(item.Id);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing recently viewed for user {UserId}", userId);
            return false;
        }
    }

    private async Task CleanupOldEntries(Guid userId)
    {
        var totalCount = await _unitOfWork.Repository<RecentlyViewed>()
            .GetQueryable()
            .CountAsync(rv => rv.UserId == userId);

        if (totalCount <= MaxRecentlyViewedItems)
        {
            return;
        }

        var itemsToRemove = await _unitOfWork.Repository<RecentlyViewed>()
            .GetQueryable()
            .Where(rv => rv.UserId == userId)
            .OrderByDescending(rv => rv.ViewedAt)
            .Skip(MaxRecentlyViewedItems)
            .ToListAsync();

        foreach (var item in itemsToRemove)
        {
            await _unitOfWork.Repository<RecentlyViewed>().DeleteAsync(item.Id);
        }
    }

    private static ProductDto MapToProductDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? "",
            StoreId = product.StoreId,
            StoreName = product.Store?.Name ?? "",
            IsActive = product.IsActive
        };
    }
}