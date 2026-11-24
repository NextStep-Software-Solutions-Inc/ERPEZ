using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceProcurementCategoryWithSupplierCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Suppliers_ProcurementCategories_ProcurementCategoryId",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.RenameColumn(
                name: "ProcurementCategoryId",
                schema: "planning",
                table: "Suppliers",
                newName: "SupplierCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_ProcurementCategoryId",
                schema: "planning",
                table: "Suppliers",
                newName: "IX_Suppliers_SupplierCategoryId");

            migrationBuilder.CreateTable(
                name: "SupplierCategories",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_SupplierCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Suppliers_SupplierCategories_SupplierCategoryId",
                schema: "planning",
                table: "Suppliers",
                column: "SupplierCategoryId",
                principalSchema: "planning",
                principalTable: "SupplierCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Suppliers_SupplierCategories_SupplierCategoryId",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropTable(
                name: "SupplierCategories",
                schema: "planning");

            migrationBuilder.RenameColumn(
                name: "SupplierCategoryId",
                schema: "planning",
                table: "Suppliers",
                newName: "ProcurementCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_SupplierCategoryId",
                schema: "planning",
                table: "Suppliers",
                newName: "IX_Suppliers_ProcurementCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Suppliers_ProcurementCategories_ProcurementCategoryId",
                schema: "planning",
                table: "Suppliers",
                column: "ProcurementCategoryId",
                principalSchema: "planning",
                principalTable: "ProcurementCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
