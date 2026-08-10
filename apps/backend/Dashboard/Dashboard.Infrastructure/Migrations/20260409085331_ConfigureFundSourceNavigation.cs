using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureFundSourceNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FundSources_FundSources_ParentSourceId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.DropIndex(
                name: "IX_FundSources_ParentSourceId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.DropColumn(
                name: "ParentSourceId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.AddForeignKey(
                name: "FK_FundSources_FundSources_ParentId",
                schema: "planning",
                table: "FundSources",
                column: "ParentId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FundSources_FundSources_ParentId",
                schema: "planning",
                table: "FundSources");

            migrationBuilder.AddColumn<Guid>(
                name: "ParentSourceId",
                schema: "planning",
                table: "FundSources",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundSources_ParentSourceId",
                schema: "planning",
                table: "FundSources",
                column: "ParentSourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_FundSources_FundSources_ParentSourceId",
                schema: "planning",
                table: "FundSources",
                column: "ParentSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id");
        }
    }
}
