using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorOPCRToOfficeAndOPCRItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRPAPs",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DeliveryUnitId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_RatingReturnedDate",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_RatingStatus",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_RatingSubmittedDate",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_Status",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.RenameColumn(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "OPCRs",
                newName: "OfficeId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                newName: "IX_OPCRs_OfficeId_FiscalYearId");

            // Backfill OPCR.OfficeId from the old DeliveryUnit foreign key values.
            migrationBuilder.Sql(@"
                UPDATE planning.""OPCRs"" opcr
                SET ""OfficeId"" = du.""OfficeId""
                FROM planning.""DeliveryUnits"" du
                WHERE opcr.""OfficeId"" = du.""Id"";
            ");

            migrationBuilder.RenameColumn(
                name: "DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "OPCRItemId");

            // NOTE: OPCRItemId is intentionally left as the renamed column without backfill.
            // Old data will have NULL OPCRItemId; new data must provide a valid OPCRItemId.
            // The semantic relationship between DUKPITargetAssignment and OPCRItem is distinct
            // and requires business logic to map. Manual post-migration mapping is required.
            // A CHECK constraint below ensures data integrity by requiring OPCRId OR OPCRItemId.

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "RatingStatus",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                type: "uuid",
                nullable: true);

            // Backfill OPCRPAPDepartment.OfficeId from existing DeliveryUnit -> Office mapping.
            migrationBuilder.Sql(@"
                UPDATE planning.""OPCRPAPDepartments"" pap
                SET ""OfficeId"" = du.""OfficeId""
                FROM planning.""DeliveryUnits"" du
                WHERE pap.""DeliveryUnitId"" = du.""Id"";
            ");

            migrationBuilder.AlterColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "OPCRItems",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIAssignmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Q1Target = table.Column<int>(type: "integer", nullable: false),
                    Q2Target = table.Column<int>(type: "integer", nullable: false),
                    Q3Target = table.Column<int>(type: "integer", nullable: false),
                    Q4Target = table.Column<int>(type: "integer", nullable: false),
                    IsShopped = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_OPCRItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRItems_KPIAssignments_KPIAssignmentId",
                        column: x => x.KPIAssignmentId,
                        principalSchema: "planning",
                        principalTable: "KPIAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OPCRItems_OPCRs_OPCRId",
                        column: x => x.OPCRId,
                        principalSchema: "planning",
                        principalTable: "OPCRs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "OPCRActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "OPCRActivityId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRItemId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems",
                column: "KPIAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_OPCRId",
                schema: "planning",
                table: "OPCRItems",
                column: "OPCRId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_OPCRId_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems",
                columns: new[] { "OPCRId", "KPIAssignmentId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_OPCRItems_OPCRItemId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRItemId",
                principalSchema: "planning",
                principalTable: "OPCRItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRId",
                principalSchema: "planning",
                principalTable: "OPCRs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPDepartments_Offices_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_Offices_OfficeId",
                schema: "planning",
                table: "OPCRs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Enforce that OPCRActivities must reference either OPCR or OPCRItem (or both).
            // This ensures no orphaned activities and maintains referential integrity.
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""OPCRActivities""
                ADD CONSTRAINT CK_OPCRActivities_RequireOwner 
                CHECK (""OPCRId"" IS NOT NULL OR ""OPCRItemId"" IS NOT NULL);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_OPCRItems_OPCRItemId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRActivities_OPCRs_OPCRId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRPAPDepartments_Offices_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_Offices_OfficeId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropTable(
                name: "OPCRItems",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropColumn(
                name: "Code",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.RenameColumn(
                name: "OfficeId",
                schema: "planning",
                table: "OPCRs",
                newName: "DeliveryUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                newName: "IX_OPCRs_DeliveryUnitId_FiscalYearId");

            migrationBuilder.RenameColumn(
                name: "OPCRItemId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "DUKPITargetAssignmentId");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "planning",
                table: "OPCRs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "RatingStatus",
                schema: "planning",
                table: "OPCRs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "planning",
                table: "OPCRs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

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
                    table.ForeignKey(
                        name: "FK_DeliveryUnitOPCRActivity_OPCRActivities_OPCRActivitiesId",
                        column: x => x.OPCRActivitiesId,
                        principalSchema: "planning",
                        principalTable: "OPCRActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRPAPs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRId = table.Column<Guid>(type: "uuid", nullable: false),
                    Budget = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId",
                schema: "planning",
                table: "OPCRs",
                column: "DeliveryUnitId");

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
                name: "IX_OPCRPAPDepartments_OPCRActivityId_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "OPCRActivityId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPITargetAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRId", "DUKPITargetAssignmentId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnitOPCRActivity_OPCRActivitiesId",
                schema: "planning",
                table: "DeliveryUnitOPCRActivity",
                column: "OPCRActivitiesId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~",
                schema: "planning",
                table: "OPCRActivities",
                column: "DUKPITargetAssignmentId",
                principalSchema: "planning",
                principalTable: "DUKPITargetAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "OPCRs",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
