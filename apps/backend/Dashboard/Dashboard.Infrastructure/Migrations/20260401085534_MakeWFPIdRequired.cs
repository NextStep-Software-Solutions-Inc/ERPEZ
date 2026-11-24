using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeWFPIdRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPs_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.AlterColumn<Guid>(
                name: "WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPs_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPId",
                principalSchema: "planning",
                principalTable: "WFPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPs_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.AlterColumn<Guid>(
                name: "WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPs_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPId",
                principalSchema: "planning",
                principalTable: "WFPs",
                principalColumn: "Id");
        }
    }
}
