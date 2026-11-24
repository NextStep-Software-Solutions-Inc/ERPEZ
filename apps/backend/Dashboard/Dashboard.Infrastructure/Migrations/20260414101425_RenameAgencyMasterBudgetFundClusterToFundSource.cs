using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameAgencyMasterBudgetFundClusterToFundSource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AgencyMasterBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.RenameColumn(
                name: "FundClusterId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "FundSourceId");

            migrationBuilder.RenameIndex(
                name: "IX_AgencyMasterBudgets_FundClusterId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "IX_AgencyMasterBudgets_FundSourceId");

            migrationBuilder.RenameIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId_FundClusterId_SourceDocume~",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "IX_AgencyMasterBudgets_FiscalYearId_FundSourceId_SourceDocumen~");

            migrationBuilder.AddForeignKey(
                name: "FK_AgencyMasterBudgets_FundSources_FundSourceId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AgencyMasterBudgets_FundSources_FundSourceId",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.RenameColumn(
                name: "FundSourceId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "FundClusterId");

            migrationBuilder.RenameIndex(
                name: "IX_AgencyMasterBudgets_FundSourceId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "IX_AgencyMasterBudgets_FundClusterId");

            migrationBuilder.RenameIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId_FundSourceId_SourceDocumen~",
                schema: "planning",
                table: "AgencyMasterBudgets",
                newName: "IX_AgencyMasterBudgets_FiscalYearId_FundClusterId_SourceDocume~");

            migrationBuilder.AddForeignKey(
                name: "FK_AgencyMasterBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                column: "FundClusterId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
