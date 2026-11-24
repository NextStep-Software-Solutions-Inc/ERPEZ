using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementPricingAndSupplierSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemPrices",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ProcurementItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_ItemPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemPrices_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemPrices_ProcurementItems_ProcurementItemId",
                        column: x => x.ProcurementItemId,
                        principalSchema: "planning",
                        principalTable: "ProcurementItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    BusinessPermitNo = table.Column<string>(type: "text", nullable: false),
                    ContactPerson = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    TINNumber = table.Column<string>(type: "text", nullable: false),
                    PhilGEPSNumber = table.Column<string>(type: "text", nullable: true),
                    IsBlacklisted = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ProcurementCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Suppliers_ProcurementCategories_ProcurementCategoryId",
                        column: x => x.ProcurementCategoryId,
                        principalSchema: "planning",
                        principalTable: "ProcurementCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SupplierRequirements",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementName = table.Column<string>(type: "text", nullable: false),
                    URL = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_SupplierRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierRequirements_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_FiscalYearId",
                schema: "planning",
                table: "ItemPrices",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_ProcurementItemId_FiscalYearId",
                schema: "planning",
                table: "ItemPrices",
                columns: new[] { "ProcurementItemId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierRequirements_SupplierId_RequirementName",
                schema: "planning",
                table: "SupplierRequirements",
                columns: new[] { "SupplierId", "RequirementName" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers",
                column: "BusinessPermitNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Email",
                schema: "planning",
                table: "Suppliers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_PhilGEPSNumber",
                schema: "planning",
                table: "Suppliers",
                column: "PhilGEPSNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_ProcurementCategoryId",
                schema: "planning",
                table: "Suppliers",
                column: "ProcurementCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers",
                column: "TINNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemPrices",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SupplierRequirements",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Suppliers",
                schema: "planning");
        }
    }
}
