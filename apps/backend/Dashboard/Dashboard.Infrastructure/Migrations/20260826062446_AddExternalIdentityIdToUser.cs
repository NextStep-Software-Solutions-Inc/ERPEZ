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

            migrationBuilder.Sql(@"
                UPDATE planning.""Users""
                SET ""ExternalIdentityId"" = CASE
                    WHEN ""Username"" IS NOT NULL AND ""Username"" <> ''
                         AND ""Username"" NOT IN (SELECT u.""Username"" FROM planning.""Users"" u GROUP BY u.""Username"" HAVING COUNT(*) > 1)
                    THEN ""Username""
                    ELSE ""Id""::text
                END
                WHERE ""ExternalIdentityId"" = '' OR ""ExternalIdentityId"" IS NULL;
            ");

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
        }
    }
}
