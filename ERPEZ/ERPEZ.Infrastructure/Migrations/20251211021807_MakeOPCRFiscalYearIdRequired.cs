using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeOPCRFiscalYearIdRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.AlterColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.AlterColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");
        }
    }
}
