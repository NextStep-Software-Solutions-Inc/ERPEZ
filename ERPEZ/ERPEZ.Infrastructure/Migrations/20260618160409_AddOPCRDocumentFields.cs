using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOPCRDocumentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommitmentPersonName",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitmentPersonPosition",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Q4Target",
                schema: "planning",
                table: "OPCRItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "Q3Target",
                schema: "planning",
                table: "OPCRItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "Q2Target",
                schema: "planning",
                table: "OPCRItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "Q1Target",
                schema: "planning",
                table: "OPCRItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "GadMeasure",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GadMeasure",
                schema: "planning",
                table: "FYActiveKPIs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommitmentPersonName",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "CommitmentPersonPosition",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "GadMeasure",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "GadMeasure",
                schema: "planning",
                table: "FYActiveKPIs");

            migrationBuilder.AlterColumn<int>(
                name: "Q4Target",
                schema: "planning",
                table: "OPCRItems",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<int>(
                name: "Q3Target",
                schema: "planning",
                table: "OPCRItems",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<int>(
                name: "Q2Target",
                schema: "planning",
                table: "OPCRItems",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<int>(
                name: "Q1Target",
                schema: "planning",
                table: "OPCRItems",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");
        }
    }
}
