using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeOfficeClusterIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClusterId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "planning",
                table: "Offices",
                column: "ClusterId",
                principalSchema: "planning",
                principalTable: "Clusters",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClusterId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "planning",
                table: "Offices",
                column: "ClusterId",
                principalSchema: "planning",
                principalTable: "Clusters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
