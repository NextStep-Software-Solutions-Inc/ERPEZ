using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusToBudgetCall : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "planning",
                table: "BudgetCalls",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                schema: "planning",
                table: "BudgetCalls");
        }
    }
}
