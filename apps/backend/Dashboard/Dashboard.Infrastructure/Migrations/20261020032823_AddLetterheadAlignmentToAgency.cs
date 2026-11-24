using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLetterheadAlignmentToAgency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LetterheadAlignment",
                schema: "planning",
                table: "Agencies",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Default");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LetterheadAlignment",
                schema: "planning",
                table: "Agencies");
        }
    }
}
