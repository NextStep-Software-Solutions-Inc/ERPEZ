using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeWorkflowMatrixIndexUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OrganizationId", "DocumentType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OrganizationId", "DocumentType" });
        }
    }
}
