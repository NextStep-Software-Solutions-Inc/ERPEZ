using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOPCREntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "FiscalYear",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("DELETE FROM planning.\"OPCRs\"", true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "DeliveryUnitId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.AddColumn<int>(
                name: "FiscalYear",
                schema: "planning",
                table: "OPCRs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" },
                unique: true);
        }
    }
}
