using System.Security.Claims;
using ECommerce.Domain.Constants;

namespace ECommerce.API.Middleware;

public class AdminAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdminAuthorizationMiddleware> _logger;

    public AdminAuthorizationMiddleware(RequestDelegate next, ILogger<AdminAuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if the current request is for an admin endpoint
        var path = context.Request.Path.Value?.ToLowerInvariant();
        var method = context.Request.Method.ToUpperInvariant();
        
        if (IsAdminEndpoint(path, method))
        {
            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated == true)
            {
                _logger.LogWarning("Unauthorized access attempt to admin endpoint: {Method} {Path} from IP: {IP}", 
                    method, path, context.Connection.RemoteIpAddress);
                
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            // Check if user has admin role
            if (!context.User.IsInRole(UserRoles.Admin))
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userEmail = context.User.FindFirst(ClaimTypes.Email)?.Value;
                
                _logger.LogWarning("Access denied to admin endpoint: {Method} {Path} for user {UserId} ({Email}) from IP: {IP}", 
                    method, path, userId, userEmail, context.Connection.RemoteIpAddress);
                
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Access denied. Admin role required.");
                return;
            }

            // Log successful admin access
            var adminUserId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminEmail = context.User.FindFirst(ClaimTypes.Email)?.Value;
            
            _logger.LogInformation("Admin access granted to {Method} {Path} for user {UserId} ({Email}) from IP: {IP}", 
                method, path, adminUserId, adminEmail, context.Connection.RemoteIpAddress);
        }

        await _next(context);
    }

    private static bool IsAdminEndpoint(string? path, string method)
    {
        if (string.IsNullOrEmpty(path)) return false;

        // Always admin endpoints regardless of method
        var alwaysAdminPaths = new[]
        {
            "/api/admin",
            "/api/auth/assign-role" // Role assignment endpoint
        };

        // Check for always admin paths
        if (alwaysAdminPaths.Any(adminPath => 
            path.Equals(adminPath, StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith(adminPath, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        // Paths that are admin-only for write operations (POST, PUT, DELETE)
        var adminWritePaths = new[]
        {
            "/api/categories"
            // Note: /api/products removed - authorization handled by controller attributes
        };

        // Check if it's a write operation to products or categories
        if (method != "GET" && adminWritePaths.Any(adminPath => 
            path.Equals(adminPath, StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith(adminPath, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        // Order status updates are admin-only (PUT /api/orders/{id}/status)
        if (method == "PUT" && path.Contains("/api/orders/") && path.EndsWith("/status"))
        {
            return true;
        }

        return false;
    }
}