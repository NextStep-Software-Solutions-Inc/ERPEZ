using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKPIManagementEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "IsAverage",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "IsFixed",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "IsGlobal",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "IsMultiple",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "IsOfficeMandate",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.RenameColumn(
                name: "IsTargetValueAllocable",
                schema: "planning",
                table: "KPIs",
                newName: "IsOptInAvailable");

            migrationBuilder.RenameColumn(
                name: "IsPercentage",
                schema: "planning",
                table: "KPIs",
                newName: "IsGAD");

            migrationBuilder.RenameColumn(
                name: "FunctionType",
                schema: "planning",
                table: "KPIs",
                newName: "MeasurementUnit");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DistributionBehavior",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FunctionCategory",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MonitoringFrequency",
                schema: "planning",
                table: "KPIs",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FYActiveKPIs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    MasterKPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentKPIId = table.Column<Guid>(type: "uuid", nullable: true),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MeasurementUnit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DistributionBehavior = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FunctionCategory = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MonitoringFrequency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsOptInAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    IsGAD = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AgencyTargetAnnual = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AgencyTargetQ1 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AgencyTargetQ2 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AgencyTargetQ3 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AgencyTargetQ4 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
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
                    table.PrimaryKey("PK_FYActiveKPIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIs_FYActiveKPIs_ParentKPIId",
                        column: x => x.ParentKPIId,
                        principalSchema: "planning",
                        principalTable: "FYActiveKPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIs_KPIs_MasterKPIId",
                        column: x => x.MasterKPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIs_MFOPAPs_MFOPAPId",
                        column: x => x.MFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RatingScaleTemplates",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsFixed = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    GeneralRatingScaleId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_RatingScaleTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RatingScaleTemplates_GeneralRatingScales_GeneralRatingScale~",
                        column: x => x.GeneralRatingScaleId,
                        principalSchema: "planning",
                        principalTable: "GeneralRatingScales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "KPIAssignments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FYActiveKPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedTargetAnnual = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AssignedTargetQ1 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AssignedTargetQ2 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AssignedTargetQ3 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    AssignedTargetQ4 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_KPIAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIAssignments_FYActiveKPIs_FYActiveKPIId",
                        column: x => x.FYActiveKPIId,
                        principalSchema: "planning",
                        principalTable: "FYActiveKPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIAssignments_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FYActiveKPIMeasurements",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FYActiveKPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    Dimension = table.Column<string>(type: "text", nullable: false),
                    RatingScaleTemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    MOVs = table.Column<List<string>>(type: "jsonb", nullable: false),
                    IsMOVEditable = table.Column<bool>(type: "boolean", nullable: false),
                    IsScaleEditable = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_FYActiveKPIMeasurements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIMeasurements_FYActiveKPIs_FYActiveKPIId",
                        column: x => x.FYActiveKPIId,
                        principalSchema: "planning",
                        principalTable: "FYActiveKPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FYActiveKPIMeasurements_RatingScaleTemplates_RatingScaleTem~",
                        column: x => x.RatingScaleTemplateId,
                        principalSchema: "planning",
                        principalTable: "RatingScaleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "KPIMeasurements",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    Dimension = table.Column<string>(type: "text", nullable: false),
                    RatingScaleTemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    MOVs = table.Column<List<string>>(type: "jsonb", nullable: false),
                    IsMOVEditable = table.Column<bool>(type: "boolean", nullable: false),
                    IsScaleEditable = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_KPIMeasurements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIMeasurements_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIMeasurements_RatingScaleTemplates_RatingScaleTemplateId",
                        column: x => x.RatingScaleTemplateId,
                        principalSchema: "planning",
                        principalTable: "RatingScaleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RatingScaleLevels",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RatingScaleTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    RatingValue = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    MinValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    MaxValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
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
                    table.PrimaryKey("PK_RatingScaleLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RatingScaleLevels_RatingScaleTemplates_RatingScaleTemplateId",
                        column: x => x.RatingScaleTemplateId,
                        principalSchema: "planning",
                        principalTable: "RatingScaleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_Dimension",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                column: "Dimension");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_FYActiveKPIId",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                column: "FYActiveKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_RatingScaleTemplateId",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                column: "RatingScaleTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_Code",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_FiscalYearId",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_FiscalYearId_MasterKPIId",
                schema: "planning",
                table: "FYActiveKPIs",
                columns: new[] { "FiscalYearId", "MasterKPIId" });

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_MasterKPIId",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "MasterKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_MFOPAPId",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "MFOPAPId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_ParentKPIId",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "ParentKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_Status",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_FYActiveKPIId_OfficeId",
                schema: "planning",
                table: "KPIAssignments",
                columns: new[] { "FYActiveKPIId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_OfficeId",
                schema: "planning",
                table: "KPIAssignments",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_Dimension",
                schema: "planning",
                table: "KPIMeasurements",
                column: "Dimension");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_KPIId",
                schema: "planning",
                table: "KPIMeasurements",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_RatingScaleTemplateId",
                schema: "planning",
                table: "KPIMeasurements",
                column: "RatingScaleTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleLevels_RatingScaleTemplateId_RatingValue",
                schema: "planning",
                table: "RatingScaleLevels",
                columns: new[] { "RatingScaleTemplateId", "RatingValue" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleTemplates_GeneralRatingScaleId",
                schema: "planning",
                table: "RatingScaleTemplates",
                column: "GeneralRatingScaleId");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleTemplates_IsDefault",
                schema: "planning",
                table: "RatingScaleTemplates",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleTemplates_Name",
                schema: "planning",
                table: "RatingScaleTemplates",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FYActiveKPIMeasurements",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIAssignments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIMeasurements",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "RatingScaleLevels",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FYActiveKPIs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "RatingScaleTemplates",
                schema: "planning");

            migrationBuilder.DropColumn(
                name: "Code",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "DistributionBehavior",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "FunctionCategory",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "MonitoringFrequency",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.RenameColumn(
                name: "MeasurementUnit",
                schema: "planning",
                table: "KPIs",
                newName: "FunctionType");

            migrationBuilder.RenameColumn(
                name: "IsOptInAvailable",
                schema: "planning",
                table: "KPIs",
                newName: "IsTargetValueAllocable");

            migrationBuilder.RenameColumn(
                name: "IsGAD",
                schema: "planning",
                table: "KPIs",
                newName: "IsPercentage");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAverage",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFixed",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGlobal",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMultiple",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsOfficeMandate",
                schema: "planning",
                table: "KPIs",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
