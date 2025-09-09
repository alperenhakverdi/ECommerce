using System.Net;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;
using System.Text;

namespace ECommerce.API.Middleware;

/// <summary>
/// Custom middleware for enhanced rate limiting on authentication endpoints
/// Provides stronger protection against brute force attacks
/// </summary>
public class AuthRateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AuthRateLimitingMiddleware> _logger;
    private readonly IConfiguration _configuration;

    // Rate limiting windows and thresholds
    private static readonly Dictionary<string, (TimeSpan Window, int Limit)> EndpointLimits = new()
    {
        { "/api/auth/login", (TimeSpan.FromMinutes(15), 5) },      // 5 attempts per 15 minutes
        { "/api/auth/register", (TimeSpan.FromHours(1), 3) },      // 3 registrations per hour
        { "/api/auth/refresh-token", (TimeSpan.FromMinutes(5), 10) }, // 10 refresh attempts per 5 minutes
        { "/api/auth/forgot-password", (TimeSpan.FromHours(1), 3) },  // 3 password resets per hour
        { "/api/auth/reset-password", (TimeSpan.FromMinutes(30), 5) }  // 5 reset attempts per 30 minutes
    };

    public AuthRateLimitingMiddleware(
        RequestDelegate next,
        IMemoryCache cache,
        ILogger<AuthRateLimitingMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower();
        var method = context.Request.Method;

        // Only apply rate limiting to authentication endpoints
        if (method == "POST" && path != null && EndpointLimits.ContainsKey(path))
        {
            var clientIdentifier = GetClientIdentifier(context);
            var endpoint = path;

            if (await IsRateLimited(clientIdentifier, endpoint, context))
            {
                await HandleRateLimitExceeded(context, endpoint);
                return;
            }

            // Record the attempt
            await RecordAttempt(clientIdentifier, endpoint);
        }

        await _next(context);
    }

    /// <summary>
    /// Get a unique identifier for the client (IP + User Agent hash)
    /// </summary>
    private string GetClientIdentifier(HttpContext context)
    {
        var ip = GetClientIP(context);
        var userAgent = context.Request.Headers.UserAgent.FirstOrDefault() ?? "unknown";
        
        // Create a hash of IP + UserAgent to prevent enumeration while maintaining uniqueness
        using var sha256 = SHA256.Create();
        var combinedBytes = Encoding.UTF8.GetBytes($"{ip}:{userAgent}");
        var hashBytes = sha256.ComputeHash(combinedBytes);
        var hash = Convert.ToBase64String(hashBytes)[..16]; // Use first 16 characters
        
        return $"auth_{ip}_{hash}";
    }

    /// <summary>
    /// Get the real client IP address, accounting for proxies and load balancers
    /// </summary>
    private string GetClientIP(HttpContext context)
    {
        // Check for forwarded headers (reverse proxy, load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // Take the first IP if there are multiple
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fallback to connection remote IP
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    /// <summary>
    /// Check if the client has exceeded rate limits for the endpoint
    /// </summary>
    private async Task<bool> IsRateLimited(string clientIdentifier, string endpoint, HttpContext context)
    {
        var (window, limit) = EndpointLimits[endpoint];
        var cacheKey = $"rate_limit:{clientIdentifier}:{endpoint}";
        var windowStart = DateTime.UtcNow.Subtract(window);

        // Get current attempts from cache
        if (_cache.TryGetValue(cacheKey, out List<DateTime>? attempts))
        {
            // Remove attempts outside the current window
            attempts = attempts!.Where(a => a > windowStart).ToList();

            // Check if limit exceeded
            if (attempts.Count >= limit)
            {
                _logger.LogWarning(
                    "Rate limit exceeded for endpoint {Endpoint} by client {ClientId}. " +
                    "Attempts: {AttemptCount}/{Limit} within {Window}",
                    endpoint, 
                    clientIdentifier[..20], // Log partial identifier for privacy
                    attempts.Count, 
                    limit, 
                    window);

                // Check for potential brute force attack
                await DetectBruteForceAttack(clientIdentifier, endpoint, attempts.Count);

                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Record a new attempt for rate limiting
    /// </summary>
    private async Task RecordAttempt(string clientIdentifier, string endpoint)
    {
        var (window, _) = EndpointLimits[endpoint];
        var cacheKey = $"rate_limit:{clientIdentifier}:{endpoint}";
        var now = DateTime.UtcNow;
        var windowStart = now.Subtract(window);

        // Get or create attempts list
        if (!_cache.TryGetValue(cacheKey, out List<DateTime>? attempts))
        {
            attempts = new List<DateTime>();
        }

        // Add current attempt and clean old ones
        attempts!.Add(now);
        attempts = attempts.Where(a => a > windowStart).ToList();

        // Store updated attempts list with expiry
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = window.Add(TimeSpan.FromMinutes(5)) // Keep slightly longer than window
        };

        _cache.Set(cacheKey, attempts, cacheOptions);

        await Task.CompletedTask; // For async consistency
    }

    /// <summary>
    /// Detect and log potential brute force attacks
    /// </summary>
    private async Task DetectBruteForceAttack(string clientIdentifier, string endpoint, int attemptCount)
    {
        var (_, limit) = EndpointLimits[endpoint];
        
        // If attempts are significantly above limit, log as potential attack
        if (attemptCount >= limit * 2)
        {
            _logger.LogError(
                "SECURITY ALERT: Potential brute force attack detected! " +
                "Client {ClientId} exceeded rate limit by {ExcessAttempts}x on endpoint {Endpoint}. " +
                "Consider IP blocking.",
                clientIdentifier[..20],
                attemptCount / limit,
                endpoint);

            // In production, consider:
            // - Sending alerts to security team
            // - Temporarily blocking the IP
            // - Triggering additional security measures
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// Handle rate limit exceeded response
    /// </summary>
    private async Task HandleRateLimitExceeded(HttpContext context, string endpoint)
    {
        var (window, limit) = EndpointLimits[endpoint];
        
        context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
        context.Response.ContentType = "application/json";

        // Add rate limit headers
        context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = "0";
        context.Response.Headers["X-RateLimit-Reset"] = DateTimeOffset.UtcNow.Add(window).ToUnixTimeSeconds().ToString();
        context.Response.Headers["Retry-After"] = ((int)window.TotalSeconds).ToString();

        var response = new
        {
            error = "Rate limit exceeded",
            message = $"Too many requests to {endpoint}. Maximum {limit} attempts allowed per {FormatTimeSpan(window)}.",
            retryAfter = (int)window.TotalSeconds,
            details = new
            {
                endpoint = endpoint,
                limit = limit,
                window = FormatTimeSpan(window),
                resetTime = DateTimeOffset.UtcNow.Add(window).ToString("O")
            }
        };

        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        }));
    }

    /// <summary>
    /// Format timespan for user-friendly display
    /// </summary>
    private static string FormatTimeSpan(TimeSpan timeSpan)
    {
        if (timeSpan.TotalDays >= 1)
            return $"{(int)timeSpan.TotalDays} day(s)";
        if (timeSpan.TotalHours >= 1)
            return $"{(int)timeSpan.TotalHours} hour(s)";
        if (timeSpan.TotalMinutes >= 1)
            return $"{(int)timeSpan.TotalMinutes} minute(s)";
        return $"{(int)timeSpan.TotalSeconds} second(s)";
    }
}