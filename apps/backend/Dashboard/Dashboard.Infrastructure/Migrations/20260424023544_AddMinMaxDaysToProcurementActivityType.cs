using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMinMaxDaysToProcurementActivityType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxDays",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinDays",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "MaxDays",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "MinDays",
                schema: "planning",
                table: "ProcurementActivityTypes");
        }
    }
}
