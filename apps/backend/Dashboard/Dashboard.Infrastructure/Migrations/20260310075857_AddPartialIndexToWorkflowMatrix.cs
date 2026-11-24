using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartialIndexToWorkflowMatrix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OfficeId", "DocumentType" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OfficeId", "DocumentType" },
                unique: true);
        }
    }
}
