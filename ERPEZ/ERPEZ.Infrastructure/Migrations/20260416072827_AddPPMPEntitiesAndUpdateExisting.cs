using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPPMPEntitiesAndUpdateExisting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_IsFinal",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_IsNonCSE",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_StartDate_EndDate",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropColumn(
                name: "EndUser",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "EndDate",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropColumn(
                name: "StartDate",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.RenameColumn(
                name: "FiscalYear",
                schema: "planning",
                table: "PPMPs",
                newName: "Version");

            migrationBuilder.RenameColumn(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "PPMPs",
                newName: "OfficeId");

            migrationBuilder.RenameColumn(
                name: "ProcurementModelId",
                schema: "planning",
                table: "PPMPItems",
                newName: "PPMPExpenditureItemId");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "planning",
                table: "PPMPs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "PPMPNumber",
                schema: "planning",
                table: "PPMPs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "planning",
                table: "PPMPs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "FundSourceId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LIBId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalEstimatedBudget",
                schema: "planning",
                table: "PPMPs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            // PAPCode stays as plain text — no type conversion needed.

            migrationBuilder.AlterColumn<Guid>(
                name: "LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "planning",
                table: "PPMPItems",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CSEItemId1",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MOPJustification",
                schema: "planning",
                table: "PPMPItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MOPOverride",
                schema: "planning",
                table: "PPMPItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                schema: "planning",
                table: "PPMPItems",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                schema: "planning",
                table: "PPMPItemAllocations",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentPrice",
                schema: "planning",
                table: "NonCSEItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemRequestId",
                schema: "planning",
                table: "NonCSEItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductCode",
                schema: "planning",
                table: "NonCSEItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                schema: "planning",
                table: "NonCSEItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UOMId",
                schema: "planning",
                table: "NonCSEItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ApprovalEvents",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_ApprovalEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalEvents_PPMPs_PPMPId",
                        column: x => x.PPMPId,
                        principalSchema: "planning",
                        principalTable: "PPMPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemRequests",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    UOMId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcurementCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ItemCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EstimatedUnitCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TechnicalSpecification = table.Column<string>(type: "text", nullable: true),
                    TWGRemarks = table.Column<string>(type: "text", nullable: true),
                    UACSCode = table.Column<string>(type: "text", nullable: true),
                    UNSCPSCCode = table.Column<string>(type: "text", nullable: true),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_ItemRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemRequests_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemRequests_ProcurementCategories_ProcurementCategoryId",
                        column: x => x.ProcurementCategoryId,
                        principalSchema: "planning",
                        principalTable: "ProcurementCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemRequests_UOMs_UOMId",
                        column: x => x.UOMId,
                        principalSchema: "planning",
                        principalTable: "UOMs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PPMPActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPId = table.Column<Guid>(type: "uuid", nullable: false),
                    LIBActivityId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_PPMPActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPMPActivities_LineItemBudgetActivities_LIBActivityId",
                        column: x => x.LIBActivityId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgetActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PPMPActivities_PPMPs_PPMPId",
                        column: x => x.PPMPId,
                        principalSchema: "planning",
                        principalTable: "PPMPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PPMPExpenditureItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsProcurable = table.Column<bool>(type: "boolean", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_PPMPExpenditureItems", x => x.Id);
                    table.CheckConstraint("CK_PPMPExpenditureItem_TotalCost", "\"TotalCost\" >= 0");
                    table.ForeignKey(
                        name: "FK_PPMPExpenditureItems_PPMPActivities_PPMPActivityId",
                        column: x => x.PPMPActivityId,
                        principalSchema: "planning",
                        principalTable: "PPMPActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs",
                column: "ConsolidatedIntoId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_FiscalYearId",
                schema: "planning",
                table: "PPMPs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_FundSourceId",
                schema: "planning",
                table: "PPMPs",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_LIBId",
                schema: "planning",
                table: "PPMPs",
                column: "LIBId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_OfficeId_FiscalYearId_IsFinal",
                schema: "planning",
                table: "PPMPs",
                columns: new[] { "OfficeId", "FiscalYearId", "IsFinal" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_ParentId",
                schema: "planning",
                table: "PPMPs",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_CSEItemId1",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId1");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_PPMPExpenditureItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "PPMPExpenditureItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems",
                column: "ProcurementModeId1");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "PPMPItemId", "AllocationMonth" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_PPMPItemAllocation_Amount",
                schema: "planning",
                table: "PPMPItemAllocations",
                sql: "\"Amount\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_ItemRequestId",
                schema: "planning",
                table: "NonCSEItems",
                column: "ItemRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Name_IsActive",
                schema: "planning",
                table: "NonCSEItems",
                columns: new[] { "Name", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_UOMId",
                schema: "planning",
                table: "NonCSEItems",
                column: "UOMId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalEvents_PPMPId_Timestamp",
                schema: "planning",
                table: "ApprovalEvents",
                columns: new[] { "PPMPId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ItemRequests_OfficeId_RequestDate",
                schema: "planning",
                table: "ItemRequests",
                columns: new[] { "OfficeId", "RequestDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ItemRequests_ProcurementCategoryId",
                schema: "planning",
                table: "ItemRequests",
                column: "ProcurementCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemRequests_Status",
                schema: "planning",
                table: "ItemRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ItemRequests_UOMId",
                schema: "planning",
                table: "ItemRequests",
                column: "UOMId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                column: "LIBActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "PPMPId", "LIBActivityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_PPMPActivityId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "PPMPActivityId");

            migrationBuilder.AddForeignKey(
                name: "FK_NonCSEItems_ItemRequests_ItemRequestId",
                schema: "planning",
                table: "NonCSEItems",
                column: "ItemRequestId",
                principalSchema: "planning",
                principalTable: "ItemRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NonCSEItems_UOMs_UOMId",
                schema: "planning",
                table: "NonCSEItems",
                column: "UOMId",
                principalSchema: "planning",
                principalTable: "UOMs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId",
                principalSchema: "planning",
                principalTable: "CSEItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId1",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId1",
                principalSchema: "planning",
                principalTable: "CSEItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems",
                column: "LineItemBudgetDetailId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetDetails",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "NonCSEItemId",
                principalSchema: "planning",
                principalTable: "NonCSEItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_PPMPExpenditureItems_PPMPExpenditureItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "PPMPExpenditureItemId",
                principalSchema: "planning",
                principalTable: "PPMPExpenditureItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "PPMPItems",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems",
                column: "ProcurementModeId1",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "PPMPs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_FundSources_FundSourceId",
                schema: "planning",
                table: "PPMPs",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_LineItemBudgets_LIBId",
                schema: "planning",
                table: "PPMPs",
                column: "LIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_Offices_OfficeId",
                schema: "planning",
                table: "PPMPs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_PPMPs_ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs",
                column: "ConsolidatedIntoId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_PPMPs_ParentId",
                schema: "planning",
                table: "PPMPs",
                column: "ParentId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NonCSEItems_ItemRequests_ItemRequestId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropForeignKey(
                name: "FK_NonCSEItems_UOMs_UOMId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_PPMPExpenditureItems_PPMPExpenditureItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_FundSources_FundSourceId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_LineItemBudgets_LIBId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_Offices_OfficeId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_PPMPs_ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPs_PPMPs_ParentId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropTable(
                name: "ApprovalEvents",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ItemRequests",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PPMPExpenditureItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PPMPActivities",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_FiscalYearId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_FundSourceId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_LIBId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_OfficeId_FiscalYearId_IsFinal",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_ParentId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_CSEItemId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_PPMPExpenditureItemId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PPMPItemAllocation_Amount",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_ItemRequestId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_Name_IsActive",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_UOMId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "ConsolidatedIntoId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "FundSourceId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "LIBId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "ParentId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "TotalEstimatedBudget",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "CSEItemId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "MOPJustification",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "MOPOverride",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "ProcurementModeId1",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropColumn(
                name: "Amount",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropColumn(
                name: "CurrentPrice",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "ItemRequestId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "ProductCode",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "Remarks",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "UOMId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.RenameColumn(
                name: "Version",
                schema: "planning",
                table: "PPMPs",
                newName: "FiscalYear");

            migrationBuilder.RenameColumn(
                name: "OfficeId",
                schema: "planning",
                table: "PPMPs",
                newName: "DeliveryUnitId");

            migrationBuilder.RenameColumn(
                name: "PPMPExpenditureItemId",
                schema: "planning",
                table: "PPMPItems",
                newName: "ProcurementModelId");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "planning",
                table: "PPMPs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "PPMPNumber",
                schema: "planning",
                table: "PPMPs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "planning",
                table: "PPMPs",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EndUser",
                schema: "planning",
                table: "PPMPs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.Sql(
                @"ALTER TABLE planning.""PPMPItems""
ALTER COLUMN ""PAPCode"" TYPE text
USING COALESCE(""PAPCode""[1], '');");

            migrationBuilder.AlterColumn<Guid>(
                name: "LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "planning",
                table: "PPMPItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitCost",
                schema: "planning",
                table: "PPMPItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                schema: "planning",
                table: "PPMPItemAllocations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                schema: "planning",
                table: "PPMPItemAllocations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "PPMPs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_IsFinal",
                schema: "planning",
                table: "PPMPs",
                column: "IsFinal");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_IsNonCSE",
                schema: "planning",
                table: "PPMPItems",
                column: "IsNonCSE");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId",
                schema: "planning",
                table: "PPMPItemAllocations",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_StartDate_EndDate",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "StartDate", "EndDate" });

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_CSEItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId",
                principalSchema: "planning",
                principalTable: "CSEItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems",
                column: "LineItemBudgetDetailId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "NonCSEItemId",
                principalSchema: "planning",
                principalTable: "NonCSEItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                schema: "planning",
                table: "PPMPItems",
                column: "ProcurementModeId",
                principalSchema: "planning",
                principalTable: "ProcurementModes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "PPMPs",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
