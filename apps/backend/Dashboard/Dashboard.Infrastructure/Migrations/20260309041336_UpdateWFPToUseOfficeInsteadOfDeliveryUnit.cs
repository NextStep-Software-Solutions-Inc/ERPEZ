using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWFPToUseOfficeInsteadOfDeliveryUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.RenameColumn(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "WFPs",
                newName: "OfficeId");

            migrationBuilder.RenameIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                newName: "IX_WFPs_OfficeId_FiscalYearId");

            migrationBuilder.AddColumn<string>(
                name: "Mode",
                schema: "planning",
                table: "WFPs",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_Offices_OfficeId",
                schema: "planning",
                table: "WFPs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_Offices_OfficeId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "Mode",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.RenameColumn(
                name: "OfficeId",
                schema: "planning",
                table: "WFPs",
                newName: "DeliveryUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_WFPs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                newName: "IX_WFPs_DeliveryUnitId_FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPs",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
