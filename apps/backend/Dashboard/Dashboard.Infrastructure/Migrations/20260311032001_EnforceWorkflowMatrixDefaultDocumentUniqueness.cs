using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnforceWorkflowMatrixDefaultDocumentUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OfficeId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"DocumentType\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices");
        }
    }
}
