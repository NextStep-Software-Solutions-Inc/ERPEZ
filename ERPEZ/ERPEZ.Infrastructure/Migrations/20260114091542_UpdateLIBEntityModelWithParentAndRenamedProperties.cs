using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLIBEntityModelWithParentAndRenamedProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPExp~",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_LIBId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropColumn(
                name: "LIBId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.RenameColumn(
                name: "WFPExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "WFPObjectiveTargetExpenditureId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetDetails_WFPExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "IX_LineItemBudgetDetails_WFPObjectiveTargetExpenditureId");

            migrationBuilder.AlterColumn<Guid>(
                name: "SourceId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ParentLIBId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPObj~",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "WFPObjectiveTargetExpenditureId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargetExpenditures",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ParentLIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPObj~",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.RenameColumn(
                name: "WFPObjectiveTargetExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "WFPExpenditureId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgetDetails_WFPObjectiveTargetExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                newName: "IX_LineItemBudgetDetails_WFPExpenditureId");

            migrationBuilder.AlterColumn<Guid>(
                name: "SourceId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LIBId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_LIBId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "LIBId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPExp~",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "WFPExpenditureId",
                principalSchema: "planning",
                principalTable: "WFPObjectiveTargetExpenditures",
                principalColumn: "Id");
        }
    }
}
