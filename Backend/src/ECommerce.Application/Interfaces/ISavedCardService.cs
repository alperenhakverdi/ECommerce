using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface ISavedCardService
{
    Task<IEnumerable<SavedCardDto>> GetUserSavedCardsAsync(Guid userId);
    Task<SavedCardDto?> GetSavedCardByIdAsync(Guid cardId, Guid userId);
    Task<SavedCardDto> CreateSavedCardAsync(Guid userId, CreateSavedCardDto createCardDto);
    Task<SavedCardDto?> UpdateSavedCardAsync(Guid cardId, Guid userId, UpdateSavedCardDto updateCardDto);
    Task<bool> DeleteSavedCardAsync(Guid cardId, Guid userId);
    Task<bool> SetDefaultCardAsync(Guid cardId, Guid userId);
}