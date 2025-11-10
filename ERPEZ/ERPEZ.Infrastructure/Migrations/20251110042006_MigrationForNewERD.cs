using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    public partial class MigrationForNewERD : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Define a stable Guid for the default Cluster to assign to existing Offices
            var defaultClusterId = "11111111-1111-1111-1111-111111111111";

            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropTable(
                name: "KPIAssignment",
                schema: "catalog");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId_ObjectId_ItemDescr~",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            // Migration for OPCRPAPDepartment/DeliveryUnitOPCRActivity has been removed to avoid conflicts.

            migrationBuilder.AddColumn<Guid>(
                name: "WFPId1",
                schema: "catalog",
                table: "WFPObjectives",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                schema: "catalog",
                table: "WFPObjectives",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            // Add the new non-nullable ClusterId column with the temporary default value
            migrationBuilder.AddColumn<Guid>(
                name: "ClusterId",
                schema: "catalog",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid(defaultClusterId)); // Use the defaultClusterId Guid

            migrationBuilder.AddColumn<Guid>(
                name: "KPIId1",
                schema: "catalog",
                table: "KPITargets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "WFPObjectiveTargetId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Attributes",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "Attributes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Clusters",
                schema: "catalog",
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

            // FIX: Insert the default cluster now that the Clusters table exists
            migrationBuilder.InsertData(
                schema: "catalog",
                table: "Clusters",
                columns: new[] { "Id", "Name", "Description", "CreatedBy", "CreatedAt", "IsDeleted" },
                values: new object[] {
                    new Guid(defaultClusterId),
                    "Unassigned Cluster",
                    "Default cluster for all existing offices prior to migration.",
                    "Migration",
                    DateTime.Parse("2025-11-10T00:00:00Z").ToUniversalTime(),
                    false
                });

            // FIX: Apply the defaultClusterId to all existing offices.
            // This is necessary because EF Core's default value for the new column 
            // is applied to existing rows, and that default value must exist in the Clusters table.
            migrationBuilder.Sql(
                $"UPDATE catalog.\"Offices\" SET \"ClusterId\" = '{defaultClusterId}' WHERE \"ClusterId\" = '{new Guid(defaultClusterId)}'");


            migrationBuilder.CreateTable(
                name: "DUKPIAssignment",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPITargets_KPITargetId",
                        column: x => x.KPITargetId,
                        principalSchema: "catalog",
                        principalTable: "KPITargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "catalog",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DUKPIAssignment_KPIs_KPIId1",
                        column: x => x.KPIId1,
                        principalSchema: "catalog",
                        principalTable: "KPIs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SDGs",
                schema: "catalog",
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
                name: "WFPObjectiveTargets",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPIAttribute",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "Attributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIAttribute_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "catalog",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPISDGs",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPISDGs_SDGs_SDGsId",
                        column: x => x.SDGsId,
                        principalSchema: "catalog",
                        principalTable: "SDGs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTimelines",
                schema: "catalog",
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
                        principalSchema: "catalog",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "catalog",
                table: "WFPObjectives",
                columns: new[] { "WFPId", "Description" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId1",
                schema: "catalog",
                table: "WFPObjectives",
                column: "WFPId1");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_ClusterId",
                schema: "catalog",
                table: "Offices",
                column: "ClusterId");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period",
                schema: "catalog",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId1",
                schema: "catalog",
                table: "KPITargets",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets",
                column: "ParentKPITargetId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPObjectiveTargetId_ObjectId_It~",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });

            migrationBuilder.CreateIndex(
                name: "IX_Attributes_ParentAttributeId",
                schema: "catalog",
                table: "Attributes",
                column: "ParentAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_Name",
                schema: "catalog",
                table: "Clusters",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_DeliveryUnitId_KPITargetId",
                schema: "catalog",
                table: "DUKPIAssignment",
                columns: new[] { "DeliveryUnitId", "KPITargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPIId",
                schema: "catalog",
                table: "DUKPIAssignment",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPIId1",
                schema: "catalog",
                table: "DUKPIAssignment",
                column: "KPIId1");

            migrationBuilder.CreateIndex(
                name: "IX_DUKPIAssignment_KPITargetId",
                schema: "catalog",
                table: "DUKPIAssignment",
                column: "KPITargetId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIAttribute_KPIsId",
                schema: "catalog",
                table: "KPIAttribute",
                column: "KPIsId");

            migrationBuilder.CreateIndex(
                name: "IX_KPISDGs_SDGsId",
                schema: "catalog",
                table: "KPISDGs",
                column: "SDGsId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargets_WFPObjectiveId_ActivityName_Indicator",
                schema: "catalog",
                table: "WFPObjectiveTargets",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveTargetId_StartDate_EndDate",
                schema: "catalog",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveTargetId", "StartDate", "EndDate" },
                unique: true);

            // This ForeignKey is now safe because all existing Office rows point to the newly inserted 'Unassigned Cluster'
            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "catalog",
                table: "Offices",
                column: "ClusterId",
                principalSchema: "catalog",
                principalTable: "Clusters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId",
                principalSchema: "catalog",
                principalTable: "WFPActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPObjectiveTargets_WFPObjective~",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                column: "WFPObjectiveTargetId",
                principalSchema: "catalog",
                principalTable: "WFPObjectiveTargets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPITargets_KPITargets_ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets",
                column: "ParentKPITargetId",
                principalSchema: "catalog",
                principalTable: "KPITargets",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_KPITargets_KPIs_KPIId1",
                schema: "catalog",
                table: "KPITargets",
                column: "KPIId1",
                principalSchema: "catalog",
                principalTable: "KPIs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPObjectives_WFPs_WFPId1",
                schema: "catalog",
                table: "WFPObjectives",
                column: "WFPId1",
                principalSchema: "catalog",
                principalTable: "WFPs",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPObjectiveTargets_WFPObjective~",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_KPITargets_KPITargets_ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropForeignKey(
                name: "FK_KPITargets_KPIs_KPIId1",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Clusters_ClusterId",
                schema: "catalog",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectives_WFPs_WFPId1",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropTable(
                name: "Clusters",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "DUKPIAssignment",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "KPIAttribute",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "KPISDGs",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTimelines",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "Attributes",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "SDGs",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "WFPObjectiveTargets",
                schema: "catalog");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId1",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_Offices_ClusterId",
                schema: "catalog",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId_Period",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId1",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropIndex(
                name: "IX_ActivityBudgetRequirements_WFPObjectiveTargetId_ObjectId_It~",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropColumn(
                name: "WFPId1",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropColumn(
                name: "Weight",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropColumn(
                name: "ClusterId",
                schema: "catalog",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "KPIId1",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropColumn(
                name: "ParentKPITargetId",
                schema: "catalog",
                table: "KPITargets");

            migrationBuilder.DropColumn(
                name: "WFPObjectiveTargetId",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.AlterColumn<Guid>(
                name: "WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            // Reverting the rename of the table to restore the original 'OPCRPAPDepartment'
            migrationBuilder.RenameTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "catalog",
                newName: "OPCRPAPDepartment",
                newSchema: "catalog");

            // Reverting the rename of the index
            migrationBuilder.RenameIndex(
                name: "IX_DeliveryUnitOPCRActivity_OPCRActivitiesId",
                schema: "catalog",
                table: "OPCRPAPDepartment",
                newName: "IX_OPCRPAPDepartment_OPCRActivitiesId");

            // Reverting the primary key change
            migrationBuilder.AddPrimaryKey(
                name: "PK_OPCRPAPDepartment",
                schema: "catalog",
                table: "OPCRPAPDepartment",
                columns: new[] { "DeliveryUnitsId", "OPCRActivitiesId" });

            // Recreating dropped/modified indexes and table
            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "catalog",
                table: "WFPObjectives",
                columns: new[] { "WFPId", "Description" });

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "catalog",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period", "QuarterName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId_ObjectId_ItemDescr~",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                columns: new[] { "WFPActivityId", "ObjectId", "ItemDescription" });

            migrationBuilder.CreateTable(
                name: "KPIAssignment",
                schema: "catalog",
                columns: table => new
                {
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPIAssignment", x => new { x.DeliveryUnitId, x.KPIId });
                    table.ForeignKey(
                        name: "FK_KPIAssignment_DeliveryUnit_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "catalog",
                        principalTable: "DeliveryUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KPIAssignment_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "catalog",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignment_KPIId",
                schema: "catalog",
                table: "KPIAssignment",
                column: "KPIId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId",
                principalSchema: "catalog",
                principalTable: "WFPActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Recreating original foreign keys for OPCRPAPDepartment
            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPDepartment_DeliveryUnit_DeliveryUnitsId",
                schema: "catalog",
                table: "OPCRPAPDepartment",
                column: "DeliveryUnitsId",
                principalSchema: "catalog",
                principalTable: "DeliveryUnit",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRPAPDepartment_OPCRActivities_OPCRActivitiesId",
                schema: "catalog",
                table: "OPCRPAPDepartment",
                column: "OPCRActivitiesId",
                principalSchema: "catalog",
                principalTable: "OPCRActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}