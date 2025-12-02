using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuarterNameFilterToKPITargetIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId_Period",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period", "QuarterName" },
                unique: true,
                filter: "\"QuarterName\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period" },
                unique: true);
        }
    }
}
