using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IAddressService
{
    Task<IEnumerable<AddressResponseDto>> GetUserAddressesAsync(Guid userId);
    Task<AddressResponseDto?> GetAddressByIdAsync(Guid addressId, Guid userId);
    Task<AddressResponseDto> CreateAddressAsync(Guid userId, CreateAddressDto createAddressDto);
    Task<AddressResponseDto?> UpdateAddressAsync(Guid addressId, Guid userId, UpdateAddressDto updateAddressDto);
    Task<bool> DeleteAddressAsync(Guid addressId, Guid userId);
    Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId);
    Task<AddressResponseDto?> GetDefaultAddressAsync(Guid userId);
}