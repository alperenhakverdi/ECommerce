using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IRefreshTokenService
{
    Task<RefreshToken> CreateAsync(Guid userId, string ipAddress, string userAgent);
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<bool> RevokeAsync(string token);
    Task<bool> RevokeAllUserTokensAsync(Guid userId);
    Task CleanupExpiredTokensAsync();
}