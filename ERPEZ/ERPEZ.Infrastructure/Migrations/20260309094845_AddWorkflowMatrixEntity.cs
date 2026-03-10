using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowMatrixEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowMatrices_Organizations_OrganizationId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.RenameColumn(
                name: "RecommendedByUserId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "RecommendingApproverPositionId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "OfficeId");

            migrationBuilder.RenameColumn(
                name: "ApprovedByUserId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "FinalApproverPositionId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkflowMatrices_OrganizationId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "IX_WorkflowMatrices_OfficeId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "planning",
                table: "WorkflowMatrices",
                type: "text",
                nullable: false,
                defaultValue: "Inactive");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FinalApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "FinalApproverPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_RecommendingApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "RecommendingApproverPositionId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowMatrices_Offices_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowMatrices_Positions_FinalApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "FinalApproverPositionId",
                principalSchema: "planning",
                principalTable: "Positions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowMatrices_Positions_RecommendingApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "RecommendingApproverPositionId",
                principalSchema: "planning",
                principalTable: "Positions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowMatrices_Offices_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowMatrices_Positions_FinalApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowMatrices_Positions_RecommendingApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FinalApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_RecommendingApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.RenameColumn(
                name: "RecommendingApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "RecommendedByUserId");

            migrationBuilder.RenameColumn(
                name: "OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "OrganizationId");

            migrationBuilder.RenameColumn(
                name: "FinalApproverPositionId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "ApprovedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkflowMatrices_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "IX_WorkflowMatrices_OrganizationId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                newName: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowMatrices_Organizations_OrganizationId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "OrganizationId",
                principalSchema: "planning",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
