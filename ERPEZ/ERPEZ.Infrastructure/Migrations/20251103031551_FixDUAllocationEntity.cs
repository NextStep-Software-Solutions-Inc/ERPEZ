using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDUAllocationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.AlterColumn<Guid>(
                name: "ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                column: "ReceivedFundId",
                principalSchema: "catalog",
                principalTable: "ReceivedFunds",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.AlterColumn<Guid>(
                name: "ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                column: "ReceivedFundId",
                principalSchema: "catalog",
                principalTable: "ReceivedFunds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
