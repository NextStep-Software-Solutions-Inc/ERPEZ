using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstraint_SupplierApplication_ProjectTin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PublicSupplierApplications_ProcurementProjectId",
                schema: "procurement",
                table: "PublicSupplierApplications");

            migrationBuilder.CreateIndex(
                name: "IX_PublicSupplierApplications_ProjectId_TinNumber",
                schema: "procurement",
                table: "PublicSupplierApplications",
                columns: new[] { "ProcurementProjectId", "TinNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PublicSupplierApplications_ProjectId_TinNumber",
                schema: "procurement",
                table: "PublicSupplierApplications");

            migrationBuilder.CreateIndex(
                name: "IX_PublicSupplierApplications_ProcurementProjectId",
                schema: "procurement",
                table: "PublicSupplierApplications",
                column: "ProcurementProjectId");
        }
    }
}
