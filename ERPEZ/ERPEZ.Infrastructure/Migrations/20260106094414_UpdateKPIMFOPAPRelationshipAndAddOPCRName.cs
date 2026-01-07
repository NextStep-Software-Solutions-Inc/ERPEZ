using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateKPIMFOPAPRelationshipAndAddOPCRName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the many-to-many junction table
            migrationBuilder.DropTable(
                name: "KPIMFOPAP",
                schema: "planning");

            // Add MFOPAPId column to KPIs table
            migrationBuilder.AddColumn<Guid>(
                name: "MFOPAPId",
                schema: "planning",
                table: "KPIs",
                type: "uuid",
                nullable: true);

            // Add OPCRName column to KPIs table
            migrationBuilder.AddColumn<string>(
                name: "OPCRName",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: true);

            // Create index on MFOPAPId foreign key
            migrationBuilder.CreateIndex(
                name: "IX_KPIs_MFOPAPId",
                schema: "planning",
                table: "KPIs",
                column: "MFOPAPId");

            // Add foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_KPIs_MFOPAPs_MFOPAPId",
                schema: "planning",
                table: "KPIs",
                column: "MFOPAPId",
                principalSchema: "planning",
                principalTable: "MFOPAPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_KPIs_MFOPAPs_MFOPAPId",
                schema: "planning",
                table: "KPIs");

            // Drop the index
            migrationBuilder.DropIndex(
                name: "IX_KPIs_MFOPAPId",
                schema: "planning",
                table: "KPIs");

            // Drop OPCRName column
            migrationBuilder.DropColumn(
                name: "OPCRName",
                schema: "planning",
                table: "KPIs");

            // Drop MFOPAPId column
            migrationBuilder.DropColumn(
                name: "MFOPAPId",
                schema: "planning",
                table: "KPIs");

            // Recreate the many-to-many junction table
            migrationBuilder.CreateTable(
                name: "KPIMFOPAP",
                schema: "planning",
                columns: table => new
                {
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false),
                    MFOPAPsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPIMFOPAP", x => new { x.KPIsId, x.MFOPAPsId });
                    table.ForeignKey(
                        name: "FK_KPIMFOPAP_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIMFOPAP_MFOPAPs_MFOPAPsId",
                        column: x => x.MFOPAPsId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KPIMFOPAP_MFOPAPsId",
                schema: "planning",
                table: "KPIMFOPAP",
                column: "MFOPAPsId");
        }
    }
}
