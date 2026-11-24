using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDirectContractingLinkToBACProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DirectContractings_BACResolutions_BACResolutionId",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.RenameColumn(
                name: "BACResolutionId",
                schema: "procurement",
                table: "DirectContractings",
                newName: "BACProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_DirectContractings_BACResolutionId",
                schema: "procurement",
                table: "DirectContractings",
                newName: "IX_DirectContractings_BACProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_DirectContractings_ProcurementProjects_BACProjectId",
                schema: "procurement",
                table: "DirectContractings",
                column: "BACProjectId",
                principalSchema: "procurement",
                principalTable: "ProcurementProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DirectContractings_ProcurementProjects_BACProjectId",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.RenameColumn(
                name: "BACProjectId",
                schema: "procurement",
                table: "DirectContractings",
                newName: "BACResolutionId");

            migrationBuilder.RenameIndex(
                name: "IX_DirectContractings_BACProjectId",
                schema: "procurement",
                table: "DirectContractings",
                newName: "IX_DirectContractings_BACResolutionId");

            migrationBuilder.AddForeignKey(
                name: "FK_DirectContractings_BACResolutions_BACResolutionId",
                schema: "procurement",
                table: "DirectContractings",
                column: "BACResolutionId",
                principalSchema: "procurement",
                principalTable: "BACResolutions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
