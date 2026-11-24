using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementalPPMPFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PPMPType",
                schema: "planning",
                table: "PPMPs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Original");

            migrationBuilder.AddColumn<Guid>(
                name: "SourcePPMPId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SupplementalNumber",
                schema: "planning",
                table: "PPMPs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_SourcePPMPId",
                schema: "planning",
                table: "PPMPs",
                column: "SourcePPMPId");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_PPMPs_SourcePPMPId",
                schema: "planning",
                table: "PPMPs",
                column: "SourcePPMPId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_PPMPs_SourcePPMPId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_SourcePPMPId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "PPMPType",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "SourcePPMPId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "SupplementalNumber",
                schema: "planning",
                table: "PPMPs");
        }
    }
}
