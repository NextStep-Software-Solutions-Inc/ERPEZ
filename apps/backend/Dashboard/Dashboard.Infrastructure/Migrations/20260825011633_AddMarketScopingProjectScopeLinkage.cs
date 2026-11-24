using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketScopingProjectScopeLinkage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.AddColumn<Guid>(
                name: "TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                unique: true,
                filter: "\"TargetLineItemBudgetActivityId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetId",
                unique: true,
                filter: "\"TargetLineItemBudgetId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.AddCheckConstraint(
                name: "CK_MarketScoping_SingleTarget",
                schema: "planning",
                table: "MarketScopings",
                sql: "\"TargetLineItemBudgetId\" IS NULL OR \"TargetLineItemBudgetActivityId\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgets_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgets_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_MarketScoping_SingleTarget",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropColumn(
                name: "TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id");
        }
    }
}
