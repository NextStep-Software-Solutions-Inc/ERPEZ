using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementMasterDataEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "planning",
                table: "ProcurementModes",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                schema: "planning",
                table: "ProcurementModes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProcurementCategories",
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
                    table.PrimaryKey("PK_ProcurementCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcurementModeThresholds",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MinThreshold = table.Column<decimal>(type: "numeric", nullable: false),
                    MaxThreshold = table.Column<decimal>(type: "numeric", nullable: true),
                    EffectivityStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectivityEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_ProcurementModeThresholds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcurementModeThresholds_ProcurementModes_ProcurementModeId",
                        column: x => x.ProcurementModeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UNSPSCCodes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UNSPSCCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UNSPSCCodes_UNSPSCCodes_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "UNSPSCCodes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UOMs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ConversionFactor = table.Column<decimal>(type: "numeric", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UOMs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UOMs_UOMs_ParentId",
                        column: x => x.ParentId,
                        principalSchema: "planning",
                        principalTable: "UOMs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProcurementItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Specifications = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsCSE = table.Column<bool>(type: "boolean", nullable: false),
                    ItemLife = table.Column<int>(type: "integer", nullable: true),
                    ProductCode = table.Column<string>(type: "text", nullable: true),
                    ImageURL = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ObjectCodeId = table.Column<Guid>(type: "uuid", nullable: false),
                    UNSPSCCodeId = table.Column<Guid>(type: "uuid", nullable: true),
                    UOMId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_ProcurementItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcurementItems_Objects_ObjectCodeId",
                        column: x => x.ObjectCodeId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcurementItems_UNSPSCCodes_UNSPSCCodeId",
                        column: x => x.UNSPSCCodeId,
                        principalSchema: "planning",
                        principalTable: "UNSPSCCodes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProcurementItems_UOMs_UOMId",
                        column: x => x.UOMId,
                        principalSchema: "planning",
                        principalTable: "UOMs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementModes_ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes",
                column: "ProcurementCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementItems_ObjectCodeId",
                schema: "planning",
                table: "ProcurementItems",
                column: "ObjectCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementItems_UNSPSCCodeId",
                schema: "planning",
                table: "ProcurementItems",
                column: "UNSPSCCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementItems_UOMId",
                schema: "planning",
                table: "ProcurementItems",
                column: "UOMId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementModeThresholds_ProcurementModeId",
                schema: "planning",
                table: "ProcurementModeThresholds",
                column: "ProcurementModeId");

            migrationBuilder.CreateIndex(
                name: "IX_UNSPSCCodes_ParentId",
                schema: "planning",
                table: "UNSPSCCodes",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_UOMs_ParentId",
                schema: "planning",
                table: "UOMs",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementModes_ProcurementCategories_ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes",
                column: "ProcurementCategoryId",
                principalSchema: "planning",
                principalTable: "ProcurementCategories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementModes_ProcurementCategories_ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes");

            migrationBuilder.DropTable(
                name: "ProcurementCategories",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementModeThresholds",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UNSPSCCodes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UOMs",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementModes_ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "ProcurementModes");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                schema: "planning",
                table: "ProcurementModes");

            migrationBuilder.DropColumn(
                name: "ProcurementCategoryId",
                schema: "planning",
                table: "ProcurementModes");
        }
    }
}
