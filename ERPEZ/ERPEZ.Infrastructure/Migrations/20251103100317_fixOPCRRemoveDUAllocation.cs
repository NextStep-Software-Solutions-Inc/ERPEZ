using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fixOPCRRemoveDUAllocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DUAllocationId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "DUAllocationId",
                schema: "catalog",
                table: "OPCRs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                column: "DUAllocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
