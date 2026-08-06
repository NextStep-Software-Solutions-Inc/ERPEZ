using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePPMPExpenditureItemAddLIBDetailAndPPMPLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "PPMPActivityId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "LineItemBudgetDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "PPMPId");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPExpenditureItems_LineItemBudgetDetails_LineItemBudgetDe~",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "LineItemBudgetDetailId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPExpenditureItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "PPMPId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPExpenditureItems_LineItemBudgetDetails_LineItemBudgetDe~",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPExpenditureItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPExpenditureItems_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPExpenditureItems_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropColumn(
                name: "LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropColumn(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "PPMPActivityId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
