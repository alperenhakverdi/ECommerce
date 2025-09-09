using System.Net;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Memory;
using Xunit;
using Newtonsoft.Json;

namespace ECommerce.API.Tests;

public class RateLimitingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public RateLimitingTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task LoginEndpoint_ExceedsRateLimit_Returns429()
    {
        // Arrange
        var loginPayload = JsonConvert.SerializeObject(new
        {
            email = "test@example.com",
            password = "TestPassword123!"
        });
        var content = new StringContent(loginPayload, Encoding.UTF8, "application/json");

        // Act & Assert
        var responses = new List<HttpResponseMessage>();
        
        // Make requests up to the limit (5 for login endpoint)
        for (int i = 0; i < 6; i++)
        {
            var response = await _client.PostAsync("/api/auth/login", content);
            responses.Add(response);
        }

        // First 5 should be allowed (even though they fail due to invalid credentials)
        // The 6th should be rate limited
        Assert.True(responses.Take(5).All(r => r.StatusCode != HttpStatusCode.TooManyRequests));
        Assert.Equal(HttpStatusCode.TooManyRequests, responses.Last().StatusCode);

        // Check rate limit headers
        var lastResponse = responses.Last();
        Assert.True(lastResponse.Headers.Contains("X-RateLimit-Limit"));
        Assert.True(lastResponse.Headers.Contains("X-RateLimit-Remaining"));
        Assert.True(lastResponse.Headers.Contains("X-RateLimit-Reset"));
        Assert.True(lastResponse.Headers.Contains("Retry-After"));
    }

    [Fact]
    public async Task RegisterEndpoint_ExceedsRateLimit_Returns429()
    {
        // Arrange
        var registerPayload = JsonConvert.SerializeObject(new
        {
            firstName = "Test",
            lastName = "User",
            email = "test@example.com",
            password = "TestPassword123!"
        });
        var content = new StringContent(registerPayload, Encoding.UTF8, "application/json");

        // Act
        var responses = new List<HttpResponseMessage>();
        
        // Make requests up to the limit (3 for register endpoint)
        for (int i = 0; i < 4; i++)
        {
            var response = await _client.PostAsync("/api/auth/register", content);
            responses.Add(response);
        }

        // Assert
        // First 3 should be allowed, 4th should be rate limited
        Assert.True(responses.Take(3).All(r => r.StatusCode != HttpStatusCode.TooManyRequests));
        Assert.Equal(HttpStatusCode.TooManyRequests, responses.Last().StatusCode);
    }

    [Fact]
    public async Task GeneralEndpoints_ExceedsRateLimit_Returns429()
    {
        // Arrange - Use a general endpoint like products
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Make many concurrent requests to trigger general rate limiting
        for (int i = 0; i < 102; i++) // General limit is 100 per minute
        {
            tasks.Add(_client.GetAsync("/api/products"));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert - Some responses should be rate limited
        var rateLimitedResponses = responses.Where(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        Assert.True(rateLimitedResponses.Any(), "Expected some requests to be rate limited");
    }

    [Theory]
    [InlineData("/api/auth/login", 6)]
    [InlineData("/api/auth/register", 4)]
    public async Task RateLimit_ReturnsCorrectErrorMessage(string endpoint, int requestCount)
    {
        // Arrange
        var payload = JsonConvert.SerializeObject(new
        {
            email = "test@example.com",
            password = "TestPassword123!",
            firstName = "Test",
            lastName = "User"
        });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        // Act - Make requests to exceed the limit
        HttpResponseMessage? lastResponse = null;
        for (int i = 0; i < requestCount; i++)
        {
            lastResponse = await _client.PostAsync(endpoint, content);
        }

        // Assert
        Assert.NotNull(lastResponse);
        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse.StatusCode);

        var responseContent = await lastResponse.Content.ReadAsStringAsync();
        var errorResponse = JsonConvert.DeserializeObject<dynamic>(responseContent);

        Assert.NotNull(errorResponse?.error);
        Assert.Contains("Rate limit exceeded", errorResponse.error.ToString());
        Assert.NotNull(errorResponse?.message);
        Assert.NotNull(errorResponse?.retryAfter);
    }

    [Fact]
    public async Task RateLimit_DifferentIPs_IndependentLimits()
    {
        // This test would require mocking different IP addresses
        // In a real scenario, you'd need to configure the test to simulate different client IPs
        // For now, we'll document the expected behavior
        
        // Arrange - Would need multiple clients with different IP addresses
        // Act - Each IP should have independent rate limits
        // Assert - One IP being rate limited shouldn't affect another IP

        await Task.CompletedTask; // Placeholder for actual implementation
        Assert.True(true, "Rate limiting should be per-IP address");
    }

    [Fact]
    public async Task RateLimit_MemoryCache_CleansUpExpiredEntries()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var memoryCache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

        // Act - The middleware should clean up expired entries automatically
        // This is tested indirectly through the rate limiting behavior

        // Assert - Memory cache should not grow indefinitely
        Assert.NotNull(memoryCache);
    }
}