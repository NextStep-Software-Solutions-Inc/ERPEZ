using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBidCriteriaAndStrategiesToAPPItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcurementStrategy",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.AlterColumn<string>(
                name: "BidEvaluationCriteria",
                schema: "planning",
                table: "APPItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcurementStrategies",
                schema: "planning",
                table: "APPItems",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcurementStrategies",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.AlterColumn<string>(
                name: "BidEvaluationCriteria",
                schema: "planning",
                table: "APPItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcurementStrategy",
                schema: "planning",
                table: "APPItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}
