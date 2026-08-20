using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAOBSchemaAndSupplierBidRFQRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_APPItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierBidItems_APPItems_APPItemId",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierBids_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.RenameColumn(
                name: "ProcurementProjectId",
                schema: "procurement",
                table: "SupplierBids",
                newName: "RFQId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplierBids_ProcurementProjectId",
                schema: "procurement",
                table: "SupplierBids",
                newName: "IX_SupplierBids_RFQId");

            migrationBuilder.RenameColumn(
                name: "APPItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                newName: "RFQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplierBidItems_APPItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                newName: "IX_SupplierBidItems_RFQItemId");

            migrationBuilder.RenameColumn(
                name: "APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                newName: "RFQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AOBAwardedItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                newName: "IX_AOBAwardedItems_RFQItemId");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryPeriod",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTerms",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmissionType",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                schema: "procurement",
                table: "SupplierBids",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ValidityPeriodDays",
                schema: "procurement",
                table: "SupplierBids",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyTerms",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BrochureFileId",
                schema: "procurement",
                table: "SupplierBidItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisqualificationReason",
                schema: "procurement",
                table: "SupplierBidItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "QualityScore",
                schema: "procurement",
                table: "SupplierBidItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPrice",
                schema: "procurement",
                table: "SupplierBidItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                schema: "procurement",
                table: "APRs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReturnRemarks",
                schema: "procurement",
                table: "APRs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReturnedBy",
                schema: "procurement",
                table: "APRs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReturnedDate",
                schema: "procurement",
                table: "APRs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                schema: "procurement",
                table: "AOBs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedBy",
                schema: "procurement",
                table: "AOBs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                schema: "procurement",
                table: "AOBs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignedDocumentUrl",
                schema: "procurement",
                table: "AOBs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                schema: "procurement",
                table: "AOBs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubmittedBy",
                schema: "procurement",
                table: "AOBs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AwardReason",
                schema: "procurement",
                table: "AOBAwardedItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwardedQuantity",
                schema: "procurement",
                table: "AOBAwardedItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAwardedAmount",
                schema: "procurement",
                table: "AOBAwardedItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "AOBRFQMappings",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AOBId = table.Column<Guid>(type: "uuid", nullable: false),
                    RFQId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_AOBRFQMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AOBRFQMappings_AOBs_AOBId",
                        column: x => x.AOBId,
                        principalSchema: "procurement",
                        principalTable: "AOBs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AOBRFQMappings_RFQs_RFQId",
                        column: x => x.RFQId,
                        principalSchema: "procurement",
                        principalTable: "RFQs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AOBs_AOBNumber",
                schema: "procurement",
                table: "AOBs",
                column: "AOBNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBAwardedItems_PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_AOBId_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings",
                columns: new[] { "AOBId", "RFQId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings",
                column: "RFQId");

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_PurchaseOrders_PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "PurchaseOrderId",
                principalSchema: "procurement",
                principalTable: "PurchaseOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_RFQItems_RFQItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "RFQItemId",
                principalSchema: "procurement",
                principalTable: "RFQItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierBidItems_RFQItems_RFQItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                column: "RFQItemId",
                principalSchema: "procurement",
                principalTable: "RFQItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierBids_RFQs_RFQId",
                schema: "procurement",
                table: "SupplierBids",
                column: "RFQId",
                principalSchema: "procurement",
                principalTable: "RFQs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_PurchaseOrders_PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AOBAwardedItems_RFQItems_RFQItemId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierBidItems_RFQItems_RFQItemId",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierBids_RFQs_RFQId",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropTable(
                name: "AOBRFQMappings",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_AOBs_AOBNumber",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropIndex(
                name: "IX_AOBAwardedItems_PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropColumn(
                name: "DeliveryPeriod",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "PaymentTerms",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "Remarks",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "SubmissionType",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "ValidityPeriodDays",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "WarrantyTerms",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "BrochureFileId",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropColumn(
                name: "DisqualificationReason",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropColumn(
                name: "QualityScore",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropColumn(
                name: "TotalPrice",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropColumn(
                name: "ReturnRemarks",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropColumn(
                name: "ReturnedBy",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropColumn(
                name: "ReturnedDate",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "Remarks",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "SignedDocumentUrl",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "AwardReason",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropColumn(
                name: "AwardedQuantity",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropColumn(
                name: "PurchaseOrderId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropColumn(
                name: "TotalAwardedAmount",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.RenameColumn(
                name: "RFQId",
                schema: "procurement",
                table: "SupplierBids",
                newName: "ProcurementProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplierBids_RFQId",
                schema: "procurement",
                table: "SupplierBids",
                newName: "IX_SupplierBids_ProcurementProjectId");

            migrationBuilder.RenameColumn(
                name: "RFQItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                newName: "APPItemId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplierBidItems_RFQItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                newName: "IX_SupplierBidItems_APPItemId");

            migrationBuilder.RenameColumn(
                name: "RFQItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                newName: "APPItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AOBAwardedItems_RFQItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                newName: "IX_AOBAwardedItems_APPItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_AOBAwardedItems_APPItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "APPItemId",
                principalSchema: "planning",
                principalTable: "APPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierBidItems_APPItems_APPItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                column: "APPItemId",
                principalSchema: "planning",
                principalTable: "APPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierBids_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "SupplierBids",
                column: "ProcurementProjectId",
                principalSchema: "procurement",
                principalTable: "ProcurementProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
