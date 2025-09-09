using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Infrastructure.Data;

public class ECommerceDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ECommerceDbContext(DbContextOptions<ECommerceDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<SavedCard> SavedCards => Set<SavedCard>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<RecentlyViewed> RecentlyViewed => Set<RecentlyViewed>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<ProductVariantAttribute> ProductVariantAttributes => Set<ProductVariantAttribute>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Product Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Weight).HasColumnType("decimal(8,2)");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Tags).HasMaxLength(1000);
            
            entity.HasOne(e => e.Category)
                  .WithMany(e => e.Products)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.Products)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Performance indexes for search and filtering
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.StoreId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Price);
            entity.HasIndex(e => e.Stock);
            entity.HasIndex(e => new { e.IsActive, e.CategoryId });
            entity.HasIndex(e => new { e.IsActive, e.StoreId });
            entity.HasIndex(e => new { e.IsActive, e.Price });
            entity.HasIndex(e => new { e.IsActive, e.Stock });
        });

        // Category Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Store Configuration
        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            entity.Property(e => e.BannerUrl).HasMaxLength(500);
            entity.Property(e => e.ContactEmail).HasMaxLength(200);
            entity.Property(e => e.ContactPhone).HasMaxLength(20);
            entity.Property(e => e.Website).HasMaxLength(200);
            entity.Property(e => e.BusinessAddress).HasMaxLength(500);
            entity.Property(e => e.TaxNumber).HasMaxLength(50);
            entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");
            
            entity.HasOne(e => e.Owner)
                  .WithMany(e => e.Stores)
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            // Performance indexes for stores
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.OwnerId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsApproved);
            entity.HasIndex(e => new { e.IsActive, e.IsApproved });
            entity.HasIndex(e => e.ContactEmail);
        });

        // Cart Configuration
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Carts)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.UserId);
        });

        // CartItem Configuration
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Cart)
                  .WithMany(e => e.Items)
                  .HasForeignKey(e => e.CartId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany(e => e.CartItems)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductVariant)
                  .WithMany(e => e.CartItems)
                  .HasForeignKey(e => e.ProductVariantId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            // Performance indexes
            entity.HasIndex(e => e.CartId);
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => new { e.CartId, e.ProductId }).IsUnique();
        });

        // Order Configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CustomerEmail).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Orders)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ShippingAddress)
                  .WithMany(e => e.Orders)
                  .HasForeignKey(e => e.AddressId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Store)
                  .WithMany(e => e.Orders)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            // Performance indexes for orders
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.StoreId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CustomerEmail);
            entity.HasIndex(e => new { e.UserId, e.Status });
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.StoreId, e.Status });
        });

        // Address Configuration
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AddressLine1).IsRequired().HasMaxLength(200);
            entity.Property(e => e.AddressLine2).HasMaxLength(200);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.State).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PostalCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Country).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Addresses)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            // Performance indexes for addresses
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.IsDefault });
            entity.HasIndex(e => e.City);
            entity.HasIndex(e => e.PostalCode);
        });

        // OrderItem Configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.VariantInfo).HasMaxLength(1000); // JSON snapshot
            
            entity.HasOne(e => e.Order)
                  .WithMany(e => e.Items)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany(e => e.OrderItems)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductVariant)
                  .WithMany(e => e.OrderItems)
                  .HasForeignKey(e => e.ProductVariantId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            // Performance indexes
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.ProductId);
        });

        // RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ReplacedByToken)
                  .WithMany()
                  .HasForeignKey(e => e.ReplacedByTokenId)
                  .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ExpiryDate);
            entity.HasIndex(e => e.IsRevoked);
            entity.HasIndex(e => new { e.UserId, e.IsRevoked });
            entity.HasIndex(e => new { e.ExpiryDate, e.IsRevoked });
        });

        // PasswordResetToken Configuration
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.PasswordResetTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.ExpiryDate);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsUsed);
            entity.HasIndex(e => new { e.Email, e.IsUsed });
            entity.HasIndex(e => new { e.ExpiryDate, e.IsUsed });
        });

        // Seed Data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Categories
        var electronicsCategory = new Category 
        { 
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Electronics", 
            Description = "Electronic devices and accessories",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsActive = true
        };

        var clothingCategory = new Category 
        { 
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Clothing", 
            Description = "Fashion and clothing items",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsActive = true
        };

        modelBuilder.Entity<Category>().HasData(electronicsCategory, clothingCategory);

        // Default Store - We'll add this via data seeding script since we need a valid User first

        // Products
        var products = new[]
        {
            new Product
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Smartphone",
                Description = "Latest model smartphone with advanced features",
                Price = 699.99m,
                Stock = 50,
                ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
                CategoryId = electronicsCategory.Id,
                StoreId = Guid.Parse("77777777-7777-7777-7777-777777777777"), // Default store ID
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            },
            new Product
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Name = "Laptop",
                Description = "High-performance laptop for work and gaming",
                Price = 1299.99m,
                Stock = 25,
                ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
                CategoryId = electronicsCategory.Id,
                StoreId = Guid.Parse("77777777-7777-7777-7777-777777777777"), // Default store ID
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            },
            new Product
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Name = "T-Shirt",
                Description = "Comfortable cotton t-shirt",
                Price = 29.99m,
                Stock = 100,
                ImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
                CategoryId = clothingCategory.Id,
                StoreId = Guid.Parse("77777777-7777-7777-7777-777777777777"), // Default store ID
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            },
            new Product
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Name = "Jeans",
                Description = "Classic blue denim jeans",
                Price = 79.99m,
                Stock = 75,
                ImageUrl = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
                CategoryId = clothingCategory.Id,
                StoreId = Guid.Parse("77777777-7777-7777-7777-777777777777"), // Default store ID
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            }
        };

        modelBuilder.Entity<Product>().HasData(products);

        // SavedCard Configuration
        modelBuilder.Entity<SavedCard>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CardHolderName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CardNumberMasked).IsRequired().HasMaxLength(19);
            entity.Property(e => e.CardNumberHash).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CardType).HasMaxLength(50);
            
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.IsDefault });
        });

        // Wishlist Configuration
        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Wishlists)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.UserId).IsUnique(); // One wishlist per user
        });

        // WishlistItem Configuration
        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Wishlist)
                  .WithMany(e => e.Items)
                  .HasForeignKey(e => e.WishlistId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany(e => e.WishlistItems)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.WishlistId);
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => new { e.WishlistId, e.ProductId }).IsUnique(); // Prevent duplicate items
        });

        // ProductVariant Configuration
        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SKU).IsRequired().HasMaxLength(100);
            entity.Property(e => e.VariantName).HasMaxLength(300);
            entity.Property(e => e.PriceAdjustment).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Weight).HasColumnType("decimal(8,2)");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            
            entity.HasOne(e => e.Product)
                  .WithMany(e => e.ProductVariants)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.SKU).IsUnique();
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Stock);
        });

        // ProductAttribute Configuration
        modelBuilder.Entity<ProductAttribute>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired();
            
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.SortOrder);
        });

        // ProductAttributeValue Configuration
        modelBuilder.Entity<ProductAttributeValue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Value).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ColorCode).HasMaxLength(7); // #FFFFFF
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            
            entity.HasOne(e => e.ProductAttribute)
                  .WithMany(e => e.Values)
                  .HasForeignKey(e => e.ProductAttributeId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.ProductAttributeId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.SortOrder);
        });

        // ProductVariantAttribute Configuration
        modelBuilder.Entity<ProductVariantAttribute>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.ProductVariant)
                  .WithMany(e => e.ProductVariantAttributes)
                  .HasForeignKey(e => e.ProductVariantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ProductAttribute)
                  .WithMany(e => e.ProductVariantAttributes)
                  .HasForeignKey(e => e.ProductAttributeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductAttributeValue)
                  .WithMany(e => e.ProductVariantAttributes)
                  .HasForeignKey(e => e.ProductAttributeValueId)
                  .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(e => e.ProductVariantId);
            entity.HasIndex(e => e.ProductAttributeId);
            entity.HasIndex(e => e.ProductAttributeValueId);
            entity.HasIndex(e => new { e.ProductVariantId, e.ProductAttributeId }).IsUnique(); // Bir varyant aynı özelliği iki kez içeremez
        });

        // RecentlyViewed Configuration
        modelBuilder.Entity<RecentlyViewed>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.RecentlyViewed)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany(e => e.RecentlyViewed)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => new { e.UserId, e.ViewedAt });
            entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique(); // Prevent duplicate entries
        });
    }
}