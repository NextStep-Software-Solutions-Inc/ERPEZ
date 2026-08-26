using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_FiscalYear",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "FiscalYear",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.AddColumn<Guid>(
                name: "ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level",
                schema: "planning",
                table: "LineItemBudgets",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                schema: "planning",
                table: "LineItemBudgets",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                schema: "planning",
                table: "LineItemBudgets",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "AgencyMasterBudgets",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    FundClusterId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceDocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PSAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MOOEAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    COAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_AgencyMasterBudgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgencyMasterBudgets_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AgencyMasterBudgets_FundSources_FundClusterId",
                        column: x => x.FundClusterId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LIBAmendmentRequests",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProposedLineItemBudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Justification = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_LIBAmendmentRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LIBAmendmentRequests_LineItemBudgets_LineItemBudgetId",
                        column: x => x.LineItemBudgetId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LIBAmendmentRequests_LineItemBudgets_ProposedLineItemBudget~",
                        column: x => x.ProposedLineItemBudgetId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OfficeCeilings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    AgencyMasterBudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    PSAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MOOEAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    COAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsSupplemental = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_OfficeCeilings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficeCeilings_AgencyMasterBudgets_AgencyMasterBudgetId",
                        column: x => x.AgencyMasterBudgetId,
                        principalSchema: "planning",
                        principalTable: "AgencyMasterBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfficeCeilings_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfficeCeilings_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubOfficeCeilings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeCeilingId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubOfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    FundClusterId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    PSAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MOOEAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    COAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_SubOfficeCeilings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubOfficeCeilings_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubOfficeCeilings_FundSources_FundClusterId",
                        column: x => x.FundClusterId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubOfficeCeilings_OfficeCeilings_OfficeCeilingId",
                        column: x => x.OfficeCeilingId,
                        principalSchema: "planning",
                        principalTable: "OfficeCeilings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubOfficeCeilings_Offices_SubOfficeId",
                        column: x => x.SubOfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ConsolidatedIntoLIBId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FundClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_OfficeId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ParentLIBId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "PreviousVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId_FundClusterId_SourceDocume~",
                schema: "planning",
                table: "AgencyMasterBudgets",
                columns: new[] { "FiscalYearId", "FundClusterId", "SourceDocumentType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_FundClusterId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                column: "FundClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_SourceDocumentType",
                schema: "planning",
                table: "AgencyMasterBudgets",
                column: "SourceDocumentType");

            migrationBuilder.CreateIndex(
                name: "IX_LIBAmendmentRequests_LineItemBudgetId",
                schema: "planning",
                table: "LIBAmendmentRequests",
                column: "LineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_LIBAmendmentRequests_ProposedLineItemBudgetId",
                schema: "planning",
                table: "LIBAmendmentRequests",
                column: "ProposedLineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_LIBAmendmentRequests_Status",
                schema: "planning",
                table: "LIBAmendmentRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_AgencyMasterBudgetId",
                schema: "planning",
                table: "OfficeCeilings",
                column: "AgencyMasterBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_FiscalYearId",
                schema: "planning",
                table: "OfficeCeilings",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_OfficeId",
                schema: "planning",
                table: "OfficeCeilings",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_OfficeId_FiscalYearId_AgencyMasterBudgetId_T~",
                schema: "planning",
                table: "OfficeCeilings",
                columns: new[] { "OfficeId", "FiscalYearId", "AgencyMasterBudgetId", "TargetType", "IsSupplemental" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_Status",
                schema: "planning",
                table: "OfficeCeilings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_FiscalYearId",
                schema: "planning",
                table: "SubOfficeCeilings",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_FundClusterId",
                schema: "planning",
                table: "SubOfficeCeilings",
                column: "FundClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_OfficeCeilingId",
                schema: "planning",
                table: "SubOfficeCeilings",
                column: "OfficeCeilingId");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_OfficeCeilingId_SubOfficeId_FundClusterId",
                schema: "planning",
                table: "SubOfficeCeilings",
                columns: new[] { "OfficeCeilingId", "SubOfficeId", "FundClusterId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_SubOfficeId",
                schema: "planning",
                table: "SubOfficeCeilings",
                column: "SubOfficeId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FundClusterId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ConsolidatedIntoLIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "ParentLIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "PreviousVersionId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgets_Offices_OfficeId",
                schema: "planning",
                table: "LineItemBudgets",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_FundSources_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_LineItemBudgets_PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgets_Offices_OfficeId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropTable(
                name: "LIBAmendmentRequests",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SubOfficeCeilings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OfficeCeilings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "AgencyMasterBudgets",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_FundClusterId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_OfficeId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "ConsolidatedIntoLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "FundClusterId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "Level",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "ParentLIBId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "PreviousVersionId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "Version",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.AddColumn<int>(
                name: "FiscalYear",
                schema: "planning",
                table: "LineItemBudgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "LineItemBudgets",
                columns: new[] { "DeliveryUnitId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_FiscalYear",
                schema: "planning",
                table: "LineItemBudgets",
                column: "FiscalYear");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_IsConsolidated",
                schema: "planning",
                table: "LineItemBudgets",
                column: "IsConsolidated");
        }
    }
}
