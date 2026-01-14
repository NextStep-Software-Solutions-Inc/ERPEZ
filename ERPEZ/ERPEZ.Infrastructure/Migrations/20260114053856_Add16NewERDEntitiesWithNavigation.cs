using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add16NewERDEntitiesWithNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModeId",
                schema: "other",
                table: "PPMPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModeId",
                schema: "other",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_DUAllocationId",
                schema: "budget",
                table: "PPMPs",
                column: "DUAllocationId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_CSEItemId",
                schema: "other",
                table: "PPMPItems",
                column: "CSEItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_NonCSEItemId",
                schema: "other",
                table: "PPMPItems",
                column: "NonCSEItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_ProcurementModeId",
                schema: "other",
                table: "PPMPItems",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityRatings_PerformanceMeasureId",
                schema: "performance",
                table: "OPCRActivityRatings",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_DUAllocationId",
                schema: "budget",
                table: "LineItemBudgets",
                column: "DUAllocationId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "LineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_WFPExpenditureId",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "WFPExpenditureId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_ProcurementModeId",
                schema: "other",
                table: "APPItems",
                column: "ProcurementModeId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_APPs_APPId",
                schema: "other",
                table: "APPItems",
                column: "APPId",
                principalSchema: "budget",
                principalTable: "APPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_DeliveryUnits_DeliveryUnitId",
                schema: "other",
                table: "APPItems",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_FundSources_FundSourceId",
                schema: "other",
                table: "APPItems",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_PPMPItems_PPMPItemId",
                schema: "other",
                table: "APPItems",
                column: "PPMPItemId",
                principalSchema: "other",
                principalTable: "PPMPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "other",
                table: "APPItems",
                column: "ProcurementModeId",
                principalSchema: "procurement",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPProcurementSchedules_PPMPItems_PPMPItemId",
                schema: "other",
                table: "APPProcurementSchedules",
                column: "PPMPItemId",
                principalSchema: "other",
                principalTable: "PPMPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPProcurementSchedules_ProcurementActivityTypes_Procuremen~",
                schema: "other",
                table: "APPProcurementSchedules",
                column: "ProcurementActivityTypeId",
                principalSchema: "procurement",
                principalTable: "ProcurementActivityTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetActivities_LineItemBudgets_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetActivities",
                column: "LineItemBudgetId",
                principalSchema: "budget",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetActivities_OPCRActivities_OPCRActivityId",
                schema: "budget",
                table: "LineItemBudgetActivities",
                column: "OPCRActivityId",
                principalSchema: "planning",
                principalTable: "OPCRActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveTargets_WFPObjectiveTa~",
                schema: "budget",
                table: "LineItemBudgetActivities",
                column: "WFPObjectiveTargetId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargets",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_LineItemBudgetActivities_LineItemBudg~",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "LineItemBudgetActivityId",
                principalSchema: "budget",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_LineItemBudgets_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "LineItemBudgetId",
                principalSchema: "budget",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_Objects_ObjectId",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "ObjectId",
                principalSchema: "planning",
                principalTable: "Objects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPExp~",
                schema: "budget",
                table: "LineItemBudgetDetails",
                column: "WFPExpenditureId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargetExpenditures",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_DUAllocations_DUAllocationId",
                schema: "budget",
                table: "LineItemBudgets",
                column: "DUAllocationId",
                principalSchema: "planning",
                principalTable: "DUAllocations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "budget",
                table: "LineItemBudgets",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivityEvaluations_OPCRActivityRatings_OPCRActivityRat~",
                schema: "performance",
                table: "OPCRActivityEvaluations",
                column: "OPCRActivityRatingId",
                principalSchema: "performance",
                principalTable: "OPCRActivityRatings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivityMOVs_OPCRActivities_OPCRActivityId",
                schema: "performance",
                table: "OPCRActivityMOVs",
                column: "OPCRActivityId",
                principalSchema: "planning",
                principalTable: "OPCRActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivityRatings_OPCRActivities_OPCRActivityId",
                schema: "performance",
                table: "OPCRActivityRatings",
                column: "OPCRActivityId",
                principalSchema: "planning",
                principalTable: "OPCRActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivityRatings_PerformanceMeasures_PerformanceMeasureId",
                schema: "performance",
                table: "OPCRActivityRatings",
                column: "PerformanceMeasureId",
                principalSchema: "planning",
                principalTable: "PerformanceMeasures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItemAllocations_PPMPItems_PPMPItemId",
                schema: "other",
                table: "PPMPItemAllocations",
                column: "PPMPItemId",
                principalSchema: "other",
                principalTable: "PPMPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "other",
                table: "PPMPItems",
                column: "CSEItemId",
                principalSchema: "procurement",
                principalTable: "CSEItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "other",
                table: "PPMPItems",
                column: "LineItemBudgetDetailId",
                principalSchema: "budget",
                principalTable: "LineItemBudgetDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "other",
                table: "PPMPItems",
                column: "NonCSEItemId",
                principalSchema: "procurement",
                principalTable: "NonCSEItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_PPMPs_PPMPId",
                schema: "other",
                table: "PPMPItems",
                column: "PPMPId",
                principalSchema: "budget",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "other",
                table: "PPMPItems",
                column: "ProcurementModeId",
                principalSchema: "procurement",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_DUAllocations_DUAllocationId",
                schema: "budget",
                table: "PPMPs",
                column: "DUAllocationId",
                principalSchema: "planning",
                principalTable: "DUAllocations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_DeliveryUnits_DeliveryUnitId",
                schema: "budget",
                table: "PPMPs",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_APPs_APPId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_DeliveryUnits_DeliveryUnitId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_FundSources_FundSourceId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_PPMPItems_PPMPItemId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPProcurementSchedules_PPMPItems_PPMPItemId",
                schema: "other",
                table: "APPProcurementSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_APPProcurementSchedules_ProcurementActivityTypes_Procuremen~",
                schema: "other",
                table: "APPProcurementSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetActivities_LineItemBudgets_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetActivities_OPCRActivities_OPCRActivityId",
                schema: "budget",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveTargets_WFPObjectiveTa~",
                schema: "budget",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_LineItemBudgetActivities_LineItemBudg~",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_LineItemBudgets_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_Objects_ObjectId",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPExp~",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_DUAllocations_DUAllocationId",
                schema: "budget",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "budget",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivityEvaluations_OPCRActivityRatings_OPCRActivityRat~",
                schema: "performance",
                table: "OPCRActivityEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivityMOVs_OPCRActivities_OPCRActivityId",
                schema: "performance",
                table: "OPCRActivityMOVs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivityRatings_OPCRActivities_OPCRActivityId",
                schema: "performance",
                table: "OPCRActivityRatings");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivityRatings_PerformanceMeasures_PerformanceMeasureId",
                schema: "performance",
                table: "OPCRActivityRatings");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItemAllocations_PPMPItems_PPMPItemId",
                schema: "other",
                table: "PPMPItemAllocations");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_PPMPs_PPMPId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_DUAllocations_DUAllocationId",
                schema: "budget",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_DeliveryUnits_DeliveryUnitId",
                schema: "budget",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_DUAllocationId",
                schema: "budget",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_CSEItemId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_NonCSEItemId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_ProcurementModeId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivityRatings_PerformanceMeasureId",
                schema: "performance",
                table: "OPCRActivityRatings");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_DUAllocationId",
                schema: "budget",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_WFPExpenditureId",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_ProcurementModeId",
                schema: "other",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "ProcurementModeId",
                schema: "other",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "LineItemBudgetId",
                schema: "budget",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropColumn(
                name: "ProcurementModeId",
                schema: "other",
                table: "APPItems");
        }
    }
}
