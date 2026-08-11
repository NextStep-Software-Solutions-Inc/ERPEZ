using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAgencyMasterBudgetIdToLineItemBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "AgencyMasterBudgetId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_AgencyMasterBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "AgencyMasterBudgetId",
                principalSchema: "planning",
                principalTable: "AgencyMasterBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_AgencyMasterBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");
        }
    }
}
