using ECommerce.Domain.Constants;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Data;

public class DatabaseSeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ECommerceDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ECommerceDbContext context,
        ILogger<DatabaseSeeder> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("🌱 Starting database seeding...");

            // Ensure database is created
            await _context.Database.EnsureCreatedAsync();

            // Seed roles first
            await SeedRolesAsync();

            // Seed admin user
            await SeedAdminUserAsync();

            _logger.LogInformation("✅ Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error occurred during database seeding");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        _logger.LogInformation("🔑 Seeding roles...");

        var roles = new[] { UserRoles.Admin, UserRoles.Customer, UserRoles.StoreOwner };

        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var role = new IdentityRole<Guid>(roleName);
                var result = await _roleManager.CreateAsync(role);
                
                if (result.Succeeded)
                {
                    _logger.LogInformation("✅ Created role: {RoleName}", roleName);
                }
                else
                {
                    _logger.LogWarning("⚠️ Failed to create role {RoleName}: {Errors}", 
                        roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                _logger.LogInformation("ℹ️ Role already exists: {RoleName}", roleName);
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        _logger.LogInformation("👑 Seeding admin user...");

        const string adminEmail = "admin@ecommerce.com";
        const string adminPassword = "Admin123!";

        // Check if admin user already exists
        var existingAdmin = await _userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin != null)
        {
            _logger.LogInformation("ℹ️ Admin user already exists: {Email}", adminEmail);
            
            // Ensure admin has the Admin role
            if (!await _userManager.IsInRoleAsync(existingAdmin, UserRoles.Admin))
            {
                await _userManager.AddToRoleAsync(existingAdmin, UserRoles.Admin);
                _logger.LogInformation("✅ Added Admin role to existing user: {Email}", adminEmail);
            }
            
            return;
        }

        // Create admin user
        var adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "System",
            LastName = "Administrator",
            EmailConfirmed = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(adminUser, adminPassword);
        if (!createResult.Succeeded)
        {
            _logger.LogError("❌ Failed to create admin user: {Errors}", 
                string.Join(", ", createResult.Errors.Select(e => e.Description)));
            return;
        }

        // Assign Admin role
        var roleResult = await _userManager.AddToRoleAsync(adminUser, UserRoles.Admin);
        if (roleResult.Succeeded)
        {
            _logger.LogInformation("✅ Admin user created successfully:");
            _logger.LogInformation("   📧 Email: {Email}", adminEmail);
            _logger.LogInformation("   🔑 Password: {Password}", adminPassword);
            _logger.LogInformation("   🎯 Role: {Role}", UserRoles.Admin);
        }
        else
        {
            _logger.LogError("❌ Failed to assign Admin role: {Errors}", 
                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
        }
    }
}