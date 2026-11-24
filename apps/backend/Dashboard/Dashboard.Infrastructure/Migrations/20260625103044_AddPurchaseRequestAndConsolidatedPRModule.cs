using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseRequestAndConsolidatedPRModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ConsolidatedPRs",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CPRNumber = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Purpose = table.Column<string>(type: "text", nullable: true),
                    ConsolidationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsolidatedPRs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseRequests",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PRNumber = table.Column<string>(type: "text", nullable: false),
                    PPMPId = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Purpose = table.Column<string>(type: "text", nullable: false),
                    PRType = table.Column<string>(type: "text", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    FundClusterId = table.Column<Guid>(type: "uuid", nullable: true),
                    UACSCodeCombinationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcurementCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    RequestedDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_FundSources_FundClusterId",
                        column: x => x.FundClusterId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_PPMPs_PPMPId",
                        column: x => x.PPMPId,
                        principalSchema: "planning",
                        principalTable: "PPMPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_ProcurementCategories_ProcurementCategoryId",
                        column: x => x.ProcurementCategoryId,
                        principalSchema: "planning",
                        principalTable: "ProcurementCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_UACSCodeCombinations_UACSCodeCombinationId",
                        column: x => x.UACSCodeCombinationId,
                        principalSchema: "planning",
                        principalTable: "UACSCodeCombinations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PRItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    APRItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UnitCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RequestedQuantity = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    StockNo = table.Column<string>(type: "text", nullable: true),
                    IsNonCSE = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_PRItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PRItems_PPMPItems_PPMPItemId",
                        column: x => x.PPMPItemId,
                        principalSchema: "planning",
                        principalTable: "PPMPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PRItems_PurchaseRequests_PurchaseRequestId",
                        column: x => x.PurchaseRequestId,
                        principalSchema: "procurement",
                        principalTable: "PurchaseRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConsolidatedPRItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsolidatedPRId = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    PRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementModeId = table.Column<Guid>(type: "uuid", nullable: true),
                    AllowPartial = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_ConsolidatedPRItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsolidatedPRItems_ConsolidatedPRs_ConsolidatedPRId",
                        column: x => x.ConsolidatedPRId,
                        principalSchema: "procurement",
                        principalTable: "ConsolidatedPRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsolidatedPRItems_PRItems_PRItemId",
                        column: x => x.PRItemId,
                        principalSchema: "procurement",
                        principalTable: "PRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsolidatedPRItems_ProcurementModes_ProcurementModeId",
                        column: x => x.ProcurementModeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsolidatedPRItems_PurchaseRequests_PurchaseRequestId",
                        column: x => x.PurchaseRequestId,
                        principalSchema: "procurement",
                        principalTable: "PurchaseRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PRItemMonthlyQuantities",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    Month = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_PRItemMonthlyQuantities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PRItemMonthlyQuantities_PRItems_PRItemId",
                        column: x => x.PRItemId,
                        principalSchema: "procurement",
                        principalTable: "PRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalEvents_ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents",
                column: "ConsolidatedPRId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalEvents_PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_ConsolidatedPRId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                column: "ConsolidatedPRId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_ConsolidatedPRId_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                columns: new[] { "ConsolidatedPRId", "PRItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                column: "PRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_ProcurementModeId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_PurchaseRequestId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs",
                column: "CPRNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PRItemMonthlyQuantities_PRItemId_Month",
                schema: "procurement",
                table: "PRItemMonthlyQuantities",
                columns: new[] { "PRItemId", "Month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PRItems_PPMPItemId",
                schema: "procurement",
                table: "PRItems",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PRItems_PurchaseRequestId",
                schema: "procurement",
                table: "PRItems",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_FundClusterId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "FundClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_OfficeId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PPMPId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "PPMPId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "PRNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_ProcurementCategoryId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "ProcurementCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_UACSCodeCombinationId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "UACSCodeCombinationId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalEvents_ConsolidatedPRs_ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents",
                column: "ConsolidatedPRId",
                principalSchema: "procurement",
                principalTable: "ConsolidatedPRs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalEvents_PurchaseRequests_PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents",
                column: "PurchaseRequestId",
                principalSchema: "procurement",
                principalTable: "PurchaseRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalEvents_ConsolidatedPRs_ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalEvents_PurchaseRequests_PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropTable(
                name: "ConsolidatedPRItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PRItemMonthlyQuantities",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "ConsolidatedPRs",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PRItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PurchaseRequests",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalEvents_ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalEvents_PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropColumn(
                name: "ConsolidatedPRId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropColumn(
                name: "PurchaseRequestId",
                schema: "planning",
                table: "ApprovalEvents");
        }
    }
}
