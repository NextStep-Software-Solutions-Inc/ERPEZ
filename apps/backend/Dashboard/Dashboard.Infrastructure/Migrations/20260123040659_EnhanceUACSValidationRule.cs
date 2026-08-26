using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceUACSValidationRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Condition",
                schema: "planning",
                table: "UACSValidationRules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FundSourceId",
                schema: "planning",
                table: "UACSValidationRules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LocationId",
                schema: "planning",
                table: "UACSValidationRules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ObjectId",
                schema: "planning",
                table: "UACSValidationRules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RuleType",
                schema: "planning",
                table: "UACSValidationRules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UACSValidationRules_FundSourceId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSValidationRules_LocationId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSValidationRules_ObjectId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "ObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_UACSValidationRules_FundSources_FundSourceId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UACSValidationRules_Locations_LocationId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "LocationId",
                principalSchema: "planning",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UACSValidationRules_Objects_ObjectId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "ObjectId",
                principalSchema: "planning",
                principalTable: "Objects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UACSValidationRules_FundSources_FundSourceId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropForeignKey(
                name: "FK_UACSValidationRules_Locations_LocationId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropForeignKey(
                name: "FK_UACSValidationRules_Objects_ObjectId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropIndex(
                name: "IX_UACSValidationRules_FundSourceId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropIndex(
                name: "IX_UACSValidationRules_LocationId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropIndex(
                name: "IX_UACSValidationRules_ObjectId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropColumn(
                name: "Condition",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropColumn(
                name: "FundSourceId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropColumn(
                name: "LocationId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                schema: "planning",
                table: "UACSValidationRules");

            migrationBuilder.DropColumn(
                name: "RuleType",
                schema: "planning",
                table: "UACSValidationRules");
        }
    }
}
