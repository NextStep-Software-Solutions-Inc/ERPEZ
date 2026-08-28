using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDirectAcquisitionDomainEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DirectAcquisitions",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DANumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ConsolidatedPRId = table.Column<Guid>(type: "uuid", nullable: false),
                    BACProjectId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalABC = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedFileId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_DirectAcquisitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectAcquisitions_ConsolidatedPRs_ConsolidatedPRId",
                        column: x => x.ConsolidatedPRId,
                        principalSchema: "procurement",
                        principalTable: "ConsolidatedPRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectAcquisitions_ProcurementProjects_BACProjectId",
                        column: x => x.BACProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DirectPurchaseEntries",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DirectAcquisitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: true),
                    SupplierName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SupplierTIN = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FinalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PayeeUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    PayeeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_DirectPurchaseEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectPurchaseEntries_DirectAcquisitions_DirectAcquisitionId",
                        column: x => x.DirectAcquisitionId,
                        principalSchema: "procurement",
                        principalTable: "DirectAcquisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DirectPurchaseEntries_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DirectPurchaseEntries_Users_PayeeUserId",
                        column: x => x.PayeeUserId,
                        principalSchema: "planning",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DirectAcquisitionDocuments",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DirectAcquisitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    DirectPurchaseEntryId = table.Column<Guid>(type: "uuid", nullable: true),
                    FileId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BlobUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_DirectAcquisitionDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectAcquisitionDocuments_DirectAcquisitions_DirectAcquisitionId",
                        column: x => x.DirectAcquisitionId,
                        principalSchema: "procurement",
                        principalTable: "DirectAcquisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DirectAcquisitionDocuments_DirectPurchaseEntries_DirectPurchaseEntryId",
                        column: x => x.DirectPurchaseEntryId,
                        principalSchema: "procurement",
                        principalTable: "DirectPurchaseEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitionDocuments_DirectAcquisitionId",
                schema: "procurement",
                table: "DirectAcquisitionDocuments",
                column: "DirectAcquisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitionDocuments_DirectPurchaseEntryId",
                schema: "procurement",
                table: "DirectAcquisitionDocuments",
                column: "DirectPurchaseEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_BACProjectId",
                schema: "procurement",
                table: "DirectAcquisitions",
                column: "BACProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_ConsolidatedPRId",
                schema: "procurement",
                table: "DirectAcquisitions",
                column: "ConsolidatedPRId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_DANumber",
                schema: "procurement",
                table: "DirectAcquisitions",
                column: "DANumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectPurchaseEntries_DirectAcquisitionId",
                schema: "procurement",
                table: "DirectPurchaseEntries",
                column: "DirectAcquisitionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectPurchaseEntries_PayeeUserId",
                schema: "procurement",
                table: "DirectPurchaseEntries",
                column: "PayeeUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectPurchaseEntries_SupplierId",
                schema: "procurement",
                table: "DirectPurchaseEntries",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectAcquisitionDocuments",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "DirectPurchaseEntries",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "DirectAcquisitions",
                schema: "procurement");
        }
    }
}
