using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectives_WFPs_WFPId1",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId1",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropColumn(
                name: "WFPId1",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.AlterColumn<decimal>(
                name: "TargetValue",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "Weight",
                schema: "planning",
                table: "WFPObjectiveTargets",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "Weight",
                schema: "planning",
                table: "WFPObjectives",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveTargetId", "StartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveTargets");

            migrationBuilder.AlterColumn<decimal>(
                name: "TargetValue",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Weight",
                schema: "planning",
                table: "WFPObjectiveTargets",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Weight",
                schema: "planning",
                table: "WFPObjectives",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AddColumn<Guid>(
                name: "WFPId1",
                schema: "planning",
                table: "WFPObjectives",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId1",
                schema: "planning",
                table: "WFPObjectives",
                column: "WFPId1");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectives_WFPs_WFPId1",
                schema: "planning",
                table: "WFPObjectives",
                column: "WFPId1",
                principalSchema: "planning",
                principalTable: "WFPs",
                principalColumn: "Id");
        }
    }
}
