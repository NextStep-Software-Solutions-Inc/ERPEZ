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

            migrationBuilder.AddColumn<string>(
                name: "ContractNo",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryPeriodDays",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NonRefundableBidderFee",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScopeOfWork",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SystemRole",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "integer",
                nullable: true);

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

            migrationBuilder.CreateTable(
                name: "BiddingDocument",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PostedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PostedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BiddingDocument", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingDocument_ProcurementCategories_ProcurementCategoryId",
                        column: x => x.ProcurementCategoryId,
                        principalSchema: "planning",
                        principalTable: "ProcurementCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BiddingDocument_ProcurementProjects_ProcurementProjectId",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PublicSupplierApplications",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false),
                    ContactPerson = table.Column<string>(type: "text", nullable: false),
                    EmailAddress = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    TinNumber = table.Column<string>(type: "text", nullable: false),
                    BusinessAddress = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicSupplierApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublicSupplierApplications_ProcurementProjects_ProcurementP~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationUploadedDocuments",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChecklistItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    BlobStorageUrl = table.Column<string>(type: "text", nullable: false),
                    OriginalFileName = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUploadedDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationUploadedDocuments_ProjectDocumentChecklists_Chec~",
                        column: x => x.ChecklistItemId,
                        principalSchema: "procurement",
                        principalTable: "ProjectDocumentChecklists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationUploadedDocuments_PublicSupplierApplications_App~",
                        column: x => x.ApplicationId,
                        principalSchema: "procurement",
                        principalTable: "PublicSupplierApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUploadedDocuments_ApplicationId",
                schema: "procurement",
                table: "ApplicationUploadedDocuments",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUploadedDocuments_ChecklistItemId",
                schema: "procurement",
                table: "ApplicationUploadedDocuments",
                column: "ChecklistItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingDocument_ProcurementCategoryId",
                schema: "procurement",
                table: "BiddingDocument",
                column: "ProcurementCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingDocument_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingDocument",
                column: "ProcurementProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicSupplierApplications_ProcurementProjectId",
                schema: "procurement",
                table: "PublicSupplierApplications",
                column: "ProcurementProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_ProcurementModes_ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropTable(
                name: "ApplicationUploadedDocuments",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BiddingDocument",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PublicSupplierApplications",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "ContractNo",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "DeliveryPeriodDays",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "NonRefundableBidderFee",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "ProcurementModeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "ScopeOfWork",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "SystemRole",
                schema: "planning",
                table: "ProcurementActivityTypes");

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
