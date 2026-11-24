using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSupplierRequirementUrlCasing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "URL",
                schema: "planning",
                table: "SupplierRequirements",
                newName: "Url");

            migrationBuilder.AlterColumn<string>(
                name: "Url",
                schema: "planning",
                table: "SupplierRequirements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                schema: "planning",
                table: "SupplierRequirements",
                newName: "URL");

            migrationBuilder.AlterColumn<string>(
                name: "URL",
                schema: "planning",
                table: "SupplierRequirements",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
