using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWFPIdAndCleanupSchemaChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Conditionally drop FK if it exists (may not exist in all databases)
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname LIKE 'FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment%'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""OPCRActivities"" 
                        DROP CONSTRAINT ""FK_OPCRActivities_DUKPITargetAssignments_DUKPITargetAssignment~"";
                    END IF;
                END $$;
            ");

            // Conditionally drop FK constraints if they exist
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- Drop FK_OPCRActivities_OPCRs_OPCRId if exists
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_OPCRActivities_OPCRs_OPCRId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""OPCRActivities"" DROP CONSTRAINT ""FK_OPCRActivities_OPCRs_OPCRId"";
                    END IF;
                    
                    -- Drop FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId if exists
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""OPCRPAPDepartments"" DROP CONSTRAINT ""FK_OPCRPAPDepartments_DeliveryUnits_DeliveryUnitId"";
                    END IF;
                    
                    -- Drop FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId if exists
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivities"" DROP CONSTRAINT ""FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId"";
                    END IF;
                END $$;
            ");

            // Conditionally drop tables if they exist
            migrationBuilder.Sql(@"
                DROP TABLE IF EXISTS planning.""DeliveryUnitOPCRActivity"" CASCADE;
                DROP TABLE IF EXISTS planning.""OPCRPAPs"" CASCADE;
            ");

            // Conditionally drop indexes if they exist
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS planning.""IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName"";
                DROP INDEX IF EXISTS planning.""IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName_Indicator"";
                DROP INDEX IF EXISTS planning.""IX_OPCRActivities_DUKPITargetAssignmentId"";
                DROP INDEX IF EXISTS planning.""IX_OPCRActivities_OPCRId_DUKPITargetAssignmentId_Name"";
            ");

            // Conditionally drop column if it exists
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRActivities' 
                        AND column_name = 'DUKPITargetAssignmentId'
                    ) THEN
                        ALTER TABLE planning.""OPCRActivities"" DROP COLUMN ""DUKPITargetAssignmentId"";
                    END IF;
                END $$;
            ");

            // Conditionally rename OPCRPAPDepartments.DeliveryUnitId to OfficeId
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- Only rename if DeliveryUnitId exists AND OfficeId doesn't exist
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRPAPDepartments' 
                        AND column_name = 'DeliveryUnitId'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRPAPDepartments' 
                        AND column_name = 'OfficeId'
                    ) THEN
                        ALTER TABLE planning.""OPCRPAPDepartments"" 
                        RENAME COLUMN ""DeliveryUnitId"" TO ""OfficeId"";
                        
                        -- Rename indexes
                        ALTER INDEX IF EXISTS planning.""IX_OPCRPAPDepartments_OPCRActivityId_DeliveryUnitId"" 
                        RENAME TO ""IX_OPCRPAPDepartments_OPCRActivityId_OfficeId"";
                        
                        ALTER INDEX IF EXISTS planning.""IX_OPCRPAPDepartments_DeliveryUnitId"" 
                        RENAME TO ""IX_OPCRPAPDepartments_OfficeId"";
                    END IF;
                END $$;
            ");

            // Conditionally rename OPCRActivities.OPCRId to OPCRItemId
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- Only rename if OPCRId exists AND OPCRItemId doesn't exist
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRActivities' 
                        AND column_name = 'OPCRId'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRActivities' 
                        AND column_name = 'OPCRItemId'
                    ) THEN
                        ALTER TABLE planning.""OPCRActivities"" 
                        RENAME COLUMN ""OPCRId"" TO ""OPCRItemId"";
                    END IF;
                END $$;
            ");

            // Conditionally alter WFPObjectiveActivityExpenditures.UnitCost type
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- Check if column exists and needs type change
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'WFPObjectiveActivityExpenditures' 
                        AND column_name = 'UnitCost'
                        AND data_type = 'numeric'
                        AND numeric_precision = 18
                        AND numeric_scale = 2
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivityExpenditures"" 
                        ALTER COLUMN ""UnitCost"" TYPE numeric;
                    END IF;
                END $$;
            ");

            // Conditionally alter WFPObjectiveActivities.WFPObjectiveId to nullable
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- Check if column exists and is NOT NULL
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'WFPObjectiveActivities' 
                        AND column_name = 'WFPObjectiveId'
                        AND is_nullable = 'NO'
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivities"" 
                        ALTER COLUMN ""WFPObjectiveId"" DROP NOT NULL;
                    END IF;
                END $$;
            ");

            // Conditionally add WFPId column if it doesn't exist
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'WFPObjectiveActivities' 
                        AND column_name = 'WFPId'
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivities"" 
                        ADD COLUMN ""WFPId"" uuid NULL;
                    END IF;
                END $$;
            ");

            // Conditionally add Code column to OPCRs if it doesn't exist
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'OPCRs' 
                        AND column_name = 'Code'
                    ) THEN
                        ALTER TABLE planning.""OPCRs"" 
                        ADD COLUMN ""Code"" text NOT NULL DEFAULT '';
                    END IF;
                END $$;
            ");

            // Conditionally create OPCRItems table if it doesn't exist
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS planning.""OPCRItems"" (
                    ""Id"" uuid NOT NULL,
                    ""OPCRId"" uuid NOT NULL,
                    ""KPIAssignmentId"" uuid NOT NULL,
                    ""Q1Target"" integer NOT NULL,
                    ""Q2Target"" integer NOT NULL,
                    ""Q3Target"" integer NOT NULL,
                    ""Q4Target"" integer NOT NULL,
                    ""IsShopped"" boolean NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text NOT NULL,
                    ""UpdatedAt"" timestamp with time zone NULL,
                    ""UpdatedBy"" text NULL,
                    ""IsDeleted"" boolean NOT NULL,
                    ""DeletedAt"" timestamp with time zone NULL,
                    ""DeletedBy"" text NULL,
                    CONSTRAINT ""PK_OPCRItems"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_OPCRItems_KPIAssignments_KPIAssignmentId"" 
                        FOREIGN KEY (""KPIAssignmentId"") 
                        REFERENCES planning.""KPIAssignments"" (""Id"") 
                        ON DELETE CASCADE,
                    CONSTRAINT ""FK_OPCRItems_OPCRs_OPCRId"" 
                        FOREIGN KEY (""OPCRId"") 
                        REFERENCES planning.""OPCRs"" (""Id"") 
                        ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS ""IX_OPCRItems_KPIAssignmentId"" 
                ON planning.""OPCRItems"" (""KPIAssignmentId"");
                
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_OPCRItems_OPCRId_KPIAssignmentId"" 
                ON planning.""OPCRItems"" (""OPCRId"", ""KPIAssignmentId"");
            ");

            // Conditionally create indexes if they don't exist
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_WFPObjectiveActivities_WFPId"" 
                ON planning.""WFPObjectiveActivities"" (""WFPId"");
                
                CREATE INDEX IF NOT EXISTS ""IX_WFPObjectiveActivities_WFPObjectiveId"" 
                ON planning.""WFPObjectiveActivities"" (""WFPObjectiveId"");
                
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_OPCRActivities_OPCRItemId_Name"" 
                ON planning.""OPCRActivities"" (""OPCRItemId"", ""Name"");
            ");

            // Conditionally add foreign keys if they don't exist
            migrationBuilder.Sql(@"
                DO $$ 
                BEGIN
                    -- FK_OPCRActivities_OPCRItems_OPCRItemId
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_OPCRActivities_OPCRItems_OPCRItemId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""OPCRActivities"" 
                        ADD CONSTRAINT ""FK_OPCRActivities_OPCRItems_OPCRItemId"" 
                        FOREIGN KEY (""OPCRItemId"") 
                        REFERENCES planning.""OPCRItems"" (""Id"") 
                        ON DELETE CASCADE;
                    END IF;
                    
                    -- FK_OPCRPAPDepartments_Offices_OfficeId
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_OPCRPAPDepartments_Offices_OfficeId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""OPCRPAPDepartments"" 
                        ADD CONSTRAINT ""FK_OPCRPAPDepartments_Offices_OfficeId"" 
                        FOREIGN KEY (""OfficeId"") 
                        REFERENCES planning.""Offices"" (""Id"") 
                        ON DELETE CASCADE;
                    END IF;
                    
                    -- FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivities"" 
                        ADD CONSTRAINT ""FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId"" 
                        FOREIGN KEY (""WFPObjectiveId"") 
                        REFERENCES planning.""WFPObjectives"" (""Id"");
                    END IF;
                    
                    -- FK_WFPObjectiveActivities_WFPs_WFPId
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_WFPObjectiveActivities_WFPs_WFPId'
                        AND connamespace = 'planning'::regnamespace
                    ) THEN
                        ALTER TABLE planning.""WFPObjectiveActivities"" 
                        ADD CONSTRAINT ""FK_WFPObjectiveActivities_WFPs_WFPId"" 
                        FOREIGN KEY (""WFPId"") 
                        REFERENCES planning.""WFPs"" (""Id"");
                    END IF;
                END $$;
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
                name: "FK_OPCRPAPDepartments_Offices_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPObjectiveActivities_WFPs_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropTable(
                name: "OPCRItems",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveActivities_WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveActivities_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropColumn(
                name: "WFPId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropColumn(
                name: "Code",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.RenameColumn(
                name: "OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                newName: "DeliveryUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                newName: "IX_OPCRPAPDepartments_OPCRActivityId_DeliveryUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_OPCRPAPDepartments_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                newName: "IX_OPCRPAPDepartments_DeliveryUnitId");

            migrationBuilder.RenameColumn(
                name: "OPCRItemId",
                schema: "planning",
                table: "OPCRActivities",
                newName: "OPCRId");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures",
                type: "numeric(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DUKPITargetAssignmentId",
                schema: "planning",
                table: "OPCRActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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
                name: "IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName",
                schema: "planning",
                table: "WFPObjectiveActivities",
                columns: new[] { "WFPObjectiveId", "ActivityName" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivities_WFPObjectiveId_ActivityName_Indicator",
                schema: "planning",
                table: "WFPObjectiveActivities",
                columns: new[] { "WFPObjectiveId", "ActivityName", "Indicator" },
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
                name: "FK_WFPObjectiveActivities_WFPObjectives_WFPObjectiveId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                column: "WFPObjectiveId",
                principalSchema: "planning",
                principalTable: "WFPObjectives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
