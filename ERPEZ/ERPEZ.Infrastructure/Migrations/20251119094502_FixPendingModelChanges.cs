using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DUKPIAssignment_KPIs_KPIId1",
                schema: "planning",
                table: "DUKPIAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_KPITargets_KPIs_KPIId1",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRKPI_KPIs_KPIId1",
                schema: "planning",
                table: "OPCRKPI");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPPAPDepartment_SubDeliveryUnit_SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartment_SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment");

            migrationBuilder.DropIndex(
                name: "IX_OPCRKPI_KPIId1",
                schema: "planning",
                table: "OPCRKPI");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId1",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_DUKPIAssignment_KPIId1",
                schema: "planning",
                table: "DUKPIAssignment");

            migrationBuilder.DropColumn(
                name: "SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment");

            migrationBuilder.DropColumn(
                name: "KPIId1",
                schema: "planning",
                table: "OPCRKPI");

            migrationBuilder.DropColumn(
                name: "KPIId1",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropColumn(
                name: "KPIId1",
                schema: "planning",
                table: "DUKPIAssignment");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId1",
                schema: "planning",
                table: "OPCRKPI",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId1",
                schema: "planning",
                table: "KPITargets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId1",
                schema: "planning",
                table: "DUKPIAssignment",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartment_SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment",
                column: "SubDeliveryUnitId1");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPI_KPIId1",
                schema: "planning",
                table: "OPCRKPI",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId1",
                schema: "planning",
                table: "KPITargets",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPIId1",
                schema: "planning",
                table: "DUKPIAssignment",
                column: "KPIId1");

            migrationBuilder.AddForeignKey(
                name: "FK_DUKPIAssignment_KPIs_KPIId1",
                schema: "planning",
                table: "DUKPIAssignment",
                column: "KPIId1",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_KPITargets_KPIs_KPIId1",
                schema: "planning",
                table: "KPITargets",
                column: "KPIId1",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRKPI_KPIs_KPIId1",
                schema: "planning",
                table: "OPCRKPI",
                column: "KPIId1",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPPAPDepartment_SubDeliveryUnit_SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment",
                column: "SubDeliveryUnitId1",
                principalSchema: "planning",
                principalTable: "SubDeliveryUnit",
                principalColumn: "Id");
        }
    }
}
