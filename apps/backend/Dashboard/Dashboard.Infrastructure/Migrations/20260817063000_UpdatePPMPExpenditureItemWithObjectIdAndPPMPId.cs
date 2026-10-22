using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePPMPExpenditureItemWithObjectIdAndPPMPId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Alter PPMPActivityId to be nullable (supporting project-level / activity-less expenditure items)
            migrationBuilder.AlterColumn<Guid>(
                name: "PPMPActivityId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            // 2. Add PPMPId as nullable initially for safe, deterministic backfill
            migrationBuilder.AddColumn<Guid>(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: true);

            // 3. Add ObjectId as nullable initially for safe, deterministic backfill
            migrationBuilder.AddColumn<Guid>(
                name: "ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: true);

            // 4. Deterministic Backfill: Populate PPMPId directly from linked PPMPActivity
            migrationBuilder.Sql(@"
                UPDATE planning.""PPMPExpenditureItems"" pei
                SET ""PPMPId"" = pa.""PPMPId""
                FROM planning.""PPMPActivities"" pa
                WHERE pei.""PPMPActivityId"" = pa.""Id""
                  AND pei.""PPMPId"" IS NULL;
            ");

            // 5. Deterministic Backfill: Populate ObjectId
            // Strategy A: From child PPMPItems linked to a CSE catalog item with an ObjectCodeId
            migrationBuilder.Sql(@"
                UPDATE planning.""PPMPExpenditureItems"" pei
                SET ""ObjectId"" = sub.object_id
                FROM (
                    SELECT pi.""PPMPExpenditureItemId"", pri.""ObjectCodeId"" AS object_id
                    FROM planning.""PPMPItems"" pi
                    JOIN planning.""ProcurementItems"" pri ON pi.""CSEItemId"" = pri.""Id""
                    WHERE pi.""CSEItemId"" IS NOT NULL 
                      AND pri.""ObjectCodeId"" IS NOT NULL
                      AND NOT pi.""IsDeleted""
                    GROUP BY pi.""PPMPExpenditureItemId"", pri.""ObjectCodeId""
                ) sub
                WHERE pei.""Id"" = sub.""PPMPExpenditureItemId"" 
                  AND pei.""ObjectId"" IS NULL;
            ");

            // Strategy B: From LineItemBudgetDetails where the parent PPMPActivity has exactly one distinct ObjectId
            migrationBuilder.Sql(@"
                UPDATE planning.""PPMPExpenditureItems"" pei
                SET ""ObjectId"" = sub.object_id
                FROM (
                    SELECT pa.""Id"" AS activity_id, MAX(libd.""ObjectId""::text)::uuid AS object_id
                    FROM planning.""PPMPActivities"" pa
                    JOIN planning.""LineItemBudgetDetails"" libd ON libd.""LineItemBudgetActivityId"" = pa.""LIBActivityId""
                    WHERE NOT libd.""IsDeleted""
                    GROUP BY pa.""Id""
                    HAVING COUNT(DISTINCT libd.""ObjectId"") = 1
                ) sub
                WHERE pei.""PPMPActivityId"" = sub.activity_id 
                  AND pei.""ObjectId"" IS NULL;
            ");

            // 6. Validation Guard: Check for any unmapped rows and abort with explicit error if found
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    unmapped_ppmp_count integer;
                    unmapped_object_count integer;
                BEGIN
                    SELECT COUNT(*) INTO unmapped_ppmp_count
                    FROM planning.""PPMPExpenditureItems""
                    WHERE ""PPMPId"" IS NULL;

                    IF unmapped_ppmp_count > 0 THEN
                        RAISE EXCEPTION 'Migration failed: % PPMPExpenditureItem record(s) could not be deterministically mapped to a PPMPId. Check PPMPActivity -> PPMP parent relationships.', unmapped_ppmp_count;
                    END IF;

                    SELECT COUNT(*) INTO unmapped_object_count
                    FROM planning.""PPMPExpenditureItems""
                    WHERE ""ObjectId"" IS NULL;

                    IF unmapped_object_count > 0 THEN
                        RAISE EXCEPTION 'Migration failed: % PPMPExpenditureItem record(s) could not be deterministically mapped to an ObjectId. LineItemBudgetDetails may have multiple or missing ObjectIds for the parent activity.', unmapped_object_count;
                    END IF;
                END $$;
            ");

            // 7. Enforce NOT NULL constraints on successfully backfilled columns
            migrationBuilder.AlterColumn<Guid>(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            // 8. Create Indexes
            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "PPMPId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "ObjectId");

            // 9. Attach Foreign Key Constraints
            migrationBuilder.AddForeignKey(
                name: "FK_PPMPExpenditureItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "PPMPId",
                principalSchema: "planning",
                principalTable: "PPMPs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PPMPExpenditureItems_Objects_ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                column: "ObjectId",
                principalSchema: "planning",
                principalTable: "Objects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PPMPExpenditureItems_Objects_ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PPMPExpenditureItems_PPMPs_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPExpenditureItems_ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPExpenditureItems_PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropColumn(
                name: "PPMPId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "PPMPActivityId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
