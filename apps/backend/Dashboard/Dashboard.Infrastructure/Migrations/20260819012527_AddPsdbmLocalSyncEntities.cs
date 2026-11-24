using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPsdbmLocalSyncEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.CreateTable(
                name: "PsdbmDepots",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Region = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SourceValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Mode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_PsdbmDepots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PsdbmProducts",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TechnicalSpecificationUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_PsdbmProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PsdbmSyncRuns",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SyncMode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DepotsProcessed = table.Column<int>(type: "integer", nullable: false),
                    ItemsDiscovered = table.Column<int>(type: "integer", nullable: false),
                    ItemsCreated = table.Column<int>(type: "integer", nullable: false),
                    ItemsUpdated = table.Column<int>(type: "integer", nullable: false),
                    StockRecordsUpdated = table.Column<int>(type: "integer", nullable: false),
                    Errors = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_PsdbmSyncRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PsdbmDepotProducts",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepotId = table.Column<Guid>(type: "uuid", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Availability = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AvailableStock = table.Column<int>(type: "integer", nullable: false),
                    RemainingQtyForDelivery = table.Column<int>(type: "integer", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_PsdbmDepotProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PsdbmDepotProducts_PsdbmDepots_DepotId",
                        column: x => x.DepotId,
                        principalSchema: "procurement",
                        principalTable: "PsdbmDepots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PsdbmDepotProducts_PsdbmProducts_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "procurement",
                        principalTable: "PsdbmProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PsdbmStockHistories",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DepotProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    AvailableStock = table.Column<int>(type: "integer", nullable: false),
                    RemainingQtyForDelivery = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Availability = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SyncRunId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_PsdbmStockHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PsdbmStockHistories_PsdbmDepotProducts_DepotProductId",
                        column: x => x.DepotProductId,
                        principalSchema: "procurement",
                        principalTable: "PsdbmDepotProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PsdbmStockHistories_PsdbmSyncRuns_SyncRunId",
                        column: x => x.SyncRunId,
                        principalSchema: "procurement",
                        principalTable: "PsdbmSyncRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmDepotProducts_DepotId",
                schema: "procurement",
                table: "PsdbmDepotProducts",
                column: "DepotId");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmDepotProducts_LastSyncedAt",
                schema: "procurement",
                table: "PsdbmDepotProducts",
                column: "LastSyncedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmDepotProducts_ProductId_DepotId",
                schema: "procurement",
                table: "PsdbmDepotProducts",
                columns: new[] { "ProductId", "DepotId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmDepots_IsActive",
                schema: "procurement",
                table: "PsdbmDepots",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmDepots_Name_Mode",
                schema: "procurement",
                table: "PsdbmDepots",
                columns: new[] { "Name", "Mode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmProducts_Category",
                schema: "procurement",
                table: "PsdbmProducts",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmProducts_IsActive",
                schema: "procurement",
                table: "PsdbmProducts",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmProducts_ItemCode",
                schema: "procurement",
                table: "PsdbmProducts",
                column: "ItemCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmStockHistories_CapturedAt",
                schema: "procurement",
                table: "PsdbmStockHistories",
                column: "CapturedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmStockHistories_DepotProductId",
                schema: "procurement",
                table: "PsdbmStockHistories",
                column: "DepotProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmStockHistories_SyncRunId",
                schema: "procurement",
                table: "PsdbmStockHistories",
                column: "SyncRunId");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmSyncRuns_StartedAt",
                schema: "procurement",
                table: "PsdbmSyncRuns",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PsdbmSyncRuns_Status",
                schema: "procurement",
                table: "PsdbmSyncRuns",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPObjectiveId",
                principalSchema: "planning",
                principalTable: "WFPObjectives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropTable(
                name: "PsdbmStockHistories",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PsdbmDepotProducts",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PsdbmSyncRuns",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PsdbmDepots",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "PsdbmProducts",
                schema: "procurement");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPObjectiveId",
                principalSchema: "planning",
                principalTable: "WFPObjectives",
                principalColumn: "Id");
        }
    }
}
