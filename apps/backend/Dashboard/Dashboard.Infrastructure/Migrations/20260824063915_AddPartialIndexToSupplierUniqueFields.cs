using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartialIndexToSupplierUniqueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers",
                column: "BusinessPermitNo",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers",
                column: "TINNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories",
                column: "Name",
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers",
                column: "BusinessPermitNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers",
                column: "TINNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories",
                column: "Name",
                unique: true);
        }
    }
}
