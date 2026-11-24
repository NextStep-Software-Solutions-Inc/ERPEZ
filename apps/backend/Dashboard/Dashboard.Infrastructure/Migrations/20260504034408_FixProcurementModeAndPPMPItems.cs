using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixProcurementModeAndPPMPItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_APPItems_ProcurementModes_ProcurementModeId",
            //     schema: "planning",
            //     table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModelId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_ProcurementModelId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.RenameColumn(
                name: "ProcurementModelId",
                schema: "planning",
                table: "APPItems",
                newName: "ProcurementModeId");

            // migrationBuilder.AddColumn<bool>(
            //     name: "IsActive",
            //     schema: "planning",
            //     table: "ProcurementActivityTypes",
            //     type: "boolean",
            //     nullable: false,
            //     defaultValue: false);

            // migrationBuilder.AddColumn<bool>(
            //     name: "IsArchived",
            //     schema: "planning",
            //     table: "ProcurementActivityTypes",
            //     type: "boolean",
            //     nullable: false,
            //     defaultValue: false);

            // migrationBuilder.AddColumn<int>(
            //     name: "MaxDays",
            //     schema: "planning",
            //     table: "ProcurementActivityTypes",
            //     type: "integer",
            //     nullable: true);

            // migrationBuilder.AddColumn<int>(
            //     name: "MinDays",
            //     schema: "planning",
            //     table: "ProcurementActivityTypes",
            //     type: "integer",
            //     nullable: true);

           migrationBuilder.CreateIndex(
                name: "IX_APPItems_ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModeId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "MaxDays",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "MinDays",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModelId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_ProcurementModelId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModelId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModelId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
