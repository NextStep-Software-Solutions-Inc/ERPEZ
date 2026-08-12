using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAPPItemEPARemarksAndBudgetOverride : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EPARemarks",
                schema: "planning",
                table: "APPItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedBudgetOverride",
                schema: "planning",
                table: "APPItems",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EPARemarks",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "EstimatedBudgetOverride",
                schema: "planning",
                table: "APPItems");
        }
    }
}
