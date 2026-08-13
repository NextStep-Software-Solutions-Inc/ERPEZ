using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementProjectMultiSourceWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_ProcurementProjectId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE procurement.""ProcurementProjects""
SET ""SourceType"" = 'ConsolidatedPR'
WHERE ""SourceType"" IS NULL OR ""SourceType"" = '';

UPDATE procurement.""ProcurementProjects"" p
SET ""OfficeId"" = COALESCE(
    (
        SELECT pr.""OfficeId""
        FROM procurement.""ConsolidatedPRItems"" cpri
        JOIN procurement.""PurchaseRequests"" pr ON cpri.""PurchaseRequestId"" = pr.""Id""
        WHERE cpri.""ConsolidatedPRId"" = p.""ConsolidatedPRId""
        LIMIT 1
    ),
    p.""OfficeId""
),
""FundSourceId"" = COALESCE(
    (
        SELECT pr.""FundSourceId""
        FROM procurement.""ConsolidatedPRItems"" cpri
        JOIN procurement.""PurchaseRequests"" pr ON cpri.""PurchaseRequestId"" = pr.""Id""
        WHERE cpri.""ConsolidatedPRId"" = p.""ConsolidatedPRId""
        LIMIT 1
    ),
    p.""FundSourceId""
)
WHERE p.""ConsolidatedPRId"" IS NOT NULL;

UPDATE procurement.""ProcurementProjects""
SET ""OfficeId"" = (SELECT ""Id"" FROM planning.""Offices"" LIMIT 1)
WHERE ""OfficeId"" = '00000000-0000-0000-0000-000000000000';

UPDATE procurement.""ProcurementProjects""
SET ""FundSourceId"" = (SELECT ""Id"" FROM planning.""FundSources"" LIMIT 1)
WHERE ""FundSourceId"" = '00000000-0000-0000-0000-000000000000';
");

            migrationBuilder.CreateTable(
                name: "BACResolutionClauses",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BACResolutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateClauseId = table.Column<Guid>(type: "uuid", nullable: true),
                    ClauseText = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsCustom = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_BACResolutionClauses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BACResolutionClauses_BACResolutionWhereasClauses_TemplateCl~",
                        column: x => x.TemplateClauseId,
                        principalSchema: "planning",
                        principalTable: "BACResolutionWhereasClauses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BACResolutionClauses_BACResolutions_BACResolutionId",
                        column: x => x.BACResolutionId,
                        principalSchema: "procurement",
                        principalTable: "BACResolutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "APPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_OfficeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_ProcurementProjectId",
                schema: "procurement",
                table: "BACResolutions",
                column: "ProcurementProjectId",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionClauses_BACResolutionId_DisplayOrder",
                schema: "procurement",
                table: "BACResolutionClauses",
                columns: new[] { "BACResolutionId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionClauses_TemplateClauseId",
                schema: "procurement",
                table: "BACResolutionClauses",
                column: "TemplateClauseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_APPItems_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "APPItemId",
                principalSchema: "planning",
                principalTable: "APPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_FundSources_FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "FundSourceId",
                principalSchema: "planning",
                principalTable: "FundSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementProjects_Offices_OfficeId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequests_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "ProcurementProjectId",
                principalSchema: "procurement",
                principalTable: "ProcurementProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_APPItems_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_FundSources_FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementProjects_Offices_OfficeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequests_ProcurementProjects_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropTable(
                name: "BACResolutionClauses",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_OfficeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_ProcurementProjectId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "ProcurementProjectId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "APPItemId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "FundSourceId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "SourceType",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_ProcurementProjectId",
                schema: "procurement",
                table: "BACResolutions",
                column: "ProcurementProjectId");
        }
    }
}
