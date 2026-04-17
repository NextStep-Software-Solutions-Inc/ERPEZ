using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorPPMPItemAndNonCSEItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_PPMPId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "IsNonCSE",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "Unit",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.AlterColumn<List<string>>(
                name: "PAPCode",
                schema: "planning",
                table: "PPMPItems",
                type: "text[]",
                nullable: true,
                oldClrType: typeof(List<string>),
                oldType: "text[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<string>>(
                name: "PAPCode",
                schema: "planning",
                table: "PPMPItems",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNonCSE",
                schema: "planning",
                table: "PPMPItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                schema: "planning",
                table: "NonCSEItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_PPMPId",
                schema: "planning",
                table: "PPMPItems",
                column: "PPMPId");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPItems",
                column: "PPMPId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
