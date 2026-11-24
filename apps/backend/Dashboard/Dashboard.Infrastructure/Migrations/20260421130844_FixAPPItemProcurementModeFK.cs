using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixAPPItemProcurementModeFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_DeliveryUnitId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "ProcurementModeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_ProcurementModelId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModelId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModelId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_ProcurementModelId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_DeliveryUnitId",
                schema: "planning",
                table: "APPItems",
                column: "DeliveryUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "APPItems",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
