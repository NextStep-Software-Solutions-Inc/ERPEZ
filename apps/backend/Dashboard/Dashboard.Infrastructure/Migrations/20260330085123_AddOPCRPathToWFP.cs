using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOPCRPathToWFP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveTargets_WFPObjectiveTa~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPObj~",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveTimelines_WFPObjectiveTargets_WFPObjectiveTarge~",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargets",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.AddColumn<Guid>(
                name: "OPCRId",
                schema: "planning",
                table: "WFPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_OPCRId",
                schema: "planning",
                table: "WFPs",
                column: "OPCRId");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveTargetId",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "WFPObjectiveActivityId");

            migrationBuilder.RenameIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate_EndDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate_EndD~");

            migrationBuilder.RenameIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveTargetExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "WFPObjectiveActivityExpenditureId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetDetails_WFPObjectiveTargetExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "IX_LineItemBudgetDetails_WFPObjectiveActivityExpenditureId");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveTargetId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                newName: "WFPObjectiveActivityId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetActivities_WFPObjectiveTargetId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                newName: "IX_LineItemBudgetActivities_WFPObjectiveActivityId");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedDate",
                schema: "planning",
                table: "WFPs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FundSourceId",
                schema: "planning",
                table: "WFPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedDate",
                schema: "planning",
                table: "WFPs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WFPObjectiveActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveId = table.Column<Guid>(type: "uuid", nullable: true),
                    OPCRActivityId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActivityName = table.Column<string>(type: "text", nullable: false),
                    Indicator = table.Column<string>(type: "text", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPObjectiveActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveActivities_OPCRActivities_OPCRActivityId",
                        column: x => x.OPCRActivityId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                        column: x => x.WFPObjectiveId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveActivityExpenditures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: true),
                    UnitCost = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPObjectiveActivityExpenditures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveActivityExpenditures_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveActivityExpenditures_WFPObjectiveActivities_WFP~",
                        column: x => x.WFPObjectiveActivityId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_FundSourceId",
                schema: "planning",
                table: "WFPs",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_OfficeId_Mode",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "OfficeId", "Mode" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivities_OPCRActivityId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "OPCRActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveActivities",
                columns: new[] { "WFPObjectiveId", "ActivityName" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName_Indicator",
                schema: "planning",
                table: "WFPObjectiveActivities",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivityExpenditures_ObjectId",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivityExpenditures_WFPObjectiveActivityId_Obj~",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures",
                columns: new[] { "WFPObjectiveActivityId", "ObjectId", "ItemDescription" });

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveActivities_WFPObjectiv~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                column: "WFPObjectiveActivityId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveActivityExpenditures_WFPO~",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "WFPObjectiveActivityExpenditureId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveActivityExpenditures",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveTimelines_WFPObjectiveActivities_WFPObjectiveAc~",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                column: "WFPObjectiveActivityId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_FundSources_FundSourceId",
                schema: "planning",
                table: "WFPs",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_OPCRs_OPCRId",
                schema: "planning",
                table: "WFPs",
                column: "OPCRId",
                principalSchema: "planning",
                principalTable: "OPCRs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveActivities_WFPObjectiv~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveActivityExpenditures_WFPO~",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveTimelines_WFPObjectiveActivities_WFPObjectiveAc~",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_FundSources_FundSourceId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_OPCRs_OPCRId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropTable(
                name: "WFPObjectiveActivityExpenditures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveActivities",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_FundSourceId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_OfficeId_Mode",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "ApprovedDate",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "FundSourceId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "SubmittedDate",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_OPCRId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "OPCRId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "WFPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                column: "FiscalYearId");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveActivityId",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "WFPObjectiveTargetId");

            migrationBuilder.RenameIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate_EndD~",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate_EndDate");

            migrationBuilder.RenameIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                newName: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveActivityExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "WFPObjectiveTargetExpenditureId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetDetails_WFPObjectiveActivityExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "IX_LineItemBudgetDetails_WFPObjectiveTargetExpenditureId");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                newName: "WFPObjectiveTargetId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetActivities_WFPObjectiveActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                newName: "IX_LineItemBudgetActivities_WFPObjectiveTargetId");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "planning",
                table: "WFPs",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTargets",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityName = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Indicator = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    Weight = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPObjectiveTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargets_WFPObjectives_WFPObjectiveId",
                        column: x => x.WFPObjectiveId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    CostEstimates = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPObjectiveTargetExpenditures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_WFPObjectiveTargets_WFPObjec~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "OfficeId", "FiscalYearId" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_ObjectId",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_WFPObjectiveTargetId_ObjectI~",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName_Indicator",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetActivities_WFPObjectiveTargets_WFPObjectiveTa~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                column: "WFPObjectiveTargetId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargets",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPObj~",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "WFPObjectiveTargetExpenditureId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargetExpenditures",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveTimelines_WFPObjectiveTargets_WFPObjectiveTarge~",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                column: "WFPObjectiveTargetId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id");
        }
    }
}
