using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOPCRActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRId", "DUKPIAssignmentId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRId", "DUKPIAssignmentId", "Name" });
        }
    }
}
