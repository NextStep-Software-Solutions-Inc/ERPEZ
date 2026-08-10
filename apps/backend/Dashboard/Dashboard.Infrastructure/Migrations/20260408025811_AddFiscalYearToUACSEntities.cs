using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFiscalYearToUACSEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "Organizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "Objects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "MFOPAPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "Locations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "FundSources",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_FiscalYearId",
                schema: "planning",
                table: "Organizations",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_Objects_FiscalYearId",
                schema: "planning",
                table: "Objects",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_FiscalYearId",
                schema: "planning",
                table: "MFOPAPs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_FiscalYearId",
                schema: "planning",
                table: "Locations",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_FundSources_FiscalYearId",
                schema: "planning",
                table: "FundSources",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_FundSources_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "FundSources",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Locations",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MFOPAPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "MFOPAPs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Objects_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Objects",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Organizations",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FundSources_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropForeignKey(
                name: "FK_MFOPAPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropForeignKey(
                name: "FK_Objects_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_FiscalYearId",
                schema: "planning",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Objects_FiscalYearId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.DropIndex(
                name: "IX_MFOPAPs_FiscalYearId",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropIndex(
                name: "IX_Locations_FiscalYearId",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_FundSources_FiscalYearId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "FundSources");
        }
    }
}
