using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SquashedMigrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FunctionAllocations_FiscalYear_FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropIndex(
                name: "IX_FunctionAllocations_FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropColumn(
                name: "FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.Sql("DELETE FROM planning.\"FunctionAllocations\" WHERE \"FiscalYearId\" IS NOT NULL");

            migrationBuilder.AlterColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_FunctionAllocations_FiscalYear_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYear",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FunctionAllocations_FiscalYear_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropIndex(
                name: "IX_FunctionAllocations_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.AlterColumn<int>(
                name: "FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations",
                column: "FiscalYearId1");

            migrationBuilder.AddForeignKey(
                name: "FK_FunctionAllocations_FiscalYear_FiscalYearId1",
                schema: "planning",
                table: "FunctionAllocations",
                column: "FiscalYearId1",
                principalSchema: "planning",
                principalTable: "FiscalYear",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
