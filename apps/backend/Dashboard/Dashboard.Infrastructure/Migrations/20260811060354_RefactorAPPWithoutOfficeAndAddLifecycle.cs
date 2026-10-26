using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorAPPWithoutOfficeAndAddLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPs_Offices_OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APPs_OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.AddColumn<string>(
                name: "APPType",
                schema: "planning",
                table: "APPs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Batch",
                schema: "planning",
                table: "APPs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Quarter",
                schema: "planning",
                table: "APPs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            // Backfill: assign safe defaults to any pre-existing APP rows so that
            // APPType, Batch, and Quarter are never left as empty strings after migration.
            migrationBuilder.Sql(
                "UPDATE planning.\"APPs\" SET \"APPType\" = 'Indicative' WHERE \"APPType\" = '';");
            migrationBuilder.Sql(
                "UPDATE planning.\"APPs\" SET \"Batch\" = 'Batch 1' WHERE \"Batch\" = '';");
            migrationBuilder.Sql(
                "UPDATE planning.\"APPs\" SET \"Quarter\" = 'Q1' WHERE \"Quarter\" = '';");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceAPPId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VersionDate",
                schema: "planning",
                table: "APPs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VersionNumber",
                schema: "planning",
                table: "APPs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndOfProcurementOverride",
                schema: "planning",
                table: "APPItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNew",
                schema: "planning",
                table: "APPItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRevised",
                schema: "planning",
                table: "APPItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartOfProcurementOverride",
                schema: "planning",
                table: "APPItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_APPs_SourceAPPId",
                schema: "planning",
                table: "APPs",
                column: "SourceAPPId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPs_APPs_SourceAPPId",
                schema: "planning",
                table: "APPs",
                column: "SourceAPPId",
                principalSchema: "planning",
                principalTable: "APPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPs_APPs_SourceAPPId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APPs_SourceAPPId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "APPType",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "Batch",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "Quarter",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "SourceAPPId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "VersionDate",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "VersionNumber",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "EndOfProcurementOverride",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "IsNew",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "IsRevised",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "StartOfProcurementOverride",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_APPs_OfficeId",
                schema: "planning",
                table: "APPs",
                column: "OfficeId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPs_Offices_OfficeId",
                schema: "planning",
                table: "APPs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
