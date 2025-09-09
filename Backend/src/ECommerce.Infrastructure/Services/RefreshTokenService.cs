using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace ECommerce.Infrastructure.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly int _refreshTokenValidityInDays;

    public RefreshTokenService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _refreshTokenValidityInDays = int.Parse(configuration["JWT:RefreshTokenValidityInDays"] ?? "7");
    }

    public async Task<RefreshToken> CreateAsync(Guid userId, string ipAddress, string userAgent)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = GenerateToken(),
            ExpiryDate = DateTime.UtcNow.AddDays(_refreshTokenValidityInDays),
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshToken);
        await _unitOfWork.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _unitOfWork.Repository<RefreshToken>()
            .GetQueryable()
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task<bool> RevokeAsync(string token)
    {
        var refreshToken = await GetByTokenAsync(token);
        
        if (refreshToken == null || !refreshToken.IsActive)
            return false;

        refreshToken.IsRevoked = true;
        refreshToken.UsedAt = DateTime.UtcNow;
        
        await _unitOfWork.Repository<RefreshToken>().UpdateAsync(refreshToken);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RevokeAllUserTokensAsync(Guid userId)
    {
        var tokens = await _unitOfWork.Repository<RefreshToken>()
            .GetQueryable()
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
            token.UsedAt = DateTime.UtcNow;
        }

        if (tokens.Any())
        {
            await _unitOfWork.SaveChangesAsync();
        }

        return tokens.Any();
    }

    public async Task CleanupExpiredTokensAsync()
    {
        var expiredTokens = await _unitOfWork.Repository<RefreshToken>()
            .GetQueryable()
            .Where(rt => rt.ExpiryDate <= DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in expiredTokens)
        {
            await _unitOfWork.Repository<RefreshToken>().DeleteAsync(token.Id);
        }

        if (expiredTokens.Any())
        {
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private static string GenerateToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}