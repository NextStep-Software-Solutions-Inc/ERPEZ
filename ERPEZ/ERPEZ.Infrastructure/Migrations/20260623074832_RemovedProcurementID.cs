using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedProcurementID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ModeOfProcurementId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ModeOfProcurementId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ModeOfProcurementId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
