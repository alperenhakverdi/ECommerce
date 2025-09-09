using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using ECommerce.Infrastructure.Data;

namespace ECommerce.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;

    public ProductService(IUnitOfWork unitOfWork, ECommerceDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Where(p => p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                IsActive = p.IsActive,
                StoreId = p.StoreId,
                StoreName = p.Store != null ? p.Store.Name : "Direct Sale"
            })
            .ToListAsync();

        return products;
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Where(p => p.Id == id && p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                IsActive = p.IsActive,
                StoreId = p.StoreId,
                StoreName = p.Store != null ? p.Store.Name : "Direct Sale"
            })
            .FirstOrDefaultAsync();

        return product;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(Guid categoryId)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId && p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return products;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        var product = new Product
        {
            Name = createProductDto.Name,
            Description = createProductDto.Description,
            Price = createProductDto.Price,
            Stock = createProductDto.Stock,
            ImageUrl = createProductDto.ImageUrl,
            CategoryId = createProductDto.CategoryId,
            StoreId = createProductDto.StoreId,
            IsActive = true
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        var store = product.StoreId.HasValue && product.StoreId != Guid.Empty ? await _unitOfWork.Stores.GetByIdAsync(product.StoreId.Value) : null;

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name ?? "",
            IsActive = product.IsActive,
            StoreId = product.StoreId.HasValue && product.StoreId != Guid.Empty ? product.StoreId : null,
            StoreName = store?.Name ?? "Direct Sale"
        };
    }

    public async Task<ProductDto?> UpdateProductAsync(Guid id, UpdateProductDto updateProductDto)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return null;

        product.Name = updateProductDto.Name;
        product.Description = updateProductDto.Description;
        product.Price = updateProductDto.Price;
        product.Stock = updateProductDto.Stock;
        product.ImageUrl = updateProductDto.ImageUrl;
        product.CategoryId = updateProductDto.CategoryId;
        product.IsActive = updateProductDto.IsActive;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name ?? "",
            IsActive = product.IsActive
        };
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return false;

        product.IsActive = false; // Soft delete
        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && 
                       (p.Name.Contains(searchTerm) || 
                        p.Description.Contains(searchTerm)))
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return products;
    }

    public async Task<ProductSearchResponse> AdvancedSearchAsync(ProductSearchRequest request)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        // Text search
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(p => 
                p.Name.ToLower().Contains(searchLower) || 
                p.Description.ToLower().Contains(searchLower) ||
                p.Category.Name.ToLower().Contains(searchLower));
        }

        // Category filter
        if (request.CategoryId.HasValue && request.CategoryId != Guid.Empty)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId);
        }

        // Price filter
        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice);
        }
        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice);
        }

        // Stock filter
        if (request.InStockOnly.HasValue && request.InStockOnly.Value)
        {
            query = query.Where(p => p.Stock > 0);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "price" => request.SortDirection?.ToLower() == "desc" 
                ? query.OrderByDescending(p => p.Price) 
                : query.OrderBy(p => p.Price),
            "name" => request.SortDirection?.ToLower() == "desc" 
                ? query.OrderByDescending(p => p.Name) 
                : query.OrderBy(p => p.Name),
            "created" => request.SortDirection?.ToLower() == "desc" 
                ? query.OrderByDescending(p => p.Id) 
                : query.OrderBy(p => p.Id),
            "stock" => request.SortDirection?.ToLower() == "desc" 
                ? query.OrderByDescending(p => p.Stock) 
                : query.OrderBy(p => p.Stock),
            _ => query.OrderBy(p => p.Name) // Default sort by name
        };

        // Pagination
        var skip = (request.Page - 1) * request.PageSize;
        query = query.Skip(skip).Take(request.PageSize);

        var products = await query.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            ImageUrl = p.ImageUrl,
            CategoryId = p.CategoryId,
            CategoryName = p.Category.Name,
            IsActive = p.IsActive
        }).ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        // Get available filters
        var filters = await GetSearchFiltersAsync();

        return new ProductSearchResponse
        {
            Products = products,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = totalPages,
            AvailableFilters = filters
        };
    }

    public async Task<ProductSearchFilters> GetSearchFiltersAsync()
    {
        var activeProducts = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        // Category filters with product counts
        var categories = await activeProducts
            .GroupBy(p => new { p.CategoryId, p.Category.Name })
            .Select(g => new CategoryFilterDto
            {
                Id = g.Key.CategoryId,
                Name = g.Key.Name,
                ProductCount = g.Count()
            })
            .OrderBy(c => c.Name)
            .ToListAsync();

        // Price range
        var priceStats = await activeProducts
            .Select(p => p.Price)
            .ToListAsync();

        var priceRange = new PriceRangeDto();
        if (priceStats.Any())
        {
            priceRange.MinPrice = priceStats.Min();
            priceRange.MaxPrice = priceStats.Max();
        }

        // Stock statistics
        var inStockCount = await activeProducts.CountAsync(p => p.Stock > 0);
        var outOfStockCount = await activeProducts.CountAsync(p => p.Stock == 0);

        return new ProductSearchFilters
        {
            Categories = categories,
            PriceRange = priceRange,
            TotalInStock = inStockCount,
            TotalOutOfStock = outOfStockCount
        };
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByStoreAsync(Guid storeId)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Where(p => p.StoreId == storeId && p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                IsActive = p.IsActive,
                StoreId = p.StoreId,
                StoreName = p.Store != null ? p.Store.Name : "Direct Sale"
            })
            .ToListAsync();

        return products;
    }

    public async Task<ProductDto> CreateProductForStoreAsync(Guid storeId, CreateProductDto createProductDto)
    {
        var product = new Product
        {
            Name = createProductDto.Name,
            Description = createProductDto.Description,
            Price = createProductDto.Price,
            Stock = createProductDto.Stock,
            ImageUrl = createProductDto.ImageUrl,
            CategoryId = createProductDto.CategoryId,
            StoreId = storeId,
            IsActive = true
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        // Reload with category and store info
        var createdProduct = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .FirstAsync(p => p.Id == product.Id);

        return new ProductDto
        {
            Id = createdProduct.Id,
            Name = createdProduct.Name,
            Description = createdProduct.Description,
            Price = createdProduct.Price,
            Stock = createdProduct.Stock,
            ImageUrl = createdProduct.ImageUrl,
            CategoryId = createdProduct.CategoryId,
            CategoryName = createdProduct.Category.Name,
            IsActive = createdProduct.IsActive,
            StoreId = createdProduct.StoreId,
            StoreName = createdProduct.Store?.Name ?? "Direct Sale"
        };
    }

    public async Task<ProductDto?> UpdateProductForStoreAsync(Guid productId, Guid storeId, UpdateProductDto updateProductDto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.StoreId == storeId);

        if (product == null)
            return null;

        product.Name = updateProductDto.Name;
        product.Description = updateProductDto.Description;
        product.Price = updateProductDto.Price;
        product.Stock = updateProductDto.Stock;
        product.ImageUrl = updateProductDto.ImageUrl;
        product.CategoryId = updateProductDto.CategoryId;
        product.IsActive = updateProductDto.IsActive;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        // Reload with category and store info
        var updatedProduct = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .FirstAsync(p => p.Id == product.Id);

        return new ProductDto
        {
            Id = updatedProduct.Id,
            Name = updatedProduct.Name,
            Description = updatedProduct.Description,
            Price = updatedProduct.Price,
            Stock = updatedProduct.Stock,
            ImageUrl = updatedProduct.ImageUrl,
            CategoryId = updatedProduct.CategoryId,
            CategoryName = updatedProduct.Category.Name,
            IsActive = updatedProduct.IsActive,
            StoreId = updatedProduct.StoreId,
            StoreName = updatedProduct.Store?.Name ?? "Direct Sale"
        };
    }

    public async Task<bool> DeleteProductForStoreAsync(Guid productId, Guid storeId)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.StoreId == storeId);

        if (product == null)
            return false;

        // Soft delete
        product.IsActive = false;
        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CanUserManageProductAsync(Guid productId, Guid userId)
    {
        // Check if user owns the store that owns this product
        var product = await _context.Products
            .Include(p => p.Store)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product?.Store == null)
            return false; // Product has no store or doesn't exist

        return product.Store.OwnerId == userId;
    }
}