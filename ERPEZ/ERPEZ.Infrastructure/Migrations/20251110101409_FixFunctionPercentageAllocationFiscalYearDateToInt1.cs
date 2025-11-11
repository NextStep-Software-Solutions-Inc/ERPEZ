using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFunctionPercentageAllocationFiscalYearDateToInt1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fiscal",
                schema: "catalog",
                table: "FunctionPercentageAllocations");

            migrationBuilder.RenameColumn(
                name: "FiscalInt",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "FiscalYear");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FiscalYear",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "FiscalInt");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Fiscal",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }
    }
}
