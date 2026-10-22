using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementProjectRepresentativesAndApprovalAttachmentFileId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApprovalAttachmentFileId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            /*
            migrationBuilder.AddColumn<Guid>(
                name: "AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);
            */

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "EndUserRepresentativeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "TechRepresentativeId");

            /*
            migrationBuilder.CreateIndex(
                name: "IX_PRItems_APRItemId",
                schema: "procurement",
                table: "PRItems",
                column: "APRItemId");
            */

            /*
            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "AgencyMasterBudgetId");
            */

            /*
            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_AgencyMasterBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "AgencyMasterBudgetId",
                principalSchema: "planning",
                principalTable: "AgencyMasterBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems",
                column: "APRItemId",
                principalSchema: "procurement",
                principalTable: "APRItems",
                principalColumn: "Id");
            */

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_Users_EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "EndUserRepresentativeId",
                principalSchema: "planning",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_Users_TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "TechRepresentativeId",
                principalSchema: "planning",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            /*
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_AgencyMasterBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_PRItems_APRItems_APRItemId",
                schema: "procurement",
                table: "PRItems");
            */

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_Users_EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_Users_TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            /*
            migrationBuilder.DropIndex(
                name: "IX_PRItems_APRItemId",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");
            */

            migrationBuilder.DropColumn(
                name: "ApprovalAttachmentFileId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "EndUserRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "TechRepresentativeId",
                schema: "procurement",
                table: "ProcurementProjects");

            /*
            migrationBuilder.DropColumn(
                name: "AgencyMasterBudgetId",
                schema: "planning",
                table: "LineItemBudgets");
            */
        }
    }
}
