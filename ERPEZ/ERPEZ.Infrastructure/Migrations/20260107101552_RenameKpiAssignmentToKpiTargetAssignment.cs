using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameKpiAssignmentToKpiTargetAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.RenameColumn(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "DUKPITargetAssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRRatings_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "IX_OPCRRatings_DUKPITargetAssignmentId");

            migrationBuilder.RenameColumn(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "DUKPITargetAssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                newName: "IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRActivities_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "IX_OPCRActivities_DUKPITargetAssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPITargetAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPITargetAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.RenameColumn(
                name: "DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "DUKPIAssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRRatings_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "IX_OPCRRatings_DUKPIAssignmentId");

            migrationBuilder.RenameColumn(
                name: "DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "DUKPIAssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                newName: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRActivities_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "IX_OPCRActivities_DUKPIAssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
