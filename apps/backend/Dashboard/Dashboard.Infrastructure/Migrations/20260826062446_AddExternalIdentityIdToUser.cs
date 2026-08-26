using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalIdentityIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalIdentityId",
                schema: "planning",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "EvaluatedAt",
                schema: "procurement",
                table: "PublicSupplierApplications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EvaluatedBy",
                schema: "procurement",
                table: "PublicSupplierApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                schema: "procurement",
                table: "PublicSupplierApplications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalIdentityId",
                schema: "planning",
                table: "Users",
                column: "ExternalIdentityId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_ExternalIdentityId",
                schema: "planning",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExternalIdentityId",
                schema: "planning",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EvaluatedAt",
                schema: "procurement",
                table: "PublicSupplierApplications");

            migrationBuilder.DropColumn(
                name: "EvaluatedBy",
                schema: "procurement",
                table: "PublicSupplierApplications");

            migrationBuilder.DropColumn(
                name: "Remarks",
                schema: "procurement",
                table: "PublicSupplierApplications");
        }
    }
}
