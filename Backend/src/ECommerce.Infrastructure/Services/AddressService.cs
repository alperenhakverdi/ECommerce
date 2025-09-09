using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class AddressService : IAddressService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;

    public AddressService(IUnitOfWork unitOfWork, ECommerceDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<AddressResponseDto>> GetUserAddressesAsync(Guid userId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId && a.IsActive)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return addresses.Select(MapAddressToResponseDto);
    }

    public async Task<AddressResponseDto?> GetAddressByIdAsync(Guid addressId, Guid userId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId && a.IsActive);

        return address == null ? null : MapAddressToResponseDto(address);
    }

    public async Task<AddressResponseDto> CreateAddressAsync(Guid userId, CreateAddressDto createAddressDto)
    {
        // If this is set as default, unset other default addresses
        if (createAddressDto.IsDefault)
        {
            await UnsetDefaultAddressesAsync(userId);
        }

        var address = new Address
        {
            UserId = userId,
            Title = createAddressDto.Title,
            FirstName = createAddressDto.FirstName,
            LastName = createAddressDto.LastName,
            AddressLine1 = createAddressDto.AddressLine1,
            AddressLine2 = createAddressDto.AddressLine2,
            City = createAddressDto.City,
            State = createAddressDto.State,
            PostalCode = createAddressDto.PostalCode,
            Country = createAddressDto.Country,
            PhoneNumber = createAddressDto.PhoneNumber,
            IsDefault = createAddressDto.IsDefault,
            IsActive = true
        };

        await _unitOfWork.Addresses.AddAsync(address);
        await _unitOfWork.SaveChangesAsync();

        return MapAddressToResponseDto(address);
    }

    public async Task<AddressResponseDto?> UpdateAddressAsync(Guid addressId, Guid userId, UpdateAddressDto updateAddressDto)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId && a.IsActive);

        if (address == null)
            return null;

        // If this is being set as default, unset other default addresses
        if (updateAddressDto.IsDefault && !address.IsDefault)
        {
            await UnsetDefaultAddressesAsync(userId);
        }

        address.Title = updateAddressDto.Title;
        address.FirstName = updateAddressDto.FirstName;
        address.LastName = updateAddressDto.LastName;
        address.AddressLine1 = updateAddressDto.AddressLine1;
        address.AddressLine2 = updateAddressDto.AddressLine2;
        address.City = updateAddressDto.City;
        address.State = updateAddressDto.State;
        address.PostalCode = updateAddressDto.PostalCode;
        address.Country = updateAddressDto.Country;
        address.PhoneNumber = updateAddressDto.PhoneNumber;
        address.IsDefault = updateAddressDto.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Addresses.UpdateAsync(address);
        await _unitOfWork.SaveChangesAsync();

        return MapAddressToResponseDto(address);
    }

    public async Task<bool> DeleteAddressAsync(Guid addressId, Guid userId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId && a.IsActive);

        if (address == null)
            return false;

        // Soft delete
        address.IsActive = false;
        address.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Addresses.UpdateAsync(address);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId && a.IsActive);

        if (address == null)
            return false;

        // Unset all other default addresses
        await UnsetDefaultAddressesAsync(userId);

        // Set this address as default
        address.IsDefault = true;
        address.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Addresses.UpdateAsync(address);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<AddressResponseDto?> GetDefaultAddressAsync(Guid userId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault && a.IsActive);

        return address == null ? null : MapAddressToResponseDto(address);
    }

    private async Task UnsetDefaultAddressesAsync(Guid userId)
    {
        var defaultAddresses = await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault && a.IsActive)
            .ToListAsync();

        foreach (var addr in defaultAddresses)
        {
            addr.IsDefault = false;
            addr.UpdatedAt = DateTime.UtcNow;
        }

        if (defaultAddresses.Any())
        {
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private static AddressResponseDto MapAddressToResponseDto(Address address)
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
}