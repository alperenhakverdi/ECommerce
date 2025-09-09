using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
    Task<CategoryDto?> UpdateCategoryAsync(Guid id, UpdateCategoryDto updateCategoryDto);
    Task<bool> DeleteCategoryAsync(Guid id);
}