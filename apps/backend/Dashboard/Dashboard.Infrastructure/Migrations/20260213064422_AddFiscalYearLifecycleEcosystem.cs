using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFiscalYearLifecycleEcosystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EconomicIndicators",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    VATRate = table.Column<decimal>(type: "numeric", nullable: false),
                    InflationRate = table.Column<decimal>(type: "numeric", nullable: false),
                    IncomeTaxRate = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_EconomicIndicators", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EconomicIndicators_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FunctionConfigs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    StrategicMinWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    StrategicMaxWeight = table.Column<decimal>(type: "numeric", nullable: true),
                    CoreFunctionMinWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    CoreFunctionMaxWeight = table.Column<decimal>(type: "numeric", nullable: true),
                    SupportMinWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    SupportMaxWeight = table.Column<decimal>(type: "numeric", nullable: true),
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
                    table.PrimaryKey("PK_FunctionConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FunctionConfigs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeneralRatingScales",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdjectivalRatingName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    MinScore = table.Column<decimal>(type: "numeric", nullable: false),
                    MaxScore = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_GeneralRatingScales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeneralRatingScales_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcurementPolicyConfigs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementModeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementModeThresholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    MinAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    MaxAmount = table.Column<decimal>(type: "numeric", nullable: true),
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
                    table.PrimaryKey("PK_ProcurementPolicyConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcurementPolicyConfigs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcurementPolicyConfigs_ProcurementModeThresholds_Procurem~",
                        column: x => x.ProcurementModeThresholdId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModeThresholds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcurementPolicyConfigs_ProcurementModes_ProcurementModeId",
                        column: x => x.ProcurementModeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowMatrices",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<string>(type: "text", nullable: true),
                    RecommendedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_WorkflowMatrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowMatrices_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkflowMatrices_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "planning",
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EconomicIndicators_FiscalYearId",
                schema: "planning",
                table: "EconomicIndicators",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_FunctionConfigs_FiscalYearId",
                schema: "planning",
                table: "FunctionConfigs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralRatingScales_FiscalYearId_AdjectivalRatingName",
                schema: "planning",
                table: "GeneralRatingScales",
                columns: new[] { "FiscalYearId", "AdjectivalRatingName" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementPolicyConfigs_FiscalYearId_ProcurementModeId",
                schema: "planning",
                table: "ProcurementPolicyConfigs",
                columns: new[] { "FiscalYearId", "ProcurementModeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementPolicyConfigs_ProcurementModeId",
                schema: "planning",
                table: "ProcurementPolicyConfigs",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementPolicyConfigs_ProcurementModeThresholdId",
                schema: "planning",
                table: "ProcurementPolicyConfigs",
                column: "ProcurementModeThresholdId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OrganizationId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OrganizationId", "DocumentType" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_OrganizationId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EconomicIndicators",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FunctionConfigs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "GeneralRatingScales",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementPolicyConfigs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WorkflowMatrices",
                schema: "planning");
        }
    }
}
