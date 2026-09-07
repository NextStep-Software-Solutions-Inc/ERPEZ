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
                nullable: true);

            migrationBuilder.Sql("UPDATE planning.\"Users\" SET \"ExternalIdentityId\" = \"Id\"::text WHERE \"ExternalIdentityId\" = '' OR \"ExternalIdentityId\" IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalIdentityId",
                schema: "planning",
                table: "Users",
                column: "ExternalIdentityId",
                unique: true,
                filter: "\"ExternalIdentityId\" IS NOT NULL");
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
        }
    }
}
