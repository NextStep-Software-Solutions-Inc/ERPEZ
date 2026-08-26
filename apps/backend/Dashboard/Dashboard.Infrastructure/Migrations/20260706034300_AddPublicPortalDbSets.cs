using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicPortalDbSets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects");



            migrationBuilder.AddColumn<DateTime>(
                name: "AdjustedAt",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AdjustedByUserId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdjustmentReason",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalEndDate",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalStartDate",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "timestamp with time zone",
                nullable: true);


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.DropColumn(
                name: "AdjustedAt",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "AdjustedByUserId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "AdjustmentReason",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "OriginalEndDate",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "OriginalStartDate",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ConsolidatedPRs_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ConsolidatedPRId",
                principalSchema: "procurement",
                principalTable: "ConsolidatedPRs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
