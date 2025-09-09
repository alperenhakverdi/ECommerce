using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Constants;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IStoreService _storeService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IJwtTokenService jwtTokenService,
        IRefreshTokenService refreshTokenService,
        IStoreService storeService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _refreshTokenService = refreshTokenService;
        _storeService = storeService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            _logger.LogInformation("REGISTER DEBUG - WantsToBecomeStoreOwner: {WantsToBecomeStoreOwner}", request.WantsToBecomeStoreOwner);
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User already exists with this email",
                    Errors = new List<string> { "Email is already registered" }
                };
            }

            // Create new user
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                EmailConfirmed = true, // For now, skip email confirmation
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Registration failed",
                    Errors = result.Errors.Select(e => e.Description).ToList()
                };
            }

            // Assign default role based on store owner preference
            await AssignRoleAsync(user.Id, UserRoles.Customer);
            _logger.LogInformation("REGISTER DEBUG - Customer role assigned");
            
            if (request.WantsToBecomeStoreOwner)
            {
                await AssignRoleAsync(user.Id, UserRoles.StoreOwner);
                _logger.LogInformation("REGISTER DEBUG - StoreOwner role assigned");

                // Create store if store data is provided
                _logger.LogInformation("REGISTER DEBUG - StoreData is null: {IsNull}", request.StoreData == null);
                if (request.StoreData != null)
                {
                    _logger.LogInformation("REGISTER DEBUG - Starting store creation with data: {StoreName}", request.StoreData.StoreName);
                    try
                    {
                        var createStoreDto = new CreateStoreDto
                        {
                            Name = request.StoreData.StoreName,
                            Description = request.StoreData.StoreDescription,
                            ContactEmail = request.Email, // Use user's email as contact email
                            ContactPhone = request.StoreData.ContactPhone,
                            Website = request.StoreData.Website ?? string.Empty,
                            BusinessAddress = request.StoreData.BusinessAddress,
                            TaxNumber = request.StoreData.TaxNumber ?? string.Empty,
                            LogoUrl = string.Empty, // Will be set later by user
                            BannerUrl = string.Empty // Will be set later by user
                        };

                        var storeResponse = await _storeService.CreateAsync(user.Id, createStoreDto);
                        _logger.LogInformation("REGISTER DEBUG - Store created with ID: {StoreId}", storeResponse.Id);
                    }
                    catch (Exception storeEx)
                    {
                        _logger.LogError(storeEx, "REGISTER DEBUG - Store creation failed: {ErrorMessage}", storeEx.Message);
                        // Store creation failed, but user registration was successful
                        // We don't fail the entire registration process
                    }
                }
            }

            // Generate tokens
            var roles = await GetUserRolesAsync(user.Id);
            _logger.LogInformation("REGISTER DEBUG - Final user roles: {UserRoles}", string.Join(", ", roles));
            var token = await _jwtTokenService.GenerateTokenAsync(user, roles);
            var refreshTokenEntity = await _refreshTokenService.CreateAsync(user.Id, ipAddress ?? string.Empty, userAgent ?? string.Empty);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                Token = token,
                RefreshToken = refreshTokenEntity.Token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = roles,
                    CreatedAt = user.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during registration",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password",
                    Errors = new List<string> { "Invalid credentials" }
                };
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password",
                    Errors = new List<string> { "Invalid credentials" }
                };
            }

            // Generate tokens
            var roles = await GetUserRolesAsync(user.Id);
            var token = await _jwtTokenService.GenerateTokenAsync(user, roles);
            var refreshTokenEntity = await _refreshTokenService.CreateAsync(user.Id, ipAddress ?? string.Empty, userAgent ?? string.Empty);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                RefreshToken = refreshTokenEntity.Token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = roles,
                    CreatedAt = user.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during login",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            // Get refresh token from database
            var refreshTokenEntity = await _refreshTokenService.GetByTokenAsync(refreshToken);
            
            if (refreshTokenEntity == null || !refreshTokenEntity.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid refresh token",
                    Errors = new List<string> { "Refresh token is invalid or expired" }
                };
            }

            var user = refreshTokenEntity.User;
            if (user == null || !user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found",
                    Errors = new List<string> { "Invalid user" }
                };
            }

            // Validate the access token (even if expired)
            var principal = _jwtTokenService.GetPrincipalFromExpiredToken(token);
            if (principal?.Identity?.Name == null || principal.Identity.Name != user.UserName)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid token",
                    Errors = new List<string> { "Token validation failed" }
                };
            }

            // Revoke the old refresh token
            await _refreshTokenService.RevokeAsync(refreshToken);

            // Generate new tokens
            var roles = await GetUserRolesAsync(user.Id);
            var newToken = await _jwtTokenService.GenerateTokenAsync(user, roles);
            var newRefreshTokenEntity = await _refreshTokenService.CreateAsync(user.Id, ipAddress ?? string.Empty, userAgent ?? string.Empty);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Token refreshed successfully",
                Token = newToken,
                RefreshToken = newRefreshTokenEntity.Token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = roles,
                    CreatedAt = user.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Token refresh failed",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        return await _refreshTokenService.RevokeAsync(token);
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || !user.IsActive)
            return null;

        var roles = await GetUserRolesAsync(user.Id);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> AssignRoleAsync(Guid userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        // Create role if it doesn't exist
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        if (!await _userManager.IsInRoleAsync(user, role))
        {
            var result = await _userManager.AddToRoleAsync(user, role);
            return result.Succeeded;
        }

        return true;
    }

    public async Task<List<string>> GetUserRolesAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return new List<string>();

        return (await _userManager.GetRolesAsync(user)).ToList();
    }
}