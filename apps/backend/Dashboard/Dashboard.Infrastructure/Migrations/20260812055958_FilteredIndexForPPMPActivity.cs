using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FilteredIndexForPPMPActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "PPMPId", "LIBActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "PPMPId", "LIBActivityId" },
                unique: true);
        }
    }
}
