using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "planning");

            migrationBuilder.CreateTable(
                name: "Attributes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ParentAttributeId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Attributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attributes_Attributes_ParentAttributeId",
                        column: x => x.ParentAttributeId,
                        principalSchema: "planning",
                        principalTable: "Attributes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Clusters",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_Clusters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FiscalYear",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_FiscalYear", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FundSources",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentSourceId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_FundSources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundSources_FundSources_ParentSourceId",
                        column: x => x.ParentSourceId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "KPIs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentKPIId = table.Column<Guid>(type: "uuid", nullable: true),
                    FunctionType = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsOfficeMandate = table.Column<bool>(type: "boolean", nullable: true),
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
                    table.PrimaryKey("PK_KPIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIs_KPIs_ParentKPIId",
                        column: x => x.ParentKPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentLocationId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Locations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Locations_Locations_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Locations_Locations_ParentLocationId",
                        column: x => x.ParentLocationId,
                        principalSchema: "planning",
                        principalTable: "Locations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MFOPAPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentMFOPAPId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_MFOPAPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MFOPAPs_MFOPAPs_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MFOPAPs_MFOPAPs_ParentMFOPAPId",
                        column: x => x.ParentMFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Objects",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentObjectId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Objects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Objects_Objects_ParentObjectId",
                        column: x => x.ParentObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentOrganizationId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Organizations_Organizations_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Organizations_Organizations_ParentOrganizationId",
                        column: x => x.ParentOrganizationId,
                        principalSchema: "planning",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PerformanceMeasures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_PerformanceMeasures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SDGs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
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
                    table.PrimaryKey("PK_SDGs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Offices",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClusterId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeHead = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    ResponsibilityCenterCode = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Offices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Offices_Clusters_ClusterId",
                        column: x => x.ClusterId,
                        principalSchema: "planning",
                        principalTable: "Clusters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FunctionAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    FunctionType = table.Column<string>(type: "text", nullable: false),
                    Percentage = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_FunctionAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FunctionAllocations_FiscalYear_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReceivedFunds",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FundSourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_ReceivedFunds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReceivedFunds_FundSources_FundSourceId",
                        column: x => x.FundSourceId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KPIAttribute",
                schema: "planning",
                columns: table => new
                {
                    AttributesId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPIAttribute", x => new { x.AttributesId, x.KPIsId });
                    table.ForeignKey(
                        name: "FK_KPIAttribute_Attributes_AttributesId",
                        column: x => x.AttributesId,
                        principalSchema: "planning",
                        principalTable: "Attributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIAttribute_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPIModeOfVerifications",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Url = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_KPIModeOfVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIModeOfVerifications_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPITargets",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    Period = table.Column<string>(type: "text", nullable: false),
                    QuarterName = table.Column<string>(type: "text", nullable: true),
                    KPIId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentKPITargetId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_KPITargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPITargets_KPITargets_ParentKPITargetId",
                        column: x => x.ParentKPITargetId,
                        principalSchema: "planning",
                        principalTable: "KPITargets",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_KPITargets_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPITargets_KPIs_KPIId1",
                        column: x => x.KPIId1,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MFOKPI",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_MFOKPI", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MFOKPI_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MFOKPI_MFOPAPs_MFOPAPId",
                        column: x => x.MFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FundSourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AllotedAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    ObligatedAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    DisbursementAmount = table.Column<decimal>(type: "numeric", nullable: true),
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
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_FundSources_FundSourceId",
                        column: x => x.FundSourceId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "planning",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_MFOPAPs_MFOPAPId",
                        column: x => x.MFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "planning",
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KPIRatings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformanceMeasureId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumericalRating = table.Column<int>(type: "integer", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_KPIRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIRatings_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIRatings_PerformanceMeasures_PerformanceMeasureId",
                        column: x => x.PerformanceMeasureId,
                        principalSchema: "planning",
                        principalTable: "PerformanceMeasures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPISDGs",
                schema: "planning",
                columns: table => new
                {
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false),
                    SDGsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPISDGs", x => new { x.KPIsId, x.SDGsId });
                    table.ForeignKey(
                        name: "FK_KPISDGs_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPISDGs_SDGs_SDGsId",
                        column: x => x.SDGsId,
                        principalSchema: "planning",
                        principalTable: "SDGs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryUnit",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentDUId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_DeliveryUnit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryUnit_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DUAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Purpose = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    ReceivedFundId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_DUAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DUAllocations_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                        column: x => x.ReceivedFundId,
                        principalSchema: "planning",
                        principalTable: "ReceivedFunds",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DUKPIAssignment",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPITargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllocatedTargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    KPIId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_DUKPIAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPITargets_KPITargetId",
                        column: x => x.KPITargetId,
                        principalSchema: "planning",
                        principalTable: "KPITargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPIs_KPIId1",
                        column: x => x.KPIId1,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OPCRs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_OPCRs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRs_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubDeliveryUnit",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SubDeliveryUnitHead = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    ResponsibilityCenterCode = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_SubDeliveryUnit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubDeliveryUnit_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProgramTitle = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FiscalYear = table.Column<int>(type: "integer", nullable: true),
                    ProposedBudget = table.Column<decimal>(type: "numeric", nullable: false),
                    GeneralObjective = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_WFPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPs_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DUFundAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DUAllocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceivedFundId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_DUFundAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DUFundAllocations_DUAllocations_DUAllocationId",
                        column: x => x.DUAllocationId,
                        principalSchema: "planning",
                        principalTable: "DUAllocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DUFundAllocations_ReceivedFunds_ReceivedFundId",
                        column: x => x.ReceivedFundId,
                        principalSchema: "planning",
                        principalTable: "ReceivedFunds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OPCREvaluations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatorId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_OPCREvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCREvaluations_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRKPI",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_OPCRKPI", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRKPI_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRKPI_KPIs_KPIId1",
                        column: x => x.KPIId1,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OPCRKPI_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubDUAllocation",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DUAllocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubDeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_SubDUAllocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubDUAllocation_DUAllocations_DUAllocationId",
                        column: x => x.DUAllocationId,
                        principalSchema: "planning",
                        principalTable: "DUAllocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubDUAllocation_SubDeliveryUnit_SubDeliveryUnitId",
                        column: x => x.SubDeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "SubDeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectives",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric", nullable: false),
                    WFPId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_WFPObjectives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectives_WFPs_WFPId",
                        column: x => x.WFPId,
                        principalSchema: "planning",
                        principalTable: "WFPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WFPObjectives_WFPs_WFPId1",
                        column: x => x.WFPId1,
                        principalSchema: "planning",
                        principalTable: "WFPs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OPCRActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRKPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Budget = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_OPCRActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRActivities_OPCRKPI_OPCRKPIId",
                        column: x => x.OPCRKPIId,
                        principalSchema: "planning",
                        principalTable: "OPCRKPI",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRRatings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCREvaluationId = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformanceMeasureId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRKPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumericalRating = table.Column<int>(type: "integer", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_OPCRRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRRatings_OPCREvaluations_OPCREvaluationId",
                        column: x => x.OPCREvaluationId,
                        principalSchema: "planning",
                        principalTable: "OPCREvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRRatings_OPCRKPI_OPCRKPIId",
                        column: x => x.OPCRKPIId,
                        principalSchema: "planning",
                        principalTable: "OPCRKPI",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRRatings_PerformanceMeasures_PerformanceMeasureId",
                        column: x => x.PerformanceMeasureId,
                        principalSchema: "planning",
                        principalTable: "PerformanceMeasures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTargets",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityName = table.Column<string>(type: "text", nullable: false),
                    Indicator = table.Column<string>(type: "text", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_WFPObjectiveTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargets_WFPObjectives_WFPObjectiveId",
                        column: x => x.WFPObjectiveId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPOutcomes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_WFPOutcomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPOutcomes_WFPObjectives_WFPObjectiveId",
                        column: x => x.WFPObjectiveId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "planning",
                columns: table => new
                {
                    DeliveryUnitsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRActivitiesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryUnitOPCRActivity", x => new { x.DeliveryUnitsId, x.OPCRActivitiesId });
                    table.ForeignKey(
                        name: "FK_DeliveryUnitOPCRActivity_DeliveryUnit_DeliveryUnitsId",
                        column: x => x.DeliveryUnitsId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeliveryUnitOPCRActivity_OPCRActivities_OPCRActivitiesId",
                        column: x => x.OPCRActivitiesId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRPAPDepartments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_OPCRPAPDepartments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRPAPDepartments_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRPAPDepartments_OPCRActivities_OPCRActivityId",
                        column: x => x.OPCRActivityId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTimelines",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_WFPObjectiveTimelines", x => x.Id);
                    table.CheckConstraint("CK_WFPObjectiveTimeline_Dates", "\"StartDate\" < \"EndDate\"");
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTimelines_WFPObjectiveTargets_WFPObjectiveTarge~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPOutcomeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OutputIndicator = table.Column<string>(type: "text", nullable: false),
                    Deliverable = table.Column<string>(type: "text", nullable: false),
                    Timeframe = table.Column<string>(type: "text", nullable: false),
                    PersonsInvolved = table.Column<List<string>>(type: "text[]", nullable: true),
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
                    table.PrimaryKey("PK_WFPActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPActivities_WFPOutcomes_WFPOutcomeId",
                        column: x => x.WFPOutcomeId,
                        principalSchema: "planning",
                        principalTable: "WFPOutcomes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WFPActivities_WFPs_WFPId",
                        column: x => x.WFPId,
                        principalSchema: "planning",
                        principalTable: "WFPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPPAP",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPOutcomeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OutputIndicator = table.Column<string>(type: "text", nullable: false),
                    Deliverable = table.Column<string>(type: "text", nullable: false),
                    Timeframe = table.Column<string>(type: "text", nullable: false),
                    PersonsInvolved = table.Column<List<string>>(type: "text[]", nullable: false),
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
                    table.PrimaryKey("PK_WFPPAP", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPPAP_WFPOutcomes_WFPOutcomeId",
                        column: x => x.WFPOutcomeId,
                        principalSchema: "planning",
                        principalTable: "WFPOutcomes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WFPPAP_WFPs_WFPId",
                        column: x => x.WFPId,
                        principalSchema: "planning",
                        principalTable: "WFPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActivityBudgetRequirements",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CostEstimates = table.Column<decimal>(type: "numeric", nullable: false),
                    WFPActivityId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_ActivityBudgetRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityBudgetRequirements_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                        column: x => x.WFPActivityId,
                        principalSchema: "planning",
                        principalTable: "WFPActivities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ActivityBudgetRequirements_WFPObjectiveTargets_WFPObjective~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPPAPDepartment",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPPAPId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubDeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubDeliveryUnitId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_WFPPAPDepartment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartment_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartment_SubDeliveryUnit_SubDeliveryUnitId",
                        column: x => x.SubDeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "SubDeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartment_SubDeliveryUnit_SubDeliveryUnitId1",
                        column: x => x.SubDeliveryUnitId1,
                        principalSchema: "planning",
                        principalTable: "SubDeliveryUnit",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartment_WFPPAP_WFPPAPId",
                        column: x => x.WFPPAPId,
                        principalSchema: "planning",
                        principalTable: "WFPPAP",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_ObjectId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPObjectiveTargetId_ObjectId_It~",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });

            migrationBuilder.CreateIndex(
                name: "IX_Attributes_ParentAttributeId",
                schema: "planning",
                table: "Attributes",
                column: "ParentAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_Name",
                schema: "planning",
                table: "Clusters",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnit_OfficeId_ParentDUId",
                schema: "planning",
                table: "DeliveryUnit",
                columns: new[] { "OfficeId", "ParentDUId" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnitOPCRActivity_OPCRActivitiesId",
                schema: "planning",
                table: "DeliveryUnitOPCRActivity",
                column: "OPCRActivitiesId");

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_DeliveryUnitId_Purpose",
                schema: "planning",
                table: "DUAllocations",
                columns: new[] { "DeliveryUnitId", "Purpose" });

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_ReceivedFundId",
                schema: "planning",
                table: "DUAllocations",
                column: "ReceivedFundId");

            migrationBuilder.CreateIndex(
                name: "IX_DUFundAllocations_DUAllocationId_ReceivedFundId",
                schema: "planning",
                table: "DUFundAllocations",
                columns: new[] { "DUAllocationId", "ReceivedFundId" });

            migrationBuilder.CreateIndex(
                name: "IX_DUFundAllocations_ReceivedFundId",
                schema: "planning",
                table: "DUFundAllocations",
                column: "ReceivedFundId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignment",
                columns: new[] { "DeliveryUnitId", "KPITargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPIId",
                schema: "planning",
                table: "DUKPIAssignment",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPIId1",
                schema: "planning",
                table: "DUKPIAssignment",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignment",
                column: "KPITargetId");

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_FunctionType_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                columns: new[] { "FunctionType", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundSources_ParentId_Code",
                schema: "planning",
                table: "FundSources",
                columns: new[] { "ParentId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundSources_ParentSourceId",
                schema: "planning",
                table: "FundSources",
                column: "ParentSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIAttribute_KPIsId",
                schema: "planning",
                table: "KPIAttribute",
                column: "KPIsId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIModeOfVerifications_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications",
                columns: new[] { "KPIId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_KPIId",
                schema: "planning",
                table: "KPIRatings",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIRatings_PerformanceMeasureId",
                schema: "planning",
                table: "KPIRatings",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_Name",
                schema: "planning",
                table: "KPIs",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_ParentKPIId",
                schema: "planning",
                table: "KPIs",
                column: "ParentKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPISDGs_SDGsId",
                schema: "planning",
                table: "KPISDGs",
                column: "SDGsId");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId1",
                schema: "planning",
                table: "KPITargets",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_ParentKPITargetId",
                schema: "planning",
                table: "KPITargets",
                column: "ParentKPITargetId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Name_Code",
                schema: "planning",
                table: "Locations",
                columns: new[] { "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ParentId",
                schema: "planning",
                table: "Locations",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ParentLocationId",
                schema: "planning",
                table: "Locations",
                column: "ParentLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_MFOKPI_KPIId",
                schema: "planning",
                table: "MFOKPI",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_MFOKPI_MFOPAPId_KPIId",
                schema: "planning",
                table: "MFOKPI",
                columns: new[] { "MFOPAPId", "KPIId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_Name_Code",
                schema: "planning",
                table: "MFOPAPs",
                columns: new[] { "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_ParentId",
                schema: "planning",
                table: "MFOPAPs",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_ParentMFOPAPId",
                schema: "planning",
                table: "MFOPAPs",
                column: "ParentMFOPAPId");

            migrationBuilder.CreateIndex(
                name: "IX_Objects_ParentId_Code",
                schema: "planning",
                table: "Objects",
                columns: new[] { "ParentId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Objects_ParentObjectId",
                schema: "planning",
                table: "Objects",
                column: "ParentObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_ClusterId",
                schema: "planning",
                table: "Offices",
                column: "ClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRKPIId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRKPIId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCREvaluations_OPCRId_EvaluatorId_EvaluationDate",
                schema: "planning",
                table: "OPCREvaluations",
                columns: new[] { "OPCRId", "EvaluatorId", "EvaluationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPI_KPIId",
                schema: "planning",
                table: "OPCRKPI",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPI_KPIId1",
                schema: "planning",
                table: "OPCRKPI",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPI_OPCRId_KPIId",
                schema: "planning",
                table: "OPCRKPI",
                columns: new[] { "OPCRId", "KPIId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "OPCRActivityId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "OPCREvaluationId", "PerformanceMeasureId", "OPCRKPIId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                column: "OPCRKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_PerformanceMeasureId",
                schema: "planning",
                table: "OPCRRatings",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Name_Code",
                schema: "planning",
                table: "Organizations",
                columns: new[] { "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_ParentId",
                schema: "planning",
                table: "Organizations",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_ParentOrganizationId",
                schema: "planning",
                table: "Organizations",
                column: "ParentOrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceMeasures_Name",
                schema: "planning",
                table: "PerformanceMeasures",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReceivedFunds_FundSourceId_Amount",
                schema: "planning",
                table: "ReceivedFunds",
                columns: new[] { "FundSourceId", "Amount" });

            migrationBuilder.CreateIndex(
                name: "IX_SubDeliveryUnit_DeliveryUnitId_Name",
                schema: "planning",
                table: "SubDeliveryUnit",
                columns: new[] { "DeliveryUnitId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubDUAllocation_DUAllocationId_SubDeliveryUnitId",
                schema: "planning",
                table: "SubDUAllocation",
                columns: new[] { "DUAllocationId", "SubDeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubDUAllocation_SubDeliveryUnitId",
                schema: "planning",
                table: "SubDUAllocation",
                column: "SubDeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FundSourceId_OrganizationId_LocationId_MFOPAPI~",
                schema: "planning",
                table: "Transactions",
                columns: new[] { "FundSourceId", "OrganizationId", "LocationId", "MFOPAPId", "ObjectId", "TransactionDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_LocationId",
                schema: "planning",
                table: "Transactions",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_MFOPAPId",
                schema: "planning",
                table: "Transactions",
                column: "MFOPAPId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ObjectId",
                schema: "planning",
                table: "Transactions",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_OrganizationId",
                schema: "planning",
                table: "Transactions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "planning",
                table: "WFPActivities",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPOutcomeId",
                schema: "planning",
                table: "WFPActivities",
                column: "WFPOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives",
                columns: new[] { "WFPId", "Description" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId1",
                schema: "planning",
                table: "WFPObjectives",
                column: "WFPId1");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName_Indicator",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate_EndDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveTargetId", "StartDate", "EndDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPOutcomes_WFPObjectiveId_Description",
                schema: "planning",
                table: "WFPOutcomes",
                columns: new[] { "WFPObjectiveId", "Description" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAP_WFPId",
                schema: "planning",
                table: "WFPPAP",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAP_WFPOutcomeId",
                schema: "planning",
                table: "WFPPAP",
                column: "WFPOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartment_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartment",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartment_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartment",
                column: "SubDeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartment_SubDeliveryUnitId1",
                schema: "planning",
                table: "WFPPAPDepartment",
                column: "SubDeliveryUnitId1");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartment_WFPPAPId_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartment",
                columns: new[] { "WFPPAPId", "SubDeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYear",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityBudgetRequirements",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUFundAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUKPIAssignment",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FunctionAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIAttribute",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIModeOfVerifications",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIRatings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPISDGs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MFOKPI",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRPAPDepartments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRRatings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SubDUAllocation",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTimelines",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPPAPDepartment",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPITargets",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FiscalYear",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Attributes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SDGs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCREvaluations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PerformanceMeasures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Locations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MFOPAPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Objects",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Organizations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargets",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SubDeliveryUnit",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPPAP",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRKPI",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ReceivedFunds",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPOutcomes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FundSources",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectives",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DeliveryUnit",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Offices",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Clusters",
                schema: "planning");
        }
    }
}
