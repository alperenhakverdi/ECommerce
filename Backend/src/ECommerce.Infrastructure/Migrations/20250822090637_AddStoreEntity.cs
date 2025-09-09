using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "Products",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Stores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    LogoUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    BannerUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    ContactEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ContactPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Website = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    BusinessAddress = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    TaxNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsApproved = table.Column<bool>(type: "INTEGER", nullable: false),
                    Rating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TotalSales = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalProducts = table.Column<int>(type: "INTEGER", nullable: false),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stores_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Leave StoreId as NULL for existing products - they are "direct sales" products

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsActive_StoreId",
                table: "Products",
                columns: new[] { "IsActive", "StoreId" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_StoreId",
                table: "Products",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId",
                table: "Orders",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId_Status",
                table: "Orders",
                columns: new[] { "StoreId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Stores_ContactEmail",
                table: "Stores",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Stores_IsActive",
                table: "Stores",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Stores_IsActive_IsApproved",
                table: "Stores",
                columns: new[] { "IsActive", "IsApproved" });

            migrationBuilder.CreateIndex(
                name: "IX_Stores_IsApproved",
                table: "Stores",
                column: "IsApproved");

            migrationBuilder.CreateIndex(
                name: "IX_Stores_Name",
                table: "Stores",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Stores_OwnerId",
                table: "Stores",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Stores_StoreId",
                table: "Orders",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Stores_StoreId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "Stores");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsActive_StoreId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_StoreId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId_Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "Orders");
        }
    }
}
