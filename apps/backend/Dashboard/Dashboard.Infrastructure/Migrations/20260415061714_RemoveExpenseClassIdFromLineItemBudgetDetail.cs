using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveExpenseClassIdFromLineItemBudgetDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_ExpenseClasses_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropColumn(
                name: "ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "ExpenseClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_ExpenseClasses_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "ExpenseClassId",
                principalSchema: "planning",
                principalTable: "ExpenseClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
