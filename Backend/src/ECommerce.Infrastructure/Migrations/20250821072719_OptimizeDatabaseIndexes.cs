using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeDatabaseIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_ExpiryDate_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "ExpiryDate", "IsRevoked" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_IsRevoked",
                table: "RefreshTokens",
                column: "IsRevoked");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "UserId", "IsRevoked" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive",
                table: "Products",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive_CategoryId",
                table: "Products",
                columns: new[] { "IsActive", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive_Price",
                table: "Products",
                columns: new[] { "IsActive", "Price" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive_Stock",
                table: "Products",
                columns: new[] { "IsActive", "Stock" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_Price",
                table: "Products",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Stock",
                table: "Products",
                column: "Stock");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_Email_IsUsed",
                table: "PasswordResetTokens",
                columns: new[] { "Email", "IsUsed" });

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_ExpiryDate_IsUsed",
                table: "PasswordResetTokens",
                columns: new[] { "ExpiryDate", "IsUsed" });

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_IsUsed",
                table: "PasswordResetTokens",
                column: "IsUsed");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CustomerEmail",
                table: "Orders",
                column: "CustomerEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status",
                table: "Orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId_CreatedAt",
                table: "Orders",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId_Status",
                table: "Orders",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_City",
                table: "Addresses",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_PostalCode",
                table: "Addresses",
                column: "PostalCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_ExpiryDate_IsRevoked",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_IsRevoked",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_UserId_IsRevoked",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsActive",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsActive_CategoryId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsActive_Price",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsActive_Stock",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Price",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Stock",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_Email_IsUsed",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_ExpiryDate_IsUsed",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_IsUsed",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CustomerEmail",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UserId_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UserId_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_City",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_PostalCode",
                table: "Addresses");
        }
    }
}
