# Base image for .NET 8 runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build image with .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/ECommerce.API/ECommerce.API.csproj", "src/ECommerce.API/"]
COPY ["src/ECommerce.Application/ECommerce.Application.csproj", "src/ECommerce.Application/"]
COPY ["src/ECommerce.Domain/ECommerce.Domain.csproj", "src/ECommerce.Domain/"]
COPY ["src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj", "src/ECommerce.Infrastructure/"]
COPY ["ECommerce.sln", "."]

RUN dotnet restore "ECommerce.sln"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/src/ECommerce.API"
RUN dotnet build "ECommerce.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "ECommerce.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM base AS final
WORKDIR /app

# Create non-root user for security
RUN groupadd -r ecommerce && useradd --no-log-init -r -g ecommerce ecommerce
RUN chown -R ecommerce:ecommerce /app

COPY --from=publish /app/publish .

# Switch to non-root user
USER ecommerce

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "ECommerce.API.dll"]