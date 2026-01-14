using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add16NewERDEntitiesInPlanningSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "ProcurementModes",
                schema: "procurement",
                newName: "ProcurementModes",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "ProcurementActivityTypes",
                schema: "procurement",
                newName: "ProcurementActivityTypes",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "PPMPs",
                schema: "budget",
                newName: "PPMPs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "PPMPItems",
                schema: "other",
                newName: "PPMPItems",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "PPMPItemAllocations",
                schema: "other",
                newName: "PPMPItemAllocations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRActivityRatings",
                schema: "performance",
                newName: "OPCRActivityRatings",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRActivityMOVs",
                schema: "performance",
                newName: "OPCRActivityMOVs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRActivityEvaluations",
                schema: "performance",
                newName: "OPCRActivityEvaluations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "NonCSEItems",
                schema: "procurement",
                newName: "NonCSEItems",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "LineItemBudgets",
                schema: "budget",
                newName: "LineItemBudgets",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "LineItemBudgetDetails",
                schema: "budget",
                newName: "LineItemBudgetDetails",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "LineItemBudgetActivities",
                schema: "budget",
                newName: "LineItemBudgetActivities",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "CSEItems",
                schema: "procurement",
                newName: "CSEItems",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "APPs",
                schema: "budget",
                newName: "APPs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "APPProcurementSchedules",
                schema: "other",
                newName: "APPProcurementSchedules",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "APPItems",
                schema: "other",
                newName: "APPItems",
                newSchema: "planning");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "other");

            migrationBuilder.EnsureSchema(
                name: "budget");

            migrationBuilder.EnsureSchema(
                name: "procurement");

            migrationBuilder.EnsureSchema(
                name: "performance");

            migrationBuilder.RenameTable(
                name: "ProcurementModes",
                schema: "planning",
                newName: "ProcurementModes",
                newSchema: "procurement");

            migrationBuilder.RenameTable(
                name: "ProcurementActivityTypes",
                schema: "planning",
                newName: "ProcurementActivityTypes",
                newSchema: "procurement");

            migrationBuilder.RenameTable(
                name: "PPMPs",
                schema: "planning",
                newName: "PPMPs",
                newSchema: "budget");

            migrationBuilder.RenameTable(
                name: "PPMPItems",
                schema: "planning",
                newName: "PPMPItems",
                newSchema: "other");

            migrationBuilder.RenameTable(
                name: "PPMPItemAllocations",
                schema: "planning",
                newName: "PPMPItemAllocations",
                newSchema: "other");

            migrationBuilder.RenameTable(
                name: "OPCRActivityRatings",
                schema: "planning",
                newName: "OPCRActivityRatings",
                newSchema: "performance");

            migrationBuilder.RenameTable(
                name: "OPCRActivityMOVs",
                schema: "planning",
                newName: "OPCRActivityMOVs",
                newSchema: "performance");

            migrationBuilder.RenameTable(
                name: "OPCRActivityEvaluations",
                schema: "planning",
                newName: "OPCRActivityEvaluations",
                newSchema: "performance");

            migrationBuilder.RenameTable(
                name: "NonCSEItems",
                schema: "planning",
                newName: "NonCSEItems",
                newSchema: "procurement");

            migrationBuilder.RenameTable(
                name: "LineItemBudgets",
                schema: "planning",
                newName: "LineItemBudgets",
                newSchema: "budget");

            migrationBuilder.RenameTable(
                name: "LineItemBudgetDetails",
                schema: "planning",
                newName: "LineItemBudgetDetails",
                newSchema: "budget");

            migrationBuilder.RenameTable(
                name: "LineItemBudgetActivities",
                schema: "planning",
                newName: "LineItemBudgetActivities",
                newSchema: "budget");

            migrationBuilder.RenameTable(
                name: "CSEItems",
                schema: "planning",
                newName: "CSEItems",
                newSchema: "procurement");

            migrationBuilder.RenameTable(
                name: "APPs",
                schema: "planning",
                newName: "APPs",
                newSchema: "budget");

            migrationBuilder.RenameTable(
                name: "APPProcurementSchedules",
                schema: "planning",
                newName: "APPProcurementSchedules",
                newSchema: "other");

            migrationBuilder.RenameTable(
                name: "APPItems",
                schema: "planning",
                newName: "APPItems",
                newSchema: "other");
        }
    }
}
