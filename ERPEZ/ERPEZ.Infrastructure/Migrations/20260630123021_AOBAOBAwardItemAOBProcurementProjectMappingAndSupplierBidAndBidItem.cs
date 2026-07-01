using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AOBAOBAwardItemAOBProcurementProjectMappingAndSupplierBidAndBidItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AOBs",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AOBNumber = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    AwardCriterion = table.Column<string>(type: "text", nullable: false),
                    AOBDate = table.Column<DateOnly>(type: "date", nullable: false),
                    OpeningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_AOBs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupplierBids",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_SupplierBids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierBids_ProcurementProjects_ProcurementProjectId",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplierBids_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AOBAwardedItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AOBId = table.Column<Guid>(type: "uuid", nullable: false),
                    APPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    WinningSupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    AwardedUnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Score = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
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
                    table.PrimaryKey("PK_AOBAwardedItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AOBAwardedItems_AOBs_AOBId",
                        column: x => x.AOBId,
                        principalSchema: "procurement",
                        principalTable: "AOBs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AOBAwardedItems_APPItems_APPItemId",
                        column: x => x.APPItemId,
                        principalSchema: "planning",
                        principalTable: "APPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AOBAwardedItems_Suppliers_WinningSupplierId",
                        column: x => x.WinningSupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AOBProcurementProjectMappings",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AOBId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_AOBProcurementProjectMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AOBProcurementProjectMappings_AOBs_AOBId",
                        column: x => x.AOBId,
                        principalSchema: "procurement",
                        principalTable: "AOBs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AOBProcurementProjectMappings_ProcurementProjects_Procureme~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierBidItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierBidId = table.Column<Guid>(type: "uuid", nullable: false),
                    APPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    BrochureFileUrl = table.Column<string>(type: "text", nullable: true),
                    Brand = table.Column<string>(type: "text", nullable: true),
                    Model = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    IsResponsive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_SupplierBidItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierBidItems_APPItems_APPItemId",
                        column: x => x.APPItemId,
                        principalSchema: "planning",
                        principalTable: "APPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupplierBidItems_SupplierBids_SupplierBidId",
                        column: x => x.SupplierBidId,
                        principalSchema: "procurement",
                        principalTable: "SupplierBids",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AOBAwardedItems_AOBId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "AOBId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBAwardedItems_APPItemId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "APPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBAwardedItems_WinningSupplierId",
                schema: "procurement",
                table: "AOBAwardedItems",
                column: "WinningSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBProcurementProjectMappings_AOBId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                column: "AOBId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBProcurementProjectMappings_ProcurementProjectId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBidItems_APPItemId",
                schema: "procurement",
                table: "SupplierBidItems",
                column: "APPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBidItems_SupplierBidId",
                schema: "procurement",
                table: "SupplierBidItems",
                column: "SupplierBidId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBids_ProcurementProjectId",
                schema: "procurement",
                table: "SupplierBids",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBids_SupplierId",
                schema: "procurement",
                table: "SupplierBids",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AOBAwardedItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "AOBProcurementProjectMappings",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "SupplierBidItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "AOBs",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "SupplierBids",
                schema: "procurement");
        }
    }
}
