using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewEntitiesAPRAPRItemAndAPRItemMilestones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "APRs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APRNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    APPId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AgencyControlNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AgencyAccountCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RequestDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ModeOfDelivery = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InsufficientFundsAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequiresObR = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresCBA = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresCompleteSpecifications = table.Column<bool>(type: "boolean", nullable: false),
                    AdditionalRemarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_APRs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APRs_APPs_APPId",
                        column: x => x.APPId,
                        principalSchema: "planning",
                        principalTable: "APPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APRs_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APRs_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APRItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APRId = table.Column<Guid>(type: "uuid", nullable: false),
                    APPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityRequested = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
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
                    table.PrimaryKey("PK_APRItems", x => x.Id);
                    table.CheckConstraint("CK_APRItem_TotalCost", "\"TotalCost\" >= 0");
                    table.ForeignKey(
                        name: "FK_APRItems_APPItems_APPItemId",
                        column: x => x.APPItemId,
                        principalSchema: "planning",
                        principalTable: "APPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APRItems_APRs_APRId",
                        column: x => x.APRId,
                        principalSchema: "planning",
                        principalTable: "APRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APRItems_PPMPItems_PPMPItemId",
                        column: x => x.PPMPItemId,
                        principalSchema: "planning",
                        principalTable: "PPMPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APRItemMilestones",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementActivityTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_APRItemMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APRItemMilestones_APRItems_APRItemId",
                        column: x => x.APRItemId,
                        principalSchema: "planning",
                        principalTable: "APRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APRItemMilestones_ProcurementActivityTypes_ProcurementActiv~",
                        column: x => x.ProcurementActivityTypeId,
                        principalSchema: "planning",
                        principalTable: "ProcurementActivityTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_APRItemMilestones_APRItemId",
                schema: "planning",
                table: "APRItemMilestones",
                column: "APRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_APRItemMilestones_ProcurementActivityTypeId",
                schema: "planning",
                table: "APRItemMilestones",
                column: "ProcurementActivityTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_APRItemMilestones_ScheduledDate",
                schema: "planning",
                table: "APRItemMilestones",
                column: "ScheduledDate");

            migrationBuilder.CreateIndex(
                name: "IX_APRItems_APPItemId",
                schema: "planning",
                table: "APRItems",
                column: "APPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_APRItems_APRId",
                schema: "planning",
                table: "APRItems",
                column: "APRId");

            migrationBuilder.CreateIndex(
                name: "IX_APRItems_PPMPItemId",
                schema: "planning",
                table: "APRItems",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_APPId",
                schema: "planning",
                table: "APRs",
                column: "APPId");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_APRNumber",
                schema: "planning",
                table: "APRs",
                column: "APRNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APRs_FiscalYearId",
                schema: "planning",
                table: "APRs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_OfficeId",
                schema: "planning",
                table: "APRs",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_Status",
                schema: "planning",
                table: "APRs",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "APRItemMilestones",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "APRItems",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "APRs",
                schema: "planning");
        }
    }
}
