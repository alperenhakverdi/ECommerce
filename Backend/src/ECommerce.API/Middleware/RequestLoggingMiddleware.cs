using Serilog;
using System.Diagnostics;
using System.Text;
using ECommerce.API.Services;

namespace ECommerce.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;
    private readonly IMetricsService _metricsService;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, IMetricsService metricsService)
    {
        _next = next;
        _logger = logger;
        _metricsService = metricsService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = Guid.NewGuid().ToString();
        
        // Add correlation ID to response headers and log context
        context.Response.Headers["X-Correlation-ID"] = correlationId;
        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await LogRequest(context, correlationId);
            
            // Capture response body
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Request {Method} {Path} failed with correlation ID {CorrelationId}",
                    context.Request.Method, context.Request.Path, correlationId);
                throw;
            }
            finally
            {
                stopwatch.Stop();
                await LogResponse(context, correlationId, stopwatch.ElapsedMilliseconds, responseBody);
                
                // Record metrics
                _metricsService.RecordApiCall(context.Request.Path, context.Request.Method, 
                    context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
                
                // Copy response back to original stream
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }
    }

    private async Task LogRequest(HttpContext context, string correlationId)
    {
        var request = context.Request;
        var requestBody = string.Empty;

        // Only log request body for specific endpoints and content types
        if (ShouldLogRequestBody(request))
        {
            request.EnableBuffering();
            var buffer = new byte[Convert.ToInt32(request.ContentLength ?? 0)];
            await request.Body.ReadAsync(buffer, 0, buffer.Length);
            requestBody = Encoding.UTF8.GetString(buffer);
            request.Body.Position = 0;

            // Mask sensitive data
            requestBody = MaskSensitiveData(requestBody, request.Path);
        }

        Log.Information("Incoming {Method} {Path} from {RemoteIpAddress} - Correlation: {CorrelationId} {RequestBody}",
            request.Method,
            request.Path,
            GetClientIpAddress(context),
            correlationId,
            !string.IsNullOrEmpty(requestBody) ? $"Body: {requestBody}" : "");
    }

    private async Task LogResponse(HttpContext context, string correlationId, long elapsedMs, MemoryStream responseBody)
    {
        var response = context.Response;
        var responseBodyText = string.Empty;

        if (ShouldLogResponseBody(context.Request, response))
        {
            responseBody.Seek(0, SeekOrigin.Begin);
            responseBodyText = await new StreamReader(responseBody).ReadToEndAsync();
            responseBodyText = MaskSensitiveData(responseBodyText, context.Request.Path);
        }

        if (response.StatusCode >= 400)
        {
            Log.Warning("Response {Method} {Path} {StatusCode} in {ElapsedMs}ms - Correlation: {CorrelationId} {ResponseBody}",
                context.Request.Method,
                context.Request.Path,
                response.StatusCode,
                elapsedMs,
                correlationId,
                !string.IsNullOrEmpty(responseBodyText) ? $"Body: {responseBodyText}" : "");
        }
        else
        {
            Log.Information("Response {Method} {Path} {StatusCode} in {ElapsedMs}ms - Correlation: {CorrelationId}",
                context.Request.Method,
                context.Request.Path,
                response.StatusCode,
                elapsedMs,
                correlationId);
        }
    }

    private static bool ShouldLogRequestBody(HttpRequest request)
    {
        // Log bodies for API endpoints but exclude sensitive ones
        if (request.Path.StartsWithSegments("/api"))
        {
            var contentType = request.ContentType?.ToLower();
            return contentType != null && 
                   (contentType.Contains("application/json") || contentType.Contains("application/xml")) &&
                   request.ContentLength < 10240; // 10KB limit
        }
        return false;
    }

    private static bool ShouldLogResponseBody(HttpRequest request, HttpResponse response)
    {
        // Log error responses and specific endpoints
        return (response.StatusCode >= 400 && response.StatusCode < 500) ||
               (request.Path.StartsWithSegments("/api") && response.ContentLength < 5120); // 5KB limit
    }

    private static string MaskSensitiveData(string content, PathString path)
    {
        if (string.IsNullOrEmpty(content)) return content;

        // Mask password fields
        content = System.Text.RegularExpressions.Regex.Replace(content, 
            @"(""password""\s*:\s*"")[^""]*("")", 
            "$1***MASKED***$2", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Mask token fields
        content = System.Text.RegularExpressions.Regex.Replace(content, 
            @"(""token""\s*:\s*"")[^""]*("")", 
            "$1***MASKED***$2", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Mask JWT tokens in Authorization headers
        content = System.Text.RegularExpressions.Regex.Replace(content, 
            @"(Bearer\s+)[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+", 
            "$1***MASKED-JWT***");

        return content;
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded IP first (for proxy/load balancer scenarios)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').FirstOrDefault()?.Trim() ?? "Unknown";
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}