using ECommerce.Domain.Entities;
using System.Security.Claims;

namespace ECommerce.Application.Interfaces;

public interface IJwtTokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user, List<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    Task<bool> ValidateTokenAsync(string token);
}