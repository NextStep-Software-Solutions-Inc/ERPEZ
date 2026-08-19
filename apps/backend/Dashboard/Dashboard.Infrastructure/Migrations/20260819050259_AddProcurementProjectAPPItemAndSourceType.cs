using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementProjectAPPItemAndSourceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "APPItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_APPItems_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "APPItemId",
                principalSchema: "planning",
                principalTable: "APPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequests_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "ProcurementProjectId",
                principalSchema: "procurement",
                principalTable: "ProcurementProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPObjectiveId",
                principalSchema: "planning",
                principalTable: "WFPObjectives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_APPItems_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequests_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "SourceType",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPObjectiveId",
                principalSchema: "planning",
                principalTable: "WFPObjectives",
                principalColumn: "Id");
        }
    }
}
