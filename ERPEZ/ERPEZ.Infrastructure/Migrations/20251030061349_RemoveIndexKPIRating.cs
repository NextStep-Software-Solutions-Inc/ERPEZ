using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIndexKPIRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIRatings_KPIId_PerformanceMeasureId",
                schema: "catalog",
                table: "KPIRatings");

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_KPIId",
                schema: "catalog",
                table: "KPIRatings",
                column: "KPIId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIRatings_KPIId",
                schema: "catalog",
                table: "KPIRatings");

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_KPIId_PerformanceMeasureId",
                schema: "catalog",
                table: "KPIRatings",
                columns: new[] { "KPIId", "PerformanceMeasureId" },
                unique: true);
        }
    }
}
