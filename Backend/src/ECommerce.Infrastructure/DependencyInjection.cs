using ECommerce.Application.Interfaces;
using ECommerce.Domain.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories;
using ECommerce.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ECommerceDbContext>(options =>
        {
            options.UseSqlite(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ECommerceDbContext).Assembly.FullName));
            options.EnableSensitiveDataLogging(false);
            options.EnableServiceProviderCaching(false);
        });

        // Identity
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            // Password settings
            options.Password.RequiredLength = 6;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;

            // User settings
            options.User.RequireUniqueEmail = true;
            
            // SignIn settings
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedAccount = false;
        })
        .AddEntityFrameworkStores<ECommerceDbContext>()
        .AddDefaultTokenProviders();

        // Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<ISavedCardService, SavedCardService>();
        services.AddScoped<IStoreService, StoreService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPaymentService, FakePaymentService>();
        services.AddScoped<IPasswordResetService, PasswordResetService>();
        services.AddScoped<IWishlistService, WishlistService>();
        services.AddScoped<IRecentlyViewedService, RecentlyViewedService>();
        services.AddScoped<IProductVariantService, ProductVariantService>();
        
        // Email services - Use SMTP in production, Mock in development
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Development")
        {
            services.AddScoped<IEmailService, MockEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, SmtpEmailService>();
        }

        // Caching services
        var redisEnabled = configuration.GetSection("Redis:Enabled").Value == "true";
        if (redisEnabled)
        {
            // Redis cache
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
                options.InstanceName = configuration.GetSection("Redis:InstanceName").Value ?? "ECommerce";
            });
            services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(provider =>
            {
                var connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
                return StackExchange.Redis.ConnectionMultiplexer.Connect(connectionString);
            });
            services.AddScoped<ICacheService, RedisCacheService>();
        }
        else
        {
            // In-memory cache for development
            services.AddMemoryCache();
            services.AddScoped<ICacheService, InMemoryCacheService>();
        }

        // Replace ProductService with cached version
        services.AddScoped<ProductService>();
        services.AddScoped<IProductService, CachedProductService>();

        // Database seeder
        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}