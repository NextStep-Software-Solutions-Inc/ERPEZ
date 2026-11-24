using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangePPMPItemCSEItemFKToProcurementItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_ProcurementItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId",
                principalSchema: "planning",
                principalTable: "ProcurementItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_ProcurementItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId",
                principalSchema: "planning",
                principalTable: "CSEItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
