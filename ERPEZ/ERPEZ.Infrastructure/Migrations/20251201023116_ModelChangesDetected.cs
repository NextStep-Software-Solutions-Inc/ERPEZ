using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ModelChangesDetected : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttributes_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttributes_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_KPISDGs_KPIs_KPIsId",
                schema: "planning",
                table: "KPISDGs");

            migrationBuilder.DropForeignKey(
                name: "FK_KPISDGs_SDGs_SDGsId",
                schema: "planning",
                table: "KPISDGs");

            migrationBuilder.DropForeignKey(
                name: "FK_MFOKPIs_KPIs_KPIsId",
                schema: "planning",
                table: "MFOKPIs");

            migrationBuilder.DropForeignKey(
                name: "FK_MFOKPIs_MFOPAPs_MFOPAPsId",
                schema: "planning",
                table: "MFOKPIs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPs_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRPAPs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropTable(
                name: "OPCRKPIs",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRKPIId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MFOKPIs",
                schema: "planning",
                table: "MFOKPIs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPISDGs",
                schema: "planning",
                table: "KPISDGs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPIAttributes",
                schema: "planning",
                table: "KPIAttributes");

            migrationBuilder.RenameTable(
                name: "MFOKPIs",
                schema: "planning",
                newName: "KPIMFOPAP",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPISDGs",
                schema: "planning",
                newName: "KPISDG",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIAttributes",
                schema: "planning",
                newName: "AttributeKPI",
                newSchema: "planning");

            migrationBuilder.RenameColumn(
                name: "ProgramTitle",
                schema: "planning",
                table: "WFPs",
                newName: "ProjectTitle");

            migrationBuilder.RenameColumn(
                name: "OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "OPCRId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRRatings_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "IX_OPCRRatings_OPCRId");

            migrationBuilder.RenameColumn(
                name: "OPCRKPIId",
                schema: "planning",
                table: "OPCRPAPs",
                newName: "OPCRId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRPAPs_OPCRKPIId",
                schema: "planning",
                table: "OPCRPAPs",
                newName: "IX_OPCRPAPs_OPCRId");

            migrationBuilder.RenameColumn(
                name: "OPCRKPIId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "OPCRId");

            migrationBuilder.RenameIndex(
                name: "IX_MFOKPIs_MFOPAPsId",
                schema: "planning",
                table: "KPIMFOPAP",
                newName: "IX_KPIMFOPAP_MFOPAPsId");

            migrationBuilder.RenameIndex(
                name: "IX_KPISDGs_SDGsId",
                schema: "planning",
                table: "KPISDG",
                newName: "IX_KPISDG_SDGsId");

            migrationBuilder.RenameIndex(
                name: "IX_KPIAttributes_KPIsId",
                schema: "planning",
                table: "AttributeKPI",
                newName: "IX_AttributeKPI_KPIsId");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId",
                schema: "planning",
                table: "OPCRPAPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId",
                schema: "planning",
                table: "OPCRActivities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPIMFOPAP",
                schema: "planning",
                table: "KPIMFOPAP",
                columns: new[] { "KPIsId", "MFOPAPsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPISDG",
                schema: "planning",
                table: "KPISDG",
                columns: new[] { "KPIsId", "SDGsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AttributeKPI",
                schema: "planning",
                table: "AttributeKPI",
                columns: new[] { "AttributesId", "KPIsId" });

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
                name: "IX_OPCRRatings_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings",
                column: "DUKPIAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DU~",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "OPCREvaluationId", "PerformanceMeasureId", "OPCRId", "DUKPIAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPs_KPIId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPIAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_KPIId",
                schema: "planning",
                table: "OPCRActivities",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRId", "DUKPIAssignmentId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignmentOPCR_OPCRsId",
                schema: "planning",
                table: "DUKPIAssignmentOPCR",
                column: "OPCRsId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttributeKPI_Attributes_AttributesId",
                schema: "planning",
                table: "AttributeKPI",
                column: "AttributesId",
                principalSchema: "planning",
                principalTable: "Attributes",
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
                name: "FK_KPIMFOPAP_KPIs_KPIsId",
                schema: "planning",
                table: "KPIMFOPAP",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIMFOPAP_MFOPAPs_MFOPAPsId",
                schema: "planning",
                table: "KPIMFOPAP",
                column: "MFOPAPsId",
                principalSchema: "planning",
                principalTable: "MFOPAPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPISDG_KPIs_KPIsId",
                schema: "planning",
                table: "KPISDG",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPISDG_SDGs_SDGsId",
                schema: "planning",
                table: "KPISDG",
                column: "SDGsId",
                principalSchema: "planning",
                principalTable: "SDGs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_OPCRActivities_KPIs_KPIId",
                schema: "planning",
                table: "OPCRActivities",
                column: "KPIId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRId",
                principalSchema: "planning",
                principalTable: "OPCRs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPs_KPIs_KPIId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "KPIId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPs_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "OPCRId",
                principalSchema: "planning",
                principalTable: "OPCRs",
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

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRRatings",
                column: "OPCRId",
                principalSchema: "planning",
                principalTable: "OPCRs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttributeKPI_Attributes_AttributesId",
                schema: "planning",
                table: "AttributeKPI");

            migrationBuilder.DropForeignKey(
                name: "FK_AttributeKPI_KPIs_KPIsId",
                schema: "planning",
                table: "AttributeKPI");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIMFOPAP_KPIs_KPIsId",
                schema: "planning",
                table: "KPIMFOPAP");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIMFOPAP_MFOPAPs_MFOPAPsId",
                schema: "planning",
                table: "KPIMFOPAP");

            migrationBuilder.DropForeignKey(
                name: "FK_KPISDG_KPIs_KPIsId",
                schema: "planning",
                table: "KPISDG");

            migrationBuilder.DropForeignKey(
                name: "FK_KPISDG_SDGs_SDGsId",
                schema: "planning",
                table: "KPISDG");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_KPIs_KPIId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPs_KPIs_KPIId",
                schema: "planning",
                table: "OPCRPAPs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPs_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRPAPs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_DUKPIAssignments_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRRatings_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropTable(
                name: "DUKPIAssignmentOPCR",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DU~",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPs_KPIId",
                schema: "planning",
                table: "OPCRPAPs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_KPIId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPIAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPISDG",
                schema: "planning",
                table: "KPISDG");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPIMFOPAP",
                schema: "planning",
                table: "KPIMFOPAP");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AttributeKPI",
                schema: "planning",
                table: "AttributeKPI");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropColumn(
                name: "KPIId",
                schema: "planning",
                table: "OPCRPAPs");

            migrationBuilder.DropColumn(
                name: "DUKPIAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropColumn(
                name: "KPIId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.RenameTable(
                name: "KPISDG",
                schema: "planning",
                newName: "KPISDGs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIMFOPAP",
                schema: "planning",
                newName: "MFOKPIs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "AttributeKPI",
                schema: "planning",
                newName: "KPIAttributes",
                newSchema: "planning");

            migrationBuilder.RenameColumn(
                name: "ProjectTitle",
                schema: "planning",
                table: "WFPs",
                newName: "ProgramTitle");

            migrationBuilder.RenameColumn(
                name: "OPCRId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "OPCRKPIId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRRatings_OPCRId",
                schema: "planning",
                table: "OPCRRatings",
                newName: "IX_OPCRRatings_OPCRKPIId");

            migrationBuilder.RenameColumn(
                name: "OPCRId",
                schema: "planning",
                table: "OPCRPAPs",
                newName: "OPCRKPIId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRPAPs_OPCRId",
                schema: "planning",
                table: "OPCRPAPs",
                newName: "IX_OPCRPAPs_OPCRKPIId");

            migrationBuilder.RenameColumn(
                name: "OPCRId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "OPCRKPIId");

            migrationBuilder.RenameIndex(
                name: "IX_KPISDG_SDGsId",
                schema: "planning",
                table: "KPISDGs",
                newName: "IX_KPISDGs_SDGsId");

            migrationBuilder.RenameIndex(
                name: "IX_KPIMFOPAP_MFOPAPsId",
                schema: "planning",
                table: "MFOKPIs",
                newName: "IX_MFOKPIs_MFOPAPsId");

            migrationBuilder.RenameIndex(
                name: "IX_AttributeKPI_KPIsId",
                schema: "planning",
                table: "KPIAttributes",
                newName: "IX_KPIAttributes_KPIsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPISDGs",
                schema: "planning",
                table: "KPISDGs",
                columns: new[] { "KPIsId", "SDGsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_MFOKPIs",
                schema: "planning",
                table: "MFOKPIs",
                columns: new[] { "KPIsId", "MFOPAPsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPIAttributes",
                schema: "planning",
                table: "KPIAttributes",
                columns: new[] { "AttributesId", "KPIsId" });

            migrationBuilder.CreateTable(
                name: "OPCRKPIs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_OPCRKPIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRKPIs_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRKPIs_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "OPCREvaluationId", "PerformanceMeasureId", "OPCRKPIId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRKPIId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRKPIId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPIs_KPIId",
                schema: "planning",
                table: "OPCRKPIs",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRKPIs_OPCRId_KPIId",
                schema: "planning",
                table: "OPCRKPIs",
                columns: new[] { "OPCRId", "KPIId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttributes_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttributes",
                column: "AttributesId",
                principalSchema: "planning",
                principalTable: "Attributes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttributes_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttributes",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPISDGs_KPIs_KPIsId",
                schema: "planning",
                table: "KPISDGs",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPISDGs_SDGs_SDGsId",
                schema: "planning",
                table: "KPISDGs",
                column: "SDGsId",
                principalSchema: "planning",
                principalTable: "SDGs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MFOKPIs_KPIs_KPIsId",
                schema: "planning",
                table: "MFOKPIs",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MFOKPIs_MFOPAPs_MFOPAPsId",
                schema: "planning",
                table: "MFOKPIs",
                column: "MFOPAPsId",
                principalSchema: "planning",
                principalTable: "MFOPAPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRKPIId",
                principalSchema: "planning",
                principalTable: "OPCRKPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPs_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRPAPs",
                column: "OPCRKPIId",
                principalSchema: "planning",
                principalTable: "OPCRKPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRRatings_OPCRKPIs_OPCRKPIId",
                schema: "planning",
                table: "OPCRRatings",
                column: "OPCRKPIId",
                principalSchema: "planning",
                principalTable: "OPCRKPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
