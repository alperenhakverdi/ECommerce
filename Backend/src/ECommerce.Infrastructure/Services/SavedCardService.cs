using System.Security.Cryptography;
using System.Text;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class SavedCardService : ISavedCardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;

    public SavedCardService(IUnitOfWork unitOfWork, ECommerceDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<SavedCardDto>> GetUserSavedCardsAsync(Guid userId)
    {
        var savedCards = await _context.SavedCards
            .Where(sc => sc.UserId == userId && sc.IsActive)
            .OrderByDescending(sc => sc.IsDefault)
            .ThenByDescending(sc => sc.CreatedAt)
            .ToListAsync();

        return savedCards.Select(MapToDto);
    }

    public async Task<SavedCardDto?> GetSavedCardByIdAsync(Guid cardId, Guid userId)
    {
        var savedCard = await _context.SavedCards
            .FirstOrDefaultAsync(sc => sc.Id == cardId && sc.UserId == userId && sc.IsActive);

        return savedCard != null ? MapToDto(savedCard) : null;
    }

    public async Task<SavedCardDto> CreateSavedCardAsync(Guid userId, CreateSavedCardDto createCardDto)
    {
        // Remove spaces and dashes from card number
        var cleanCardNumber = createCardDto.CardNumber.Replace(" ", "").Replace("-", "");
        
        // Validate card number (basic Luhn algorithm could be added here)
        if (cleanCardNumber.Length < 13 || cleanCardNumber.Length > 19)
        {
            throw new ArgumentException("Invalid card number length");
        }

        // Hash the card number for security
        var cardNumberHash = HashCardNumber(cleanCardNumber);
        
        // Create masked version (show only last 4 digits)
        var cardNumberMasked = "****-****-****-" + cleanCardNumber.Substring(cleanCardNumber.Length - 4);
        
        // Detect card type based on first digit(s)
        var cardType = DetectCardType(cleanCardNumber);

        // If this is set as default, remove default from other cards
        if (createCardDto.IsDefault)
        {
            await RemoveDefaultFromAllCardsAsync(userId);
        }

        var savedCard = new SavedCard
        {
            UserId = userId,
            CardHolderName = createCardDto.CardHolderName,
            CardNumberMasked = cardNumberMasked,
            CardNumberHash = cardNumberHash,
            ExpiryMonth = createCardDto.ExpiryMonth,
            ExpiryYear = createCardDto.ExpiryYear,
            CardType = cardType,
            IsDefault = createCardDto.IsDefault,
            IsActive = true
        };

        await _unitOfWork.Repository<SavedCard>().AddAsync(savedCard);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(savedCard);
    }

    public async Task<SavedCardDto?> UpdateSavedCardAsync(Guid cardId, Guid userId, UpdateSavedCardDto updateCardDto)
    {
        var savedCard = await _context.SavedCards
            .FirstOrDefaultAsync(sc => sc.Id == cardId && sc.UserId == userId && sc.IsActive);

        if (savedCard == null) return null;

        // Update properties if provided
        if (!string.IsNullOrEmpty(updateCardDto.CardHolderName))
            savedCard.CardHolderName = updateCardDto.CardHolderName;

        if (updateCardDto.ExpiryMonth.HasValue)
            savedCard.ExpiryMonth = updateCardDto.ExpiryMonth.Value;

        if (updateCardDto.ExpiryYear.HasValue)
            savedCard.ExpiryYear = updateCardDto.ExpiryYear.Value;

        if (updateCardDto.IsDefault.HasValue)
        {
            if (updateCardDto.IsDefault.Value)
            {
                // Remove default from other cards first
                await RemoveDefaultFromAllCardsAsync(userId);
            }
            savedCard.IsDefault = updateCardDto.IsDefault.Value;
        }

        await _unitOfWork.Repository<SavedCard>().UpdateAsync(savedCard);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(savedCard);
    }

    public async Task<bool> DeleteSavedCardAsync(Guid cardId, Guid userId)
    {
        var savedCard = await _context.SavedCards
            .FirstOrDefaultAsync(sc => sc.Id == cardId && sc.UserId == userId && sc.IsActive);

        if (savedCard == null) return false;

        // Soft delete
        savedCard.IsActive = false;

        await _unitOfWork.Repository<SavedCard>().UpdateAsync(savedCard);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> SetDefaultCardAsync(Guid cardId, Guid userId)
    {
        var savedCard = await _context.SavedCards
            .FirstOrDefaultAsync(sc => sc.Id == cardId && sc.UserId == userId && sc.IsActive);

        if (savedCard == null) return false;

        // Remove default from all other cards
        await RemoveDefaultFromAllCardsAsync(userId);

        // Set this card as default
        savedCard.IsDefault = true;
        await _unitOfWork.Repository<SavedCard>().UpdateAsync(savedCard);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    private async Task RemoveDefaultFromAllCardsAsync(Guid userId)
    {
        var defaultCards = await _context.SavedCards
            .Where(sc => sc.UserId == userId && sc.IsDefault && sc.IsActive)
            .ToListAsync();

        foreach (var card in defaultCards)
        {
            card.IsDefault = false;
            await _unitOfWork.Repository<SavedCard>().UpdateAsync(card);
        }
    }

    private static string HashCardNumber(string cardNumber)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(cardNumber + "SALT_SECRET_KEY"));
        return Convert.ToBase64String(hashedBytes);
    }

    private static string DetectCardType(string cardNumber)
    {
        if (cardNumber.StartsWith("4"))
            return "Visa";
        else if (cardNumber.StartsWith("5") || cardNumber.StartsWith("2"))
            return "MasterCard";
        else if (cardNumber.StartsWith("3"))
            return "American Express";
        else
            return "Unknown";
    }

    private static SavedCardDto MapToDto(SavedCard savedCard)
    {
        return new SavedCardDto
        {
            Id = savedCard.Id,
            UserId = savedCard.UserId,
            CardHolderName = savedCard.CardHolderName,
            CardNumberMasked = savedCard.CardNumberMasked,
            ExpiryMonth = savedCard.ExpiryMonth,
            ExpiryYear = savedCard.ExpiryYear,
            CardType = savedCard.CardType,
            IsDefault = savedCard.IsDefault,
            IsActive = savedCard.IsActive,
            CreatedAt = savedCard.CreatedAt
        };
    }
}