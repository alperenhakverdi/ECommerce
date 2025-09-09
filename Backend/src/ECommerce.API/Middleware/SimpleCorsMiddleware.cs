namespace ECommerce.API.Middleware;

public class SimpleCorsMiddleware
{
    private readonly RequestDelegate _next;

    public SimpleCorsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add CORS headers to all responses
        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        context.Response.Headers.Add("Access-Control-Max-Age", "86400");

        // Handle preflight requests
        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = 200;
            return;
        }

        await _next(context);
    }
}