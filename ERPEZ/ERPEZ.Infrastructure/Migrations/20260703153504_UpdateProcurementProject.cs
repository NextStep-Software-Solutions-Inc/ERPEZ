using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProcurementProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
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
                name: "FK_ProcurementProjects_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects");
        }
    }
}
