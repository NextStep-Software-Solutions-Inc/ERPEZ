using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddItemCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ItemCategories",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementItems_ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems",
                column: "ItemCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems",
                column: "ItemCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_NonCSEItems_ItemCategories_ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems",
                column: "ItemCategoryId",
                principalSchema: "procurement",
                principalTable: "ItemCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementItems_ItemCategories_ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems",
                column: "ItemCategoryId",
                principalSchema: "procurement",
                principalTable: "ItemCategories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NonCSEItems_ItemCategories_ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementItems_ItemCategories_ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems");

            migrationBuilder.DropTable(
                name: "ItemCategories",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementItems_ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "ItemCategoryId",
                schema: "planning",
                table: "ProcurementItems");

            migrationBuilder.DropColumn(
                name: "ItemCategoryId",
                schema: "planning",
                table: "NonCSEItems");
        }
    }
}
