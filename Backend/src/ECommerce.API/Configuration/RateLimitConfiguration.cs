using AspNetCoreRateLimit;

namespace ECommerce.API.Configuration;

/// <summary>
/// Configuration for rate limiting to prevent abuse and brute force attacks
/// </summary>
public static class RateLimitConfiguration
{
    public static void ConfigureRateLimit(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure IP rate limiting
        services.Configure<IpRateLimitOptions>(configuration.GetSection("IpRateLimiting"));
        services.Configure<IpRateLimitPolicies>(configuration.GetSection("IpRateLimitPolicies"));

        // Configure client rate limiting
        services.Configure<ClientRateLimitOptions>(configuration.GetSection("ClientRateLimiting"));
        services.Configure<ClientRateLimitPolicies>(configuration.GetSection("ClientRateLimitPolicies"));

        // Add framework services
        
        // Use Memory Cache for rate limit storage (consider Redis for production)
        services.AddMemoryCache();

        // Register rate limit services
        services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
        services.AddSingleton<IClientPolicyStore, MemoryCacheClientPolicyStore>();
        services.AddSingleton<IRateLimitConfiguration, CustomRateLimitConfiguration>();

        // Register processing strategy
        services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

        // Register the rate limiting services
        services.AddHttpContextAccessor();
    }

    public static void UseRateLimit(this IApplicationBuilder app)
    {
        app.UseIpRateLimiting();
    }
}

/// <summary>
/// Custom rate limit configuration implementation
/// </summary>
public class CustomRateLimitConfiguration : IRateLimitConfiguration
{
    public IList<IClientResolveContributor> ClientResolvers => new List<IClientResolveContributor>();
    public IList<IIpResolveContributor> IpResolvers => new List<IIpResolveContributor>();
    public ICounterKeyBuilder? EndpointCounterKeyBuilder => null;
    public Func<double> RateIncrementer => () => 1;

    public void RegisterResolvers()
    {
        // Register custom resolvers if needed
    }
}