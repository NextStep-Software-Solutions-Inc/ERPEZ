using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKPIFlagProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropTable(
                name: "DUKPIAssignmentOPCR",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUKPIAssignments",
                schema: "planning");

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
                    table.ForeignKey(
                        name: "FK_DUKPITargetAssignments_KPITargets_KPITargetId",
                        column: x => x.KPITargetId,
                        principalSchema: "planning",
                        principalTable: "KPITargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPITargetAssignments_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
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
                        name: "FK_DUKPITargetAssignmentOPCR_DUKPITargetAssignments_DUKPITarge~",
                        column: x => x.DUKPITargetAssignmentsId,
                        principalSchema: "planning",
                        principalTable: "DUKPITargetAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPITargetAssignmentOPCR_OPCRs_OPCRsId",
                        column: x => x.OPCRsId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_DUKPITargetAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropTable(
                name: "DUKPITargetAssignmentOPCR",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "DUKPITargetAssignments",
                schema: "planning");

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

            migrationBuilder.CreateTable(
                name: "DUKPIAssignments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPITargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllocatedTargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DUKPIAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignments_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignments_KPITargets_KPITargetId",
                        column: x => x.KPITargetId,
                        principalSchema: "planning",
                        principalTable: "KPITargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignments_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DUKPIAssignmentOPCR",
                schema: "planning",
                columns: table => new
                {
                    DUKPIAssignmentsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DUKPIAssignmentOPCR", x => new { x.DUKPIAssignmentsId, x.OPCRsId });
                    table.ForeignKey(
                        name: "FK_DUKPIAssignmentOPCR_DUKPIAssignments_DUKPIAssignmentsId",
                        column: x => x.DUKPIAssignmentsId,
                        principalSchema: "planning",
                        principalTable: "DUKPIAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignmentOPCR_OPCRs_OPCRsId",
                        column: x => x.OPCRsId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignmentOPCR_OPCRsId",
                schema: "planning",
                table: "DUKPIAssignmentOPCR",
                column: "OPCRsId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignments_DeliveryUnitId_KPIId_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignments",
                columns: new[] { "DeliveryUnitId", "KPIId", "KPITargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignments_KPIId",
                schema: "planning",
                table: "DUKPIAssignments",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignments_KPITargetId",
                schema: "planning",
                table: "DUKPIAssignments",
                column: "KPITargetId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPIAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPIAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPIAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
