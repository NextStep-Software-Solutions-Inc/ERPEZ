using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexFPAFunctionTypeAndFiscalYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_FunctionPercentageAllocations_FunctionType_FiscalYear",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                columns: new[] { "FunctionType", "FiscalYear" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FunctionPercentageAllocations_FunctionType_FiscalYear",
                schema: "catalog",
                table: "FunctionPercentageAllocations");
        }
    }
}
