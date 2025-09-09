using ECommerce.Application.DTOs.Auth;

namespace ECommerce.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null, string? userAgent = null);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? ipAddress = null, string? userAgent = null);
    Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken, string? ipAddress = null, string? userAgent = null);
    Task<bool> RevokeTokenAsync(string token);
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
    Task<bool> AssignRoleAsync(Guid userId, string role);
    Task<List<string>> GetUserRolesAsync(Guid userId);
}