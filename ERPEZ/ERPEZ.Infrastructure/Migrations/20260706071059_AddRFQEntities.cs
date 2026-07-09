using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRFQEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MinSupplierCount",
                schema: "planning",
                table: "ProcurementModes",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "RFQs",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RFQNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TracingNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ModeOfProcurementId = table.Column<Guid>(type: "uuid", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Deadline = table.Column<DateOnly>(type: "date", nullable: true),
                    DeliveryPeriod = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Purpose = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_RFQs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RFQs_ProcurementModes_ModeOfProcurementId",
                        column: x => x.ModeOfProcurementId,
                        principalSchema: "planning",
                        principalTable: "ProcurementModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RFQItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RFQId = table.Column<Guid>(type: "uuid", nullable: false),
                    CPRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPriceSnapshot = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ItemNameSnapshot = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CategorySnapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FundSnapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsBrochureRequired = table.Column<bool>(type: "boolean", nullable: false),
                    GreenSpecification = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_RFQItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RFQItems_ConsolidatedPRItems_CPRItemId",
                        column: x => x.CPRItemId,
                        principalSchema: "procurement",
                        principalTable: "ConsolidatedPRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RFQItems_RFQs_RFQId",
                        column: x => x.RFQId,
                        principalSchema: "procurement",
                        principalTable: "RFQs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RFQSuppliers",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RFQId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvitedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_RFQSuppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RFQSuppliers_RFQs_RFQId",
                        column: x => x.RFQId,
                        principalSchema: "procurement",
                        principalTable: "RFQs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RFQSuppliers_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_CPRItemId",
                schema: "procurement",
                table: "RFQItems",
                column: "CPRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_RFQId",
                schema: "procurement",
                table: "RFQItems",
                column: "RFQId");

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_RFQId_CPRItemId",
                schema: "procurement",
                table: "RFQItems",
                columns: new[] { "RFQId", "CPRItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_ModeOfProcurementId",
                schema: "procurement",
                table: "RFQs",
                column: "ModeOfProcurementId");

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_RFQNumber",
                schema: "procurement",
                table: "RFQs",
                column: "RFQNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_Status",
                schema: "procurement",
                table: "RFQs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_TracingNumber",
                schema: "procurement",
                table: "RFQs",
                column: "TracingNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_RFQId",
                schema: "procurement",
                table: "RFQSuppliers",
                column: "RFQId");

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_RFQId_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers",
                columns: new[] { "RFQId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RFQItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "RFQSuppliers",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "RFQs",
                schema: "procurement");

            migrationBuilder.DropColumn(
                name: "MinSupplierCount",
                schema: "planning",
                table: "ProcurementModes");
        }
    }
}
