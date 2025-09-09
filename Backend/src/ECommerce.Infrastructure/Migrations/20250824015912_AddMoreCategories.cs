using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add more categories to have at least 6 visible
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Description", "IsActive", "CreatedAt" },
                values: new object[,]
                {
                    { Guid.NewGuid(), "Books & Media", "Books, magazines, and digital media", true, DateTime.UtcNow },
                    { Guid.NewGuid(), "Sports & Fitness", "Sports equipment and fitness gear", true, DateTime.UtcNow },
                    { Guid.NewGuid(), "Beauty & Personal Care", "Cosmetics, skincare, and personal care products", true, DateTime.UtcNow },
                    { Guid.NewGuid(), "Home & Garden", "Home decor, furniture, and garden supplies", true, DateTime.UtcNow },
                    { Guid.NewGuid(), "Toys & Games", "Toys, games, and hobby items", true, DateTime.UtcNow },
                    { Guid.NewGuid(), "Automotive", "Car accessories and automotive supplies", true, DateTime.UtcNow }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the added categories
            migrationBuilder.Sql(@"
                DELETE FROM Categories 
                WHERE Name IN (
                    'Books & Media',
                    'Sports & Fitness', 
                    'Beauty & Personal Care',
                    'Home & Garden',
                    'Toys & Games',
                    'Automotive'
                )
            ");
        }
    }
}
