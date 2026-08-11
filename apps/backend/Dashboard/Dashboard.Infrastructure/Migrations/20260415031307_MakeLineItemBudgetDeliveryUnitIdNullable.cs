using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeLineItemBudgetDeliveryUnitIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
