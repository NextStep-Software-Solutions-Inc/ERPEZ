using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFiscalYearLockAndDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                schema: "planning",
                table: "FiscalYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                schema: "planning",
                table: "FiscalYears",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                schema: "planning",
                table: "FiscalYears",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                schema: "planning",
                table: "FiscalYears");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                schema: "planning",
                table: "FiscalYears");

            migrationBuilder.DropColumn(
                name: "StartDate",
                schema: "planning",
                table: "FiscalYears");
        }
    }
}
