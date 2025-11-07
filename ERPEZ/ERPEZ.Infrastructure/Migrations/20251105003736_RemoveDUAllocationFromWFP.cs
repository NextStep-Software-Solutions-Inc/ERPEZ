using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDUAllocationFromWFP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DUAllocationId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "DUAllocationId",
                schema: "catalog",
                table: "WFPs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                column: "DUAllocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
