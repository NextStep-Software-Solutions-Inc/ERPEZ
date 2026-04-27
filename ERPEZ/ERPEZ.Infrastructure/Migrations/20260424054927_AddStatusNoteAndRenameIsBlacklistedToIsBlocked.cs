using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusNoteAndRenameIsBlacklistedToIsBlocked : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsBlacklisted",
                schema: "planning",
                table: "Suppliers",
                newName: "IsBlocked");

            migrationBuilder.AddColumn<string>(
                name: "StatusNote",
                schema: "planning",
                table: "Suppliers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusNote",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.RenameColumn(
                name: "IsBlocked",
                schema: "planning",
                table: "Suppliers",
                newName: "IsBlacklisted");
        }
    }
}
