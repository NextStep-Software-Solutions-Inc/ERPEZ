using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameOPCRItemRatingToFYActiveKPIMeasurement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRItemRatings_KPIMeasurements_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.RenameColumn(
                name: "KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "FYActiveKPIMeasurementId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRItemRatings_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "IX_OPCRItemRatings_FYActiveKPIMeasurementId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRItemRatings_FYActiveKPIMeasurements_FYActiveKPIMeasurem~",
                schema: "planning",
                table: "OPCRItemRatings",
                column: "FYActiveKPIMeasurementId",
                principalSchema: "planning",
                principalTable: "FYActiveKPIMeasurements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRItemRatings_FYActiveKPIMeasurements_FYActiveKPIMeasurem~",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.RenameColumn(
                name: "FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "KPIMeasurementId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "IX_OPCRItemRatings_OPCRItemId_KPIMeasurementId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRItemRatings_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                newName: "IX_OPCRItemRatings_KPIMeasurementId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRItemRatings_KPIMeasurements_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                column: "KPIMeasurementId",
                principalSchema: "planning",
                principalTable: "KPIMeasurements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
