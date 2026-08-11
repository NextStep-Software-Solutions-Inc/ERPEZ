using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConsolidatedPRIdToRFQ : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs",
                column: "ConsolidatedPRId");

            migrationBuilder.AddForeignKey(
                name: "FK_RFQs_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs",
                column: "ConsolidatedPRId",
                principalSchema: "procurement",
                principalTable: "ConsolidatedPRs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RFQs_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropColumn(
                name: "ConsolidatedPRId",
                schema: "procurement",
                table: "RFQs");
        }
    }
}
