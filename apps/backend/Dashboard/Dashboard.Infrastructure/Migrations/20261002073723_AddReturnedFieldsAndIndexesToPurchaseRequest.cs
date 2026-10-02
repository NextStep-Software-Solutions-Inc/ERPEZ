using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReturnedFieldsAndIndexesToPurchaseRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.AddColumn<string>(
                name: "ReturnRemarks",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReturnedBy",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReturnedDate",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_OfficeId_PRType_Status",
                schema: "procurement",
                table: "PurchaseRequests",
                columns: new[] { "OfficeId", "PRType", "Status" },
                filter: "\"IsDeleted\" = false");

            migrationBuilder.AddForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems",
                column: "APRItemId",
                principalSchema: "procurement",
                principalTable: "APRItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_OfficeId_PRType_Status",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "ReturnRemarks",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "ReturnedBy",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "ReturnedDate",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.AddForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems",
                column: "APRItemId",
                principalSchema: "procurement",
                principalTable: "APRItems",
                principalColumn: "Id");
        }
    }
}
