using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FilteredIndexForLIBNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets",
                column: "LIBNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_OPCRActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "LineItemBudgetId", "OPCRActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"OPCRActivityId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_WFPObjectiveActiv~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "LineItemBudgetId", "WFPObjectiveActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"WFPObjectiveActivityId\" IS NOT NULL");

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
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_OPCRActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_WFPObjectiveActiv~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets",
                column: "LIBNumber",
                unique: true);

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
