using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDUKPIAssignmentUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DUKPIAssignments_DeliveryUnitId_KPIId",
                schema: "planning",
                table: "DUKPIAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignments_DeliveryUnitId_KPIId_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignments",
                columns: new[] { "DeliveryUnitId", "KPIId", "KPITargetId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DUKPIAssignments_DeliveryUnitId_KPIId_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignments_DeliveryUnitId_KPIId",
                schema: "planning",
                table: "DUKPIAssignments",
                columns: new[] { "DeliveryUnitId", "KPIId" },
                unique: true);
        }
    }
}
