using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFundClusterToFundSourceInPurchaseRequestEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequests_FundSources_FundClusterId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.RenameColumn(
                name: "FundClusterId",
                schema: "procurement",
                table: "PurchaseRequests",
                newName: "FundSourceId");

            migrationBuilder.RenameIndex(
                name: "IX_PurchaseRequests_FundClusterId",
                schema: "procurement",
                table: "PurchaseRequests",
                newName: "IX_PurchaseRequests_FundSourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequests_FundSources_FundSourceId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequests_FundSources_FundSourceId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.RenameColumn(
                name: "FundSourceId",
                schema: "procurement",
                table: "PurchaseRequests",
                newName: "FundClusterId");

            migrationBuilder.RenameIndex(
                name: "IX_PurchaseRequests_FundSourceId",
                schema: "procurement",
                table: "PurchaseRequests",
                newName: "IX_PurchaseRequests_FundClusterId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequests_FundSources_FundClusterId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "FundClusterId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
