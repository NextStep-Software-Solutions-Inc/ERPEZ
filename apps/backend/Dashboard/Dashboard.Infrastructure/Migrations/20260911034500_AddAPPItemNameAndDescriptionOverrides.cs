using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAPPItemNameAndDescriptionOverrides : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GeneralDescription",
                schema: "planning",
                table: "APPItems",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemNameOverride",
                schema: "planning",
                table: "APPItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GeneralDescription",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "ItemNameOverride",
                schema: "planning",
                table: "APPItems");
        }
    }
}
