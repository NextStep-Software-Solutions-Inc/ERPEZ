using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateKPIMeasurementSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIMeasurements_Dimension",
                schema: "planning",
                table: "KPIMeasurements");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIMeasurements_Dimension",
                schema: "planning",
                table: "FYActiveKPIMeasurements");

            migrationBuilder.DropColumn(
                name: "Dimension",
                schema: "planning",
                table: "KPIMeasurements");

            migrationBuilder.DropColumn(
                name: "Dimension",
                schema: "planning",
                table: "FYActiveKPIMeasurements");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "planning",
                table: "KPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Statement",
                schema: "planning",
                table: "KPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "Dimensions",
                schema: "planning",
                table: "KPIMeasurements",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Statement",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "Dimensions",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_Name",
                schema: "planning",
                table: "KPIMeasurements",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_Name",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIMeasurements_Name",
                schema: "planning",
                table: "KPIMeasurements");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIMeasurements_Name",
                schema: "planning",
                table: "FYActiveKPIMeasurements");

            migrationBuilder.DropColumn(name: "Name", schema: "planning", table: "KPIMeasurements");
            migrationBuilder.DropColumn(name: "Statement", schema: "planning", table: "KPIMeasurements");
            migrationBuilder.DropColumn(name: "Dimensions", schema: "planning", table: "KPIMeasurements");
            migrationBuilder.DropColumn(name: "Name", schema: "planning", table: "FYActiveKPIMeasurements");
            migrationBuilder.DropColumn(name: "Statement", schema: "planning", table: "FYActiveKPIMeasurements");
            migrationBuilder.DropColumn(name: "Dimensions", schema: "planning", table: "FYActiveKPIMeasurements");

            migrationBuilder.AddColumn<string>(
                name: "Dimension",
                schema: "planning",
                table: "KPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Dimension",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_Dimension",
                schema: "planning",
                table: "KPIMeasurements",
                column: "Dimension");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_Dimension",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                column: "Dimension");
        }
    }
}
