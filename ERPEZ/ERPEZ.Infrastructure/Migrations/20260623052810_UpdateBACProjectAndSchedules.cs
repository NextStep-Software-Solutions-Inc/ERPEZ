using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBACProjectAndSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.RenameColumn(
                name: "ActivityType",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                newName: "Status");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<decimal>(
                name: "ABC",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementActivityTypeId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingActivitySchedules_ProcurementActivityTypeId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                column: "ProcurementActivityTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_BiddingActivitySchedules_ProcurementActivityTypes_Procureme~",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                column: "ProcurementActivityTypeId",
                principalSchema: "planning",
                principalTable: "ProcurementActivityTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ModeOfProcurementId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BiddingActivitySchedules_ProcurementActivityTypes_Procureme~",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_BiddingActivitySchedules_ProcurementActivityTypeId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "ProcurementActivityTypeId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "Remarks",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                newName: "ActivityType");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ABC",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ModeOfProcurementId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
