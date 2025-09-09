using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreProductsAndCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new categories
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Books, magazines and educational materials", true, "Books", null },
                    { new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sports equipment and fitness gear", true, "Sports", null },
                    { new Guid("55555555-5555-5555-5555-555555555555"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Beauty products and cosmetics", true, "Beauty", null },
                    { new Guid("66666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Home decor and furniture", true, "Home", null },
                    { new Guid("77777777-7777-7777-7777-777777777777"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Toys and games for children", true, "Toys", null },
                    { new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Automotive parts and accessories", true, "Automotive", null }
                });

            // Add new products
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsActive", "Name", "Price", "Stock", "UpdatedAt" },
                values: new object[,]
                {
                    // Electronics category - more products
                    { new Guid("77777777-7777-7777-7777-777777777777"), new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "High-quality wireless headphones with noise cancellation", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", true, "Wireless Headphones", 249.99m, 40, null },
                    { new Guid("88888888-8888-8888-8888-888888888888"), new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Ultra-thin 4K Smart TV with HDR support", "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop", true, "Smart TV 55\"", 899.99m, 15, null },
                    { new Guid("99999999-9999-9999-9999-999999999999"), new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Gaming console with latest graphics technology", "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop", true, "Gaming Console", 499.99m, 30, null },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Professional DSLR camera with multiple lenses", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop", true, "DSLR Camera", 1199.99m, 10, null },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Fast wireless charger for smartphones", "https://images.unsplash.com/photo-1609592424548-b5c68b5d3cdb?w=300&h=300&fit=crop", true, "Wireless Charger", 39.99m, 80, null },

                    // Clothing category - more products  
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Elegant summer dress for casual occasions", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop", true, "Summer Dress", 89.99m, 60, null },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Warm winter jacket with hood", "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop", true, "Winter Jacket", 159.99m, 35, null },
                    { new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Comfortable running shoes for athletes", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop", true, "Running Shoes", 129.99m, 45, null },
                    { new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff"), new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Stylish leather handbag for women", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", true, "Leather Handbag", 199.99m, 25, null },

                    // Books category
                    { new Guid("10101010-1010-1010-1010-101010101010"), new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Learn programming with practical examples", "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=300&fit=crop", true, "JavaScript Guide", 45.99m, 100, null },
                    { new Guid("20202020-2020-2020-2020-202020202020"), new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Bestselling mystery novel", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop", true, "Mystery Novel", 24.99m, 75, null },
                    { new Guid("30303030-3030-3030-3030-303030303030"), new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Complete cookbook with healthy recipes", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", true, "Healthy Cookbook", 34.99m, 50, null },

                    // Sports category
                    { new Guid("40404040-4040-4040-4040-404040404040"), new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Professional yoga mat for meditation", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop", true, "Yoga Mat", 29.99m, 90, null },
                    { new Guid("50505050-5050-5050-5050-505050505050"), new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Set of adjustable dumbbells for home gym", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop", true, "Dumbbell Set", 149.99m, 20, null },
                    { new Guid("60606060-6060-6060-6060-606060606060"), new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Professional basketball for outdoor courts", "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop", true, "Basketball", 39.99m, 60, null },

                    // Beauty category
                    { new Guid("70707070-7070-7070-7070-707070707070"), new Guid("55555555-5555-5555-5555-555555555555"), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Premium skincare set for all skin types", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop", true, "Skincare Set", 79.99m, 40, null },
                    { new Guid("80808080-8080-8080-8080-808080808080"), new Guid("55555555-5555-5555-5555-555555555555"), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Long-lasting matte lipstick collection", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop", true, "Lipstick Collection", 49.99m, 65, null },
                    { new Guid("90909090-9090-9090-9090-909090909090"), new Guid("55555555-5555-5555-5555-555555555555"), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Professional hair dryer with ionic technology", "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=300&h=300&fit=crop", true, "Hair Dryer", 89.99m, 30, null },

                    // Home category
                    { new Guid("a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0"), new Guid("66666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Elegant table lamp for modern homes", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", true, "Table Lamp", 69.99m, 55, null },
                    { new Guid("b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0"), new Guid("66666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Comfortable throw pillows set", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop", true, "Throw Pillows", 34.99m, 70, null },
                    { new Guid("c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0"), new Guid("66666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Decorative wall art canvas prints", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop", true, "Wall Art Set", 129.99m, 25, null },

                    // Toys category
                    { new Guid("d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0"), new Guid("77777777-7777-7777-7777-777777777777"), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Educational LEGO building blocks set", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", true, "LEGO Set", 79.99m, 45, null },
                    { new Guid("e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0"), new Guid("77777777-7777-7777-7777-777777777777"), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Interactive educational tablet for kids", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop", true, "Kids Tablet", 149.99m, 35, null },
                    { new Guid("f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0"), new Guid("77777777-7777-7777-7777-777777777777"), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Remote control racing car", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", true, "RC Car", 59.99m, 50, null },

                    // Automotive category
                    { new Guid("11a1a1a1-1a1a-1a1a-1a1a-1a1a1a1a1a1a"), new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Premium car phone holder for dashboard", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop", true, "Car Phone Holder", 24.99m, 85, null },
                    { new Guid("22b2b2b2-2b2b-2b2b-2b2b-2b2b2b2b2b2b"), new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Utc), "LED headlight bulbs for better visibility", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop", true, "LED Headlights", 89.99m, 40, null },
                    { new Guid("33c3c3c3-3c3c-3c3c-3c3c-3c3c3c3c3c3c"), new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Utc), "All-weather floor mats for cars", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop", true, "Car Floor Mats", 49.99m, 60, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Delete products first (due to foreign key constraints)
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    new Guid("77777777-7777-7777-7777-777777777777"),
                    new Guid("88888888-8888-8888-8888-888888888888"),
                    new Guid("99999999-9999-9999-9999-999999999999"),
                    new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                    new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                    new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                    new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                    new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff"),
                    new Guid("10101010-1010-1010-1010-101010101010"),
                    new Guid("20202020-2020-2020-2020-202020202020"),
                    new Guid("30303030-3030-3030-3030-303030303030"),
                    new Guid("40404040-4040-4040-4040-404040404040"),
                    new Guid("50505050-5050-5050-5050-505050505050"),
                    new Guid("60606060-6060-6060-6060-606060606060"),
                    new Guid("70707070-7070-7070-7070-707070707070"),
                    new Guid("80808080-8080-8080-8080-808080808080"),
                    new Guid("90909090-9090-9090-9090-909090909090"),
                    new Guid("a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0"),
                    new Guid("b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0"),
                    new Guid("c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0"),
                    new Guid("d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0"),
                    new Guid("e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0"),
                    new Guid("f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0"),
                    new Guid("11a1a1a1-1a1a-1a1a-1a1a-1a1a1a1a1a1a"),
                    new Guid("22b2b2b2-2b2b-2b2b-2b2b-2b2b2b2b2b2b"),
                    new Guid("33c3c3c3-3c3c-3c3c-3c3c-3c3c3c3c3c3c")
                });

            // Delete categories
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    new Guid("33333333-3333-3333-3333-333333333333"),
                    new Guid("44444444-4444-4444-4444-444444444444"),
                    new Guid("55555555-5555-5555-5555-555555555555"),
                    new Guid("66666666-6666-6666-6666-666666666666"),
                    new Guid("77777777-7777-7777-7777-777777777777"),
                    new Guid("88888888-8888-8888-8888-888888888888")
                });
        }
    }
}