using ECommerce.API.Middleware;
using ECommerce.API.Configuration;
using ECommerce.API.Services;
using ECommerce.Infrastructure;
using ECommerce.Infrastructure.Data;
using ECommerce.Application.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .Enrich.WithEnvironmentName()
    .Enrich.WithProperty("Application", "ECommerce.API")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/ecommerce-.txt", 
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {SourceContext}: {Message:lj} {Properties}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<CreateAddressValidator>();

builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "ECommerce API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

// Add Infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

// Add Rate Limiting services
builder.Services.ConfigureRateLimit(builder.Configuration);

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]!)),
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add Metrics Service
builder.Services.AddSingleton<ECommerce.API.Services.IMetricsService, ECommerce.API.Services.MetricsService>();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ECommerce.Infrastructure.Data.ECommerceDbContext>("database")
    .AddCheck<ECommerce.API.HealthChecks.MemoryHealthCheck>("memory")
    .AddCheck<ECommerce.API.HealthChecks.DiskSpaceHealthCheck>("disk-space")
    .AddCheck<ECommerce.API.HealthChecks.CpuHealthCheck>("cpu")
    .AddCheck<ECommerce.API.HealthChecks.LogFileHealthCheck>("logging");

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
    
    options.AddPolicy("Development", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

Log.Information("Building application...");
var app = builder.Build();
Log.Information("Application built successfully");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add custom middleware
app.UseMiddleware<SimpleCorsMiddleware>(); // Simple CORS fix
app.UseMiddleware<RequestLoggingMiddleware>(); // Log all requests/responses
app.UseMiddleware<ExceptionMiddleware>();

// Add rate limiting middleware (before authentication)
// Temporarily disabled for testing
// app.UseRateLimit();
// app.UseMiddleware<AuthRateLimitingMiddleware>();

app.UseHttpsRedirection();

// Use appropriate CORS policy based on environment
if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else
{
    app.UseCors("AllowAll");
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Add admin authorization middleware (after authentication & authorization)
app.UseMiddleware<AdminAuthorizationMiddleware>();

app.MapControllers();

// Add Health Check endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = healthCheck => healthCheck.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // Only return basic liveness
});

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        Log.Information("🌱 Initializing database seeding...");
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "💥 Database seeding failed");
        throw;
    }
}

try
{
    Log.Information("Starting ECommerce API");
    Log.Information("Host configured successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "ECommerce API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
