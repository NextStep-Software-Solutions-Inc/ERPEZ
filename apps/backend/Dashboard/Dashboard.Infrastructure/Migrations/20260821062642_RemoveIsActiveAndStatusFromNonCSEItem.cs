using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIsActiveAndStatusFromNonCSEItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_IsActive",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_Name_IsActive",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_Status",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "planning",
                table: "NonCSEItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "planning",
                table: "NonCSEItems",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "planning",
                table: "NonCSEItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_IsActive",
                schema: "planning",
                table: "NonCSEItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Name_IsActive",
                schema: "planning",
                table: "NonCSEItems",
                columns: new[] { "Name", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Status",
                schema: "planning",
                table: "NonCSEItems",
                column: "Status");
        }
    }
}
