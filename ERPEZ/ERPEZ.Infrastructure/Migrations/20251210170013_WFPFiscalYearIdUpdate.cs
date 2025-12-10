using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WFPFiscalYearIdUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "FiscalYear",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.AlterColumn<decimal>(
                name: "ProposedBudget",
                schema: "planning",
                table: "WFPs",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "WFPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ProjectEndDate",
                schema: "planning",
                table: "WFPs",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<DateOnly>(
                name: "ProjectStartDate",
                schema: "planning",
                table: "WFPs",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<decimal>(
                name: "Outcome",
                schema: "planning",
                table: "WFPObjectives",
                type: "numeric",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ItemDescription",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "DeliveryUnitId", "FiscalYearId" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "ProjectEndDate",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "ProjectStartDate",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "Outcome",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.AlterColumn<decimal>(
                name: "ProposedBudget",
                schema: "planning",
                table: "WFPs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FiscalYear",
                schema: "planning",
                table: "WFPs",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ItemDescription",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" });
        }
    }
}
