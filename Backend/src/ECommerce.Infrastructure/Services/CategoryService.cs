using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;

    public CategoryService(IUnitOfWork unitOfWork, ECommerceDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync();

        return categories;
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id && c.IsActive)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .FirstOrDefaultAsync();

        return category;
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
    {
        var category = new Category
        {
            Name = createCategoryDto.Name,
            Description = createCategoryDto.Description,
            IsActive = true
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ProductCount = 0
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(Guid id, UpdateCategoryDto updateCategoryDto)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return null;

        category.Name = updateCategoryDto.Name;
        category.Description = updateCategoryDto.Description;
        category.IsActive = updateCategoryDto.IsActive;

        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        var productCount = await _context.Products
            .CountAsync(p => p.CategoryId == id && p.IsActive);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ProductCount = productCount
        };
    }

    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return false;

        // Check if category has products
        var hasProducts = await _context.Products
            .AnyAsync(p => p.CategoryId == id && p.IsActive);

        if (hasProducts)
        {
            throw new InvalidOperationException("Cannot delete category with active products");
        }

        category.IsActive = false; // Soft delete
        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}