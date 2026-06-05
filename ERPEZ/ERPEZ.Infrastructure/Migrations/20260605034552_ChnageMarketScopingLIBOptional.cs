using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChnageMarketScopingLIBOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.AlterColumn<decimal>(
                name: "MinValue",
                schema: "planning",
                table: "RatingScaleLevels",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxValue",
                schema: "planning",
                table: "RatingScaleLevels",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AlterColumn<Guid>(
                name: "TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.AlterColumn<decimal>(
                name: "MinValue",
                schema: "planning",
                table: "RatingScaleLevels",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxValue",
                schema: "planning",
                table: "RatingScaleLevels",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
