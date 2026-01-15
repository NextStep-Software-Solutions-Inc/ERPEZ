using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceParentLIBIdWithIsConsolidatedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<bool>(
                name: "IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets",
                column: "IsConsolidated");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets");

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
                name: "FK_LineItemBudgets_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ParentLIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
