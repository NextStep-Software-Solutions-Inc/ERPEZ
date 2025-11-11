using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFunctionPercentageAllocationFiscalYearDateToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FiscalYear",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "Fiscal");

            migrationBuilder.AddColumn<int>(
                name: "FiscalInt",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FiscalInt",
                schema: "catalog",
                table: "FunctionPercentageAllocations");

            migrationBuilder.RenameColumn(
                name: "Fiscal",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "FiscalYear");
        }
    }
}
