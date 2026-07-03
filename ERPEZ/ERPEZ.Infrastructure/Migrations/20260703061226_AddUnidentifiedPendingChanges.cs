using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUnidentifiedPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BACResolutions_APPs_APPId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropForeignKey(
                name: "FK_BACResolutions_FiscalYears_FiscalYearId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropForeignKey(
                name: "FK_BACResolutions_Offices_OfficeId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "APPId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_AOBs_AOBId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "AOBId",
                principalSchema: "procurement",
                principalTable: "AOBs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_APPItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "APPItemId",
                principalSchema: "planning",
                principalTable: "APPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_Suppliers_WinningSupplierId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "WinningSupplierId",
                principalSchema: "planning",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AOBProcurementProjectMappings_AOBs_AOBId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                column: "AOBId",
                principalSchema: "procurement",
                principalTable: "AOBs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AOBProcurementProjectMappings_ProcurementProjects_Procureme~",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                column: "ProcurementProjectId",
                principalSchema: "procurement",
                principalTable: "ProcurementProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APRs_APPs_APPId",
                schema: "procurement",
                table: "APRs",
                column: "APPId",
                principalSchema: "planning",
                principalTable: "APPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_APRs_FiscalYears_FiscalYearId",
                schema: "procurement",
                table: "APRs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_APRs_Offices_OfficeId",
                schema: "procurement",
                table: "APRs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_AOBs_AOBId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_APPItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_Suppliers_WinningSupplierId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AOBProcurementProjectMappings_AOBs_AOBId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings");

            migrationBuilder.DropForeignKey(
                name: "FK_AOBProcurementProjectMappings_ProcurementProjects_Procureme~",
                schema: "procurement",
                table: "AOBProcurementProjectMappings");

            migrationBuilder.DropForeignKey(
                name: "FK_APRs_APPs_APPId",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropForeignKey(
                name: "FK_APRs_FiscalYears_FiscalYearId",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropForeignKey(
                name: "FK_APRs_Offices_OfficeId",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.AddColumn<Guid>(
                name: "APPId",
                schema: "procurement",
                table: "BACResolutions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "procurement",
                table: "BACResolutions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "procurement",
                table: "BACResolutions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BACResolutions_APPs_APPId",
                schema: "procurement",
                table: "BACResolutions",
                column: "APPId",
                principalSchema: "planning",
                principalTable: "APPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BACResolutions_FiscalYears_FiscalYearId",
                schema: "procurement",
                table: "BACResolutions",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BACResolutions_Offices_OfficeId",
                schema: "procurement",
                table: "BACResolutions",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
