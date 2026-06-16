using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDeliveryUnitIdLIB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.RenameColumn(
                name: "FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                newName: "FundSourceId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgets_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                newName: "IX_LineItemBudgets_FundSourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundSourceId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundSourceId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.RenameColumn(
                name: "FundSourceId",
                schema: "planning",
                table: "LineItemBudgets",
                newName: "FundClusterId");

            migrationBuilder.RenameIndex(
                name: "IX_LineItemBudgets_FundSourceId",
                schema: "planning",
                table: "LineItemBudgets",
                newName: "IX_LineItemBudgets_FundClusterId");

            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "DeliveryUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FundClusterId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
