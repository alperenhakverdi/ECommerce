using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductVariantsSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BasePrice",
                table: "Products",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "HasVariants",
                table: "Products",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Products",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Products",
                type: "decimal(8,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ProductVariantId",
                table: "OrderItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VariantInfo",
                table: "OrderItems",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProductVariantId",
                table: "CartItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductAttributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SKU = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    VariantName = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    PriceAdjustment = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Stock = table.Column<int>(type: "INTEGER", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductAttributeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ColorCode = table.Column<string>(type: "TEXT", maxLength: 7, nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValues_ProductAttributes_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalTable: "ProductAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariantAttributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductAttributeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductAttributeValueId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariantAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariantAttributes_ProductAttributeValues_ProductAttributeValueId",
                        column: x => x.ProductAttributeValueId,
                        principalTable: "ProductAttributeValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductVariantAttributes_ProductAttributes_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalTable: "ProductAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductVariantAttributes_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "BasePrice", "HasVariants", "Tags", "Weight" },
                values: new object[] { 0m, false, null, 0m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "BasePrice", "HasVariants", "Tags", "Weight" },
                values: new object[] { 0m, false, null, 0m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "BasePrice", "HasVariants", "Tags", "Weight" },
                values: new object[] { 0m, false, null, 0m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "BasePrice", "HasVariants", "Tags", "Weight" },
                values: new object[] { 0m, false, null, 0m });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductVariantId",
                table: "OrderItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductVariantId",
                table: "CartItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_IsActive",
                table: "ProductAttributes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_Name",
                table: "ProductAttributes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_SortOrder",
                table: "ProductAttributes",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_IsActive",
                table: "ProductAttributeValues",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_ProductAttributeId",
                table: "ProductAttributeValues",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_SortOrder",
                table: "ProductAttributeValues",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributes_ProductAttributeId",
                table: "ProductVariantAttributes",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributes_ProductAttributeValueId",
                table: "ProductVariantAttributes",
                column: "ProductAttributeValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributes_ProductVariantId",
                table: "ProductVariantAttributes",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributes_ProductVariantId_ProductAttributeId",
                table: "ProductVariantAttributes",
                columns: new[] { "ProductVariantId", "ProductAttributeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_IsActive",
                table: "ProductVariants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_SKU",
                table: "ProductVariants",
                column: "SKU",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_Stock",
                table: "ProductVariants",
                column: "Stock");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductVariants_ProductVariantId",
                table: "CartItems",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_ProductVariants_ProductVariantId",
                table: "OrderItems",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductVariants_ProductVariantId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_ProductVariants_ProductVariantId",
                table: "OrderItems");

            migrationBuilder.DropTable(
                name: "ProductVariantAttributes");

            migrationBuilder.DropTable(
                name: "ProductAttributeValues");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "ProductAttributes");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_ProductVariantId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_ProductVariantId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "BasePrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "HasVariants",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "VariantInfo",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "CartItems");
        }
    }
}
