using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSquash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "planning");

            migrationBuilder.CreateTable(
                name: "APPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APPNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
                    IsFinal = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APPs", x => x.Id);
                });

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
                name: "CSEItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ItemLife = table.Column<int>(type: "integer", nullable: true),
                    ProductCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ImageURL = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_CSEItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FiscalYears",
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
                    table.PrimaryKey("PK_FiscalYears", x => x.Id);
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
                name: "NonCSEItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BaseCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Margin = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SellingPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ItemLife = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_NonCSEItems", x => x.Id);
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
                        name: "FK_Objects_Objects_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                name: "ProcurementActivityTypes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_ProcurementActivityTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcurementModes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_ProcurementModes", x => x.Id);
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
                    ClusterId = table.Column<Guid>(type: "uuid", nullable: true),
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
                        principalColumn: "Id");
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
                        name: "FK_FunctionAllocations_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryUnits",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_DeliveryUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryUnits_DeliveryUnits_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DeliveryUnits_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LineItemBudgets",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Scope = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsConsolidated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LIBNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LineItemBudgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LineItemBudgets_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RatingStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RatingSubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RatingReturnedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                        name: "FK_OPCRs_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PPMPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FiscalYear = table.Column<int>(type: "integer", nullable: false),
                    IsFinal = table.Column<bool>(type: "boolean", nullable: false),
                    EndUser = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PPMPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPMPs_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
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
                    ProjectTitle = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProjectStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ProjectEndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ProposedBudget = table.Column<decimal>(type: "numeric", nullable: true),
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
                        name: "FK_WFPs_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WFPs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id");
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
                name: "WFPObjectives",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Outcome = table.Column<string>(type: "text", nullable: true),
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
                });

            migrationBuilder.CreateTable(
                name: "WFPPAPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_WFPPAPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPPAPs_WFPs_WFPId",
                        column: x => x.WFPId,
                        principalSchema: "planning",
                        principalTable: "WFPs",
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
                    Weight = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
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
                name: "WFPPAPDepartments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPPAPId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_WFPPAPDepartments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartments_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPPAPDepartments_WFPPAPs_WFPPAPId",
                        column: x => x.WFPPAPId,
                        principalSchema: "planning",
                        principalTable: "WFPPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CostEstimates = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_WFPObjectiveTargetExpenditures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_WFPObjectiveTargets_WFPObjec~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
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
                    TimelineType = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
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
                name: "APPItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APPId = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    FundSourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PAPCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsEarlyProcurementActivity = table.Column<bool>(type: "boolean", nullable: false),
                    IsOutsourced = table.Column<bool>(type: "boolean", nullable: false),
                    BidEvaluationCriteria = table.Column<string>(type: "text", nullable: true),
                    ProcurementStrategy = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProcurementModeId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_APPItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APPItems_APPs_APPId",
                        column: x => x.APPId,
                        principalSchema: "planning",
                        principalTable: "APPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APPItems_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APPItems_FundSources_FundSourceId",
                        column: x => x.FundSourceId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APPItems_ProcurementModes_ProcurementModeId",
                        column: x => x.ProcurementModeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "APPProcurementSchedules",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementActivityTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_APPProcurementSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APPProcurementSchedules_ProcurementActivityTypes_Procuremen~",
                        column: x => x.ProcurementActivityTypeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementActivityTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttributeKPI",
                schema: "planning",
                columns: table => new
                {
                    AttributesId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributeKPI", x => new { x.AttributesId, x.KPIsId });
                    table.ForeignKey(
                        name: "FK_AttributeKPI_Attributes_AttributesId",
                        column: x => x.AttributesId,
                        principalSchema: "planning",
                        principalTable: "Attributes",
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
                        name: "FK_DeliveryUnitOPCRActivity_DeliveryUnits_DeliveryUnitsId",
                        column: x => x.DeliveryUnitsId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DUKPITargetAssignmentOPCR",
                schema: "planning",
                columns: table => new
                {
                    DUKPITargetAssignmentsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DUKPITargetAssignmentOPCR", x => new { x.DUKPITargetAssignmentsId, x.OPCRsId });
                    table.ForeignKey(
                        name: "FK_DUKPITargetAssignmentOPCR_OPCRs_OPCRsId",
                        column: x => x.OPCRsId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DUKPITargetAssignments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPITargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllocatedTargetValue = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_DUKPITargetAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DUKPITargetAssignments_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
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
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    DUKPITargetAssignmentId = table.Column<Guid>(type: "uuid", nullable: false),
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
                        name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPITargetAssignmentId",
                        column: x => x.DUKPITargetAssignmentId,
                        principalSchema: "planning",
                        principalTable: "DUKPITargetAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRRatings_OPCREvaluations_OPCREvaluationId",
                        column: x => x.OPCREvaluationId,
                        principalSchema: "planning",
                        principalTable: "OPCREvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRRatings_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
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
                });

            migrationBuilder.CreateTable(
                name: "KPIPerformanceMeasures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformanceMeasureId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_KPIPerformanceMeasures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KPIPerformanceMeasures_PerformanceMeasures_PerformanceMeasu~",
                        column: x => x.PerformanceMeasureId,
                        principalSchema: "planning",
                        principalTable: "PerformanceMeasures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ratings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NumericalRating = table.Column<int>(type: "integer", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    KPIPerformanceMeasureId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_Ratings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ratings_KPIPerformanceMeasures_KPIPerformanceMeasureId",
                        column: x => x.KPIPerformanceMeasureId,
                        principalSchema: "planning",
                        principalTable: "KPIPerformanceMeasures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    IsOfficeMandate = table.Column<bool>(type: "boolean", nullable: false),
                    IsPercentage = table.Column<bool>(type: "boolean", nullable: false),
                    IsTargetValueAllocable = table.Column<bool>(type: "boolean", nullable: false),
                    IsFixed = table.Column<bool>(type: "boolean", nullable: false),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                    IsMultiple = table.Column<bool>(type: "boolean", nullable: false),
                    IsAverage = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: true),
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
                name: "KPISDG",
                schema: "planning",
                columns: table => new
                {
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false),
                    SDGsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPISDG", x => new { x.KPIsId, x.SDGsId });
                    table.ForeignKey(
                        name: "FK_KPISDG_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPISDG_SDGs_SDGsId",
                        column: x => x.SDGsId,
                        principalSchema: "planning",
                        principalTable: "SDGs",
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
                    KPIId = table.Column<Guid>(type: "uuid", nullable: true),
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
                        name: "FK_MFOPAPs_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
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
                name: "OPCRActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    DUKPITargetAssignmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Budget = table.Column<decimal>(type: "numeric", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: true),
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
                        name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~",
                        column: x => x.DUKPITargetAssignmentId,
                        principalSchema: "planning",
                        principalTable: "DUKPITargetAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRActivities_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OPCRActivities_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRPAPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_OPCRPAPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRPAPs_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRPAPs_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
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
                name: "LineItemBudgetActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: true),
                    OPCRActivityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
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
                    table.PrimaryKey("PK_LineItemBudgetActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LineItemBudgetActivities_LineItemBudgets_LineItemBudgetId",
                        column: x => x.LineItemBudgetId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LineItemBudgetActivities_OPCRActivities_OPCRActivityId",
                        column: x => x.OPCRActivityId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LineItemBudgetActivities_WFPObjectiveTargets_WFPObjectiveTa~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OPCRActivityMOVs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    UploadedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_OPCRActivityMOVs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRActivityMOVs_OPCRActivities_OPCRActivityId",
                        column: x => x.OPCRActivityId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRActivityRatings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformanceMeasureId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActualAccomplishedValue = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_OPCRActivityRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRActivityRatings_OPCRActivities_OPCRActivityId",
                        column: x => x.OPCRActivityId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRActivityRatings_PerformanceMeasures_PerformanceMeasureId",
                        column: x => x.PerformanceMeasureId,
                        principalSchema: "planning",
                        principalTable: "PerformanceMeasures",
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
                        name: "FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
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
                name: "LineItemBudgetDetails",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetActivityId = table.Column<Guid>(type: "uuid", nullable: true),
                    WFPObjectiveTargetExpenditureId = table.Column<Guid>(type: "uuid", nullable: true),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TimelineType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Budget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_LineItemBudgetDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LineItemBudgetDetails_LineItemBudgetActivities_LineItemBudg~",
                        column: x => x.LineItemBudgetActivityId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgetActivities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LineItemBudgetDetails_LineItemBudgets_LineItemBudgetId",
                        column: x => x.LineItemBudgetId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LineItemBudgetDetails_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LineItemBudgetDetails_WFPObjectiveTargetExpenditures_WFPObj~",
                        column: x => x.WFPObjectiveTargetExpenditureId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargetExpenditures",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OPCRActivityEvaluations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRActivityRatingId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatorScore = table.Column<int>(type: "integer", nullable: false),
                    Remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EvaluatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_OPCRActivityEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRActivityEvaluations_OPCRActivityRatings_OPCRActivityRat~",
                        column: x => x.OPCRActivityRatingId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivityRatings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PPMPItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetDetailId = table.Column<Guid>(type: "uuid", nullable: false),
                    CSEItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    NonCSEItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcurementModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    PAPCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsNonCSE = table.Column<bool>(type: "boolean", nullable: false),
                    ProcurementModeId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_PPMPItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPMPItems_CSEItems_CSEItemId",
                        column: x => x.CSEItemId,
                        principalSchema: "planning",
                        principalTable: "CSEItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PPMPItems_LineItemBudgetDetails_LineItemBudgetDetailId",
                        column: x => x.LineItemBudgetDetailId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgetDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PPMPItems_NonCSEItems_NonCSEItemId",
                        column: x => x.NonCSEItemId,
                        principalSchema: "planning",
                        principalTable: "NonCSEItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PPMPItems_PPMPs_PPMPId",
                        column: x => x.PPMPId,
                        principalSchema: "planning",
                        principalTable: "PPMPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PPMPItems_ProcurementModes_ProcurementModeId",
                        column: x => x.ProcurementModeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PPMPItemAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_PPMPItemAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPMPItemAllocations_PPMPItems_PPMPItemId",
                        column: x => x.PPMPItemId,
                        principalSchema: "planning",
                        principalTable: "PPMPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_APPId",
                schema: "planning",
                table: "APPItems",
                column: "APPId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_DeliveryUnitId",
                schema: "planning",
                table: "APPItems",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_FundSourceId",
                schema: "planning",
                table: "APPItems",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_PPMPItemId",
                schema: "planning",
                table: "APPItems",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_ProcurementModeId",
                schema: "planning",
                table: "APPItems",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_APPProcurementSchedules_PPMPItemId",
                schema: "planning",
                table: "APPProcurementSchedules",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_APPProcurementSchedules_ProcurementActivityTypeId",
                schema: "planning",
                table: "APPProcurementSchedules",
                column: "ProcurementActivityTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_APPProcurementSchedules_ScheduledDate",
                schema: "planning",
                table: "APPProcurementSchedules",
                column: "ScheduledDate");

            migrationBuilder.CreateIndex(
                name: "IX_APPs_APPNumber",
                schema: "planning",
                table: "APPs",
                column: "APPNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APPs_FiscalYear",
                schema: "planning",
                table: "APPs",
                column: "FiscalYear");

            migrationBuilder.CreateIndex(
                name: "IX_AttributeKPI_KPIsId",
                schema: "planning",
                table: "AttributeKPI",
                column: "KPIsId");

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
                name: "IX_CSEItems_Name",
                schema: "planning",
                table: "CSEItems",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_CSEItems_ProductCode",
                schema: "planning",
                table: "CSEItems",
                column: "ProductCode");

            migrationBuilder.CreateIndex(
                name: "IX_CSEItems_Type",
                schema: "planning",
                table: "CSEItems",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnitOPCRActivity_OPCRActivitiesId",
                schema: "planning",
                table: "DeliveryUnitOPCRActivity",
                column: "OPCRActivitiesId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnits_OfficeId_ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                columns: new[] { "OfficeId", "ParentId" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnits_ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPITargetAssignmentOPCR_OPCRsId",
                schema: "planning",
                table: "DUKPITargetAssignmentOPCR",
                column: "OPCRsId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPITargetAssignments_DeliveryUnitId_KPIId_KPITargetId",
                schema: "planning",
                table: "DUKPITargetAssignments",
                columns: new[] { "DeliveryUnitId", "KPIId", "KPITargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DUKPITargetAssignments_KPIId",
                schema: "planning",
                table: "DUKPITargetAssignments",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPITargetAssignments_KPITargetId",
                schema: "planning",
                table: "DUKPITargetAssignments",
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
                name: "IX_KPIModeOfVerifications_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications",
                columns: new[] { "KPIId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_KPIId_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                columns: new[] { "KPIId", "PerformanceMeasureId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_MFOPAPId",
                schema: "planning",
                table: "KPIs",
                column: "MFOPAPId");

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
                name: "IX_KPISDG_SDGsId",
                schema: "planning",
                table: "KPISDG",
                column: "SDGsId");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period", "QuarterName" },
                unique: true,
                filter: "\"QuarterName\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_ParentKPITargetId",
                schema: "planning",
                table: "KPITargets",
                column: "ParentKPITargetId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                column: "LineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_OPCRActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                column: "OPCRActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_WFPObjectiveTargetId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                column: "WFPObjectiveTargetId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_LineItemBudgetActivityId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "LineItemBudgetActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_LineItemBudgetId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "LineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_ObjectId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_StartDate_EndDate",
                schema: "planning",
                table: "LineItemBudgetDetails",
                columns: new[] { "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_WFPObjectiveTargetExpenditureId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "WFPObjectiveTargetExpenditureId");

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

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets",
                column: "LIBNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_Status",
                schema: "planning",
                table: "LineItemBudgets",
                column: "Status");

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
                name: "IX_MFOPAPs_KPIId",
                schema: "planning",
                table: "MFOPAPs",
                column: "KPIId");

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
                name: "IX_NonCSEItems_IsActive",
                schema: "planning",
                table: "NonCSEItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Name",
                schema: "planning",
                table: "NonCSEItems",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Status",
                schema: "planning",
                table: "NonCSEItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_Type",
                schema: "planning",
                table: "NonCSEItems",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Objects_ParentId_Code",
                schema: "planning",
                table: "Objects",
                columns: new[] { "ParentId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offices_ClusterId",
                schema: "planning",
                table: "Offices",
                column: "ClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPITargetAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_KPIId",
                schema: "planning",
                table: "OPCRActivities",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRId", "DUKPITargetAssignmentId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityEvaluations_EvaluatedDate",
                schema: "planning",
                table: "OPCRActivityEvaluations",
                column: "EvaluatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityEvaluations_OPCRActivityRatingId",
                schema: "planning",
                table: "OPCRActivityEvaluations",
                column: "OPCRActivityRatingId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityEvaluations_Status",
                schema: "planning",
                table: "OPCRActivityEvaluations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityMOVs_OPCRActivityId",
                schema: "planning",
                table: "OPCRActivityMOVs",
                column: "OPCRActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityMOVs_UploadedDate",
                schema: "planning",
                table: "OPCRActivityMOVs",
                column: "UploadedDate");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityRatings_OPCRActivityId_PerformanceMeasureId",
                schema: "planning",
                table: "OPCRActivityRatings",
                columns: new[] { "OPCRActivityId", "PerformanceMeasureId" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityRatings_PerformanceMeasureId",
                schema: "planning",
                table: "OPCRActivityRatings",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCREvaluations_OPCRId_EvaluatorId_EvaluationDate",
                schema: "planning",
                table: "OPCREvaluations",
                columns: new[] { "OPCRId", "EvaluatorId", "EvaluationDate" });

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
                name: "IX_OPCRPAPs_KPIId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPs_OPCRId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "OPCRId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPITargetAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DU~",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "OPCREvaluationId", "PerformanceMeasureId", "OPCRId", "DUKPITargetAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCRId",
                schema: "planning",
                table: "OPCRRatings",
                column: "OPCRId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_PerformanceMeasureId",
                schema: "planning",
                table: "OPCRRatings",
                column: "PerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId",
                schema: "planning",
                table: "OPCRs",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "DeliveryUnitId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_RatingReturnedDate",
                schema: "planning",
                table: "OPCRs",
                column: "RatingReturnedDate");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_RatingStatus",
                schema: "planning",
                table: "OPCRs",
                column: "RatingStatus");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_RatingSubmittedDate",
                schema: "planning",
                table: "OPCRs",
                column: "RatingSubmittedDate");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_Status",
                schema: "planning",
                table: "OPCRs",
                column: "Status");

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
                name: "IX_PPMPItemAllocations_PPMPItemId",
                schema: "planning",
                table: "PPMPItemAllocations",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_StartDate_EndDate",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_CSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "CSEItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_IsNonCSE",
                schema: "planning",
                table: "PPMPItems",
                column: "IsNonCSE");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_LineItemBudgetDetailId",
                schema: "planning",
                table: "PPMPItems",
                column: "LineItemBudgetDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_NonCSEItemId",
                schema: "planning",
                table: "PPMPItems",
                column: "NonCSEItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_PPMPId",
                schema: "planning",
                table: "PPMPItems",
                column: "PPMPId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_ProcurementModeId",
                schema: "planning",
                table: "PPMPItems",
                column: "ProcurementModeId");

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
                name: "IX_PPMPs_PPMPNumber",
                schema: "planning",
                table: "PPMPs",
                column: "PPMPNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementActivityTypes_Name",
                schema: "planning",
                table: "ProcurementActivityTypes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementModes_Name",
                schema: "planning",
                table: "ProcurementModes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_KPIPerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "Ratings",
                columns: new[] { "KPIPerformanceMeasureId", "NumericalRating" },
                unique: true);

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
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives",
                columns: new[] { "WFPId", "Description" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_ObjectId",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_WFPObjectiveTargetId_ObjectI~",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName_Indicator",
                schema: "planning",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveTargetId", "StartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate_EndDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveTargetId", "StartDate", "EndDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "WFPPAPId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPs_WFPId",
                schema: "planning",
                table: "WFPPAPs",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "DeliveryUnitId", "FiscalYearId" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_FiscalYearId",
                schema: "planning",
                table: "WFPs",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_PPMPItems_PPMPItemId",
                schema: "planning",
                table: "APPItems",
                column: "PPMPItemId",
                principalSchema: "planning",
                principalTable: "PPMPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_APPProcurementSchedules_PPMPItems_PPMPItemId",
                schema: "planning",
                table: "APPProcurementSchedules",
                column: "PPMPItemId",
                principalSchema: "planning",
                principalTable: "PPMPItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttributeKPI_KPIs_KPIsId",
                schema: "planning",
                table: "AttributeKPI",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryUnitOPCRActivity_OPCRActivities_OPCRActivitiesId",
                schema: "planning",
                table: "DeliveryUnitOPCRActivity",
                column: "OPCRActivitiesId",
                principalSchema: "planning",
                principalTable: "OPCRActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DUKPITargetAssignmentOPCR_DUKPITargetAssignments_DUKPITarge~",
                schema: "planning",
                table: "DUKPITargetAssignmentOPCR",
                column: "DUKPITargetAssignmentsId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DUKPITargetAssignments_KPITargets_KPITargetId",
                schema: "planning",
                table: "DUKPITargetAssignments",
                column: "KPITargetId",
                principalSchema: "planning",
                principalTable: "KPITargets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DUKPITargetAssignments_KPIs_KPIId",
                schema: "planning",
                table: "DUKPITargetAssignments",
                column: "KPIId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIModeOfVerifications_KPIs_KPIId",
                schema: "planning",
                table: "KPIModeOfVerifications",
                column: "KPIId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIPerformanceMeasures_KPIs_KPIId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                column: "KPIId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIs_MFOPAPs_MFOPAPId",
                schema: "planning",
                table: "KPIs",
                column: "MFOPAPId",
                principalSchema: "planning",
                principalTable: "MFOPAPs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MFOPAPs_KPIs_KPIId",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropTable(
                name: "APPItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "APPProcurementSchedules",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "AttributeKPI",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUKPITargetAssignmentOPCR",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FunctionAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIModeOfVerifications",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPISDG",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRActivityEvaluations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRActivityMOVs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRPAPDepartments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRPAPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRRatings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PPMPItemAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Ratings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTimelines",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPPAPDepartments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "APPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementActivityTypes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Attributes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SDGs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRActivityRatings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCREvaluations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PPMPItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIPerformanceMeasures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FundSources",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Locations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Organizations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPPAPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "CSEItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "LineItemBudgetDetails",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "NonCSEItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PPMPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementModes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PerformanceMeasures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "LineItemBudgetActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "LineItemBudgets",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Objects",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargets",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUKPITargetAssignments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPObjectives",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPITargets",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DeliveryUnits",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "FiscalYears",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Offices",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Clusters",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "KPIs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MFOPAPs",
                schema: "planning");
        }
    }
}
