using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixKPIRatingEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIRatings_KPIId",
                schema: "planning",
                table: "KPIRatings");

            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                schema: "planning",
                table: "KPIRatings",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_KPIId_PerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "KPIRatings",
                columns: new[] { "KPIId", "PerformanceMeasureId", "NumericalRating" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIRatings_KPIId_PerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "KPIRatings");

            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                schema: "planning",
                table: "KPIRatings",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_KPIId",
                schema: "planning",
                table: "KPIRatings",
                column: "KPIId");
        }
    }
}
