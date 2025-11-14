using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDUKPIIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPITargetId",
                schema: "catalog",
                table: "DUKPIAssignment");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPIId",
                schema: "catalog",
                table: "DUKPIAssignment",
                columns: new[] { "DeliveryUnitId", "KPIId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPIId",
                schema: "catalog",
                table: "DUKPIAssignment");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPITargetId",
                schema: "catalog",
                table: "DUKPIAssignment",
                columns: new[] { "DeliveryUnitId", "KPITargetId" },
                unique: true);
        }
    }
}
