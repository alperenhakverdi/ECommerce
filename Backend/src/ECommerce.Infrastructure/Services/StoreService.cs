using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ECommerce.Domain.Enums;

namespace ECommerce.Infrastructure.Services;

public class StoreService : IStoreService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;
    private readonly ILogger<StoreService> _logger;

    public StoreService(IUnitOfWork unitOfWork, ECommerceDbContext context, ILogger<StoreService> logger)
    {
        _unitOfWork = unitOfWork;
        _context = context;
        _logger = logger;
    }

    public async Task<StoreResponseDto> CreateAsync(Guid userId, CreateStoreDto createStoreDto)
    {
        var store = new Store
        {
            OwnerId = userId,
            Name = createStoreDto.Name,
            Description = createStoreDto.Description,
            LogoUrl = createStoreDto.LogoUrl,
            BannerUrl = createStoreDto.BannerUrl,
            ContactEmail = createStoreDto.ContactEmail,
            ContactPhone = createStoreDto.ContactPhone,
            Website = createStoreDto.Website,
            BusinessAddress = createStoreDto.BusinessAddress,
            TaxNumber = createStoreDto.TaxNumber,
            IsActive = true,
            IsApproved = false,
            Rating = 0,
            TotalSales = 0,
            TotalProducts = 0
        };

        await _unitOfWork.Stores.AddAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return await MapStoreToResponseDto(store);
    }

    public async Task<StoreResponseDto?> GetByIdAsync(Guid storeId)
    {
        var store = await _context.Stores
            .Include(s => s.Owner)
            .FirstOrDefaultAsync(s => s.Id == storeId);

        return store == null ? null : await MapStoreToResponseDto(store);
    }

    public async Task<IEnumerable<StoreListDto>> GetAllAsync()
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return stores.Select(MapStoreToListDto);
    }

    public async Task<IEnumerable<StoreListDto>> GetByOwnerAsync(Guid ownerId)
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.OwnerId == ownerId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return stores.Select(MapStoreToListDto);
    }

    public async Task<StoreResponseDto?> UpdateAsync(Guid storeId, Guid userId, UpdateStoreDto updateStoreDto)
    {
        var store = await _context.Stores
            .Include(s => s.Owner)
            .FirstOrDefaultAsync(s => s.Id == storeId);

        if (store == null || store.OwnerId != userId)
            return null;

        store.Name = updateStoreDto.Name;
        store.Description = updateStoreDto.Description;
        store.LogoUrl = updateStoreDto.LogoUrl;
        store.BannerUrl = updateStoreDto.BannerUrl;
        store.ContactEmail = updateStoreDto.ContactEmail;
        store.ContactPhone = updateStoreDto.ContactPhone;
        store.Website = updateStoreDto.Website;
        store.BusinessAddress = updateStoreDto.BusinessAddress;
        store.TaxNumber = updateStoreDto.TaxNumber;
        store.IsActive = updateStoreDto.IsActive;
        store.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return await MapStoreToResponseDto(store);
    }

    public async Task<bool> DeleteAsync(Guid storeId, Guid userId)
    {
        var store = await _context.Stores
            .FirstOrDefaultAsync(s => s.Id == storeId && s.OwnerId == userId);

        if (store == null)
            return false;

        // Check if store has active products
        var hasActiveProducts = await _context.Products
            .AnyAsync(p => p.StoreId == storeId && p.IsActive);

        if (hasActiveProducts)
        {
            // Soft delete - deactivate store but keep data
            store.IsActive = false;
            store.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Stores.UpdateAsync(store);
        }
        else
        {
            // Hard delete if no products
            await _unitOfWork.Stores.DeleteAsync(store.Id);
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveStoreAsync(Guid storeId, StoreApprovalDto approvalDto)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return false;

        if (approvalDto.IsApproved)
        {
            store.Status = Domain.Enums.StoreStatus.Active;
            store.IsApproved = true; // Keep for backward compatibility
            store.IsActive = true; // Keep for backward compatibility
        }
        else
        {
            store.Status = Domain.Enums.StoreStatus.Rejected;
            store.IsApproved = false; // Keep for backward compatibility
            store.IsActive = false; // Keep for backward compatibility
        }
        
        store.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> SuspendStoreAsync(Guid storeId, string suspensionReason)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return false;

        // Suspend the store by setting status and fields
        store.Status = Domain.Enums.StoreStatus.Suspended;
        store.IsActive = false; // Keep for backward compatibility
        store.SuspensionReason = suspensionReason;
        store.SuspendedAt = DateTime.UtcNow;
        store.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Store suspended: {StoreId}, Reason: {Reason}", storeId, suspensionReason);

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReactivateStoreAsync(Guid storeId)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return false;

        // Reactivate the store
        store.Status = Domain.Enums.StoreStatus.Active;
        store.IsActive = true; // Keep for backward compatibility
        store.IsApproved = true; // Keep for backward compatibility
        store.SuspensionReason = null;
        store.SuspendedAt = null;
        store.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Store reactivated: {StoreId}", storeId);

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectStoreAsync(Guid storeId, string rejectionReason)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return false;

        // Reject the store
        store.Status = Domain.Enums.StoreStatus.Rejected;
        store.IsActive = false; // Keep for backward compatibility
        store.IsApproved = false; // Keep for backward compatibility
        store.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Store rejected: {StoreId}, Reason: {Reason}", storeId, rejectionReason);

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<StoreListDto>> GetPendingApprovalsAsync()
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.Status == Domain.Enums.StoreStatus.Pending)
            .OrderBy(s => s.CreatedAt)
            .ToListAsync();

        return stores.Select(MapStoreToListDto);
    }

    public async Task<IEnumerable<StoreListDto>> GetSuspendedStoresAsync()
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.Status == Domain.Enums.StoreStatus.Suspended)
            .OrderBy(s => s.SuspendedAt)
            .ToListAsync();

        return stores.Select(MapStoreToListDto);
    }

    public async Task<StoreStatsDto?> GetStoreStatsAsync(Guid storeId)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return null;

        var totalProducts = await _context.Products
            .CountAsync(p => p.StoreId == storeId && p.IsActive);

        var totalOrders = await _context.Orders
            .CountAsync(o => o.StoreId == storeId);

        var totalRevenue = await _context.Orders
            .Where(o => o.StoreId == storeId && o.Status == Domain.Enums.OrderStatus.Delivered)
            .SumAsync(o => o.TotalAmount);

        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        var lastOrderDate = await _context.Orders
            .Where(o => o.StoreId == storeId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        // Review count would come from reviews system (not implemented yet)
        var reviewCount = 0;

        return new StoreStatsDto
        {
            StoreId = storeId,
            StoreName = store.Name,
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            AverageOrderValue = averageOrderValue,
            Rating = store.Rating,
            ReviewCount = reviewCount,
            LastOrderDate = lastOrderDate,
            CreatedAt = store.CreatedAt
        };
    }

    public async Task<bool> UpdateStoreMetricsAsync(Guid storeId)
    {
        var store = await _context.Stores.FindAsync(storeId);
        if (store == null)
            return false;

        var totalProducts = await _context.Products
            .CountAsync(p => p.StoreId == storeId && p.IsActive);

        var totalSales = await _context.Orders
            .CountAsync(o => o.StoreId == storeId && o.Status == Domain.Enums.OrderStatus.Delivered);

        store.TotalProducts = totalProducts;
        store.TotalSales = totalSales;
        store.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Stores.UpdateAsync(store);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<StoreListDto>> SearchStoresAsync(string searchTerm)
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.IsActive && s.IsApproved &&
                       (s.Name.Contains(searchTerm) || 
                        s.Description.Contains(searchTerm)))
            .ToListAsync();

        return stores
            .OrderByDescending(s => s.Rating)
            .ThenByDescending(s => s.TotalSales)
            .Select(MapStoreToListDto);
    }

    public async Task<IEnumerable<StoreListDto>> GetActiveStoresAsync()
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.IsActive && s.IsApproved)
            .ToListAsync();

        return stores
            .OrderByDescending(s => s.Rating)
            .ThenByDescending(s => s.TotalSales)
            .Select(MapStoreToListDto);
    }

    public async Task<IEnumerable<StoreListDto>> GetTopRatedStoresAsync(int count = 10)
    {
        var stores = await _context.Stores
            .Include(s => s.Owner)
            .Where(s => s.IsActive && s.IsApproved)
            .ToListAsync();

        return stores
            .OrderByDescending(s => s.Rating)
            .ThenByDescending(s => s.TotalSales)
            .Take(count)
            .Select(MapStoreToListDto);
    }

    public async Task<bool> IsStoreOwnerAsync(Guid storeId, Guid userId)
    {
        return await _context.Stores
            .AnyAsync(s => s.Id == storeId && s.OwnerId == userId);
    }

    public async Task<bool> CanUserManageStoreAsync(Guid storeId, Guid userId)
    {
        // Store owner can manage, or admin users (would need role check)
        return await IsStoreOwnerAsync(storeId, userId);
    }

    public async Task<int> GetProductCountAsync(Guid storeId)
    {
        return await _context.Products
            .CountAsync(p => p.StoreId == storeId && p.IsActive);
    }

    public async Task<bool> HasActiveProductsAsync(Guid storeId)
    {
        return await _context.Products
            .AnyAsync(p => p.StoreId == storeId && p.IsActive);
    }

    private async Task<StoreResponseDto> MapStoreToResponseDto(Store store)
    {
        // Ensure Owner is loaded
        if (store.Owner == null)
        {
            store = await _context.Stores
                .Include(s => s.Owner)
                .FirstAsync(s => s.Id == store.Id);
        }

        return new StoreResponseDto
        {
            Id = store.Id,
            Name = store.Name,
            Description = store.Description,
            LogoUrl = store.LogoUrl,
            BannerUrl = store.BannerUrl,
            ContactEmail = store.ContactEmail,
            ContactPhone = store.ContactPhone,
            Website = store.Website,
            BusinessAddress = store.BusinessAddress,
            TaxNumber = store.TaxNumber,
            IsActive = store.IsActive,
            IsApproved = store.IsApproved,
            Rating = store.Rating,
            TotalSales = store.TotalSales,
            TotalProducts = store.TotalProducts,
            OwnerId = store.OwnerId,
            OwnerName = store.Owner?.FirstName + " " + store.Owner?.LastName ?? "Unknown",
            OwnerEmail = store.Owner?.Email ?? "Unknown",
            CreatedAt = store.CreatedAt,
            UpdatedAt = store.UpdatedAt
        };
    }

    public async Task<IEnumerable<ProductDto>> GetProductsAsync(Guid storeId, int page = 1, int pageSize = 50)
    {
        try
        {
            var skip = (page - 1) * pageSize;
            
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.StoreId == storeId && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return products.Select(MapProductToDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products for store {StoreId}", storeId);
            return new List<ProductDto>();
        }
    }

    private static ProductDto MapProductToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            BasePrice = product.BasePrice,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? "",
            IsActive = product.IsActive,
            HasVariants = product.HasVariants,
            Weight = product.Weight,
            Tags = product.Tags,
            StoreId = product.StoreId,
            StoreName = ""  // Store name will be filled by caller if needed
        };
    }

    public async Task<ProductDto> CreateProductAsync(Guid storeId, CreateProductDto createProductDto)
    {
        _logger.LogInformation("Creating product for store: {StoreId}", storeId);
        
        // Verify store exists and is active
        var store = await _unitOfWork.Stores.GetByIdAsync(storeId);
        if (store == null)
            throw new ArgumentException($"Store with ID {storeId} not found");
        
        if (!store.IsActive || !store.IsApproved)
            throw new InvalidOperationException($"Store {storeId} is not active or approved");

        // Create new product
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = createProductDto.Name,
            Description = createProductDto.Description,
            Price = createProductDto.Price,
            BasePrice = createProductDto.Price, // Use same price as base price
            Stock = createProductDto.Stock,
            ImageUrl = createProductDto.ImageUrl ?? string.Empty,
            CategoryId = createProductDto.CategoryId,
            StoreId = storeId,
            IsActive = true,
            HasVariants = false,
            Weight = 0,
            Tags = createProductDto.Tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Products.AddAsync(product);
        
        // Update store product count
        store.TotalProducts++;
        // Store will be updated through context tracking
        
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product created successfully: {ProductId} for store: {StoreId}", product.Id, storeId);
        
        return MapProductToDto(product);
    }

    public async Task<IEnumerable<OrderDto>> GetStoreOrdersAsync(Guid storeId, int page = 1, int pageSize = 50)
    {
        try
        {
            var skip = (page - 1) * pageSize;

            // Fetch orders that belong to this store (either assigned directly or via items of products in this store)
            var orders = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Where(o => (o.StoreId.HasValue && o.StoreId == storeId)
                            || o.Items.Any(oi => oi.Product != null && oi.Product.StoreId == storeId))
                .OrderByDescending(o => o.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            // Map to OrderDto; include only items that belong to this store and recompute TotalAmount accordingly
            var result = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                OrderNumber = o.OrderNumber,
                // Sum only items from this store for store owner's perspective
                TotalAmount = o.Items
                    .Where(oi => oi.Product != null && oi.Product.StoreId == storeId)
                    .Sum(oi => oi.Price * oi.Quantity),
                Status = o.Status,
                CustomerEmail = o.CustomerEmail,
                CustomerName = o.CustomerName,
                AddressId = o.AddressId,
                ShippingAddress = MapAddressToDto(o.ShippingAddress),
                CreatedAt = o.CreatedAt,
                ShippedDate = o.ShippedDate,
                DeliveredDate = o.DeliveredDate,
                Items = o.Items
                    .Where(oi => oi.Product != null && oi.Product.StoreId == storeId)
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        SubTotal = oi.Price * oi.Quantity
                    }).ToList()
            });

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting orders for store {StoreId}", storeId);
            return new List<OrderDto>();
        }
    }

    private static AddressResponseDto MapAddressToDto(Address address)
    {
        return new AddressResponseDto
        {
            Id = address.Id,
            Title = address.Title,
            FirstName = address.FirstName,
            LastName = address.LastName,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            PhoneNumber = address.PhoneNumber,
            IsDefault = address.IsDefault,
            IsActive = address.IsActive,
            UserId = address.UserId,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt
        };
    }

    public async Task<bool> CanStoreManageOrderAsync(Guid storeId, Guid orderId)
    {
        // Order belongs to store if Order.StoreId == storeId OR at least one item product.StoreId == storeId
        var belongs = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
            .AnyAsync(o => o.Id == orderId && (
                (o.StoreId.HasValue && o.StoreId == storeId) ||
                o.Items.Any(oi => oi.Product != null && oi.Product.StoreId == storeId)
            ));
        return belongs;
    }

    private static StoreListDto MapStoreToListDto(Store store)
    {
        return new StoreListDto
        {
            Id = store.Id,
            Name = store.Name,
            Description = store.Description,
            LogoUrl = store.LogoUrl,
            ContactEmail = store.ContactEmail,
            ContactPhone = store.ContactPhone,
            IsActive = store.IsActive,
            IsApproved = store.IsApproved,
            Rating = store.Rating,
            TotalSales = store.TotalSales,
            TotalProducts = store.TotalProducts,
            OwnerName = store.Owner?.FirstName + " " + store.Owner?.LastName ?? "Unknown",
            CreatedAt = store.CreatedAt
        };
    }
}
