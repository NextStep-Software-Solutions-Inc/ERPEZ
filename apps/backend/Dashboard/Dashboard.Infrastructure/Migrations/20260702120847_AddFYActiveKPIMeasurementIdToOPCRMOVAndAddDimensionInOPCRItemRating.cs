using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFYActiveKPIMeasurementIdToOPCRMOVAndAddDimensionInOPCRItemRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_RequirementName",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.AddColumn<string>(
                name: "Dimension",
                schema: "planning",
                table: "OPCRItemRatings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
                WITH candidate_measurements AS (
                    SELECT
                        mov.""Id"" AS mov_id,
                        fam.""Id"" AS measurement_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY mov.""Id""
                            ORDER BY
                                CASE
                                    WHEN mov.""RequirementName"" = ANY(fam.""MOVs"") THEN 0
                                    ELSE 1
                                END,
                                fam.""Id""
                        ) AS rn
                    FROM planning.""OPCRItemMOVs"" mov
                    INNER JOIN planning.""OPCRItems"" item
                        ON item.""Id"" = mov.""OPCRItemId""
                    INNER JOIN planning.""KPIAssignments"" ka
                        ON ka.""Id"" = item.""KPIAssignmentId""
                    INNER JOIN planning.""FYActiveKPIMeasurements"" fam
                        ON fam.""FYActiveKPIId"" = ka.""FYActiveKPIId""
                )
                UPDATE planning.""OPCRItemMOVs"" mov
                SET ""FYActiveKPIMeasurementId"" = c.measurement_id
                FROM candidate_measurements c
                WHERE mov.""Id"" = c.mov_id
                  AND c.rn = 1;
            ");

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM planning.""OPCRItemMOVs""
                        WHERE ""FYActiveKPIMeasurementId"" IS NULL
                    ) THEN
                        RAISE EXCEPTION 'Migration failed: some OPCRItemMOV rows could not be mapped to FYActiveKPIMeasurements.';
                    END IF;
                END $$;
            ");

            migrationBuilder.AlterColumn<Guid>(
                name: "FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId_Dimension",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "OPCRItemId", "FYActiveKPIMeasurementId", "Dimension" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs",
                column: "FYActiveKPIMeasurementId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_FYActiveKPIMeasurementId_RequirementName",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "OPCRItemId", "FYActiveKPIMeasurementId", "RequirementName" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRItemMOVs_FYActiveKPIMeasurements_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs",
                column: "FYActiveKPIMeasurementId",
                principalSchema: "planning",
                principalTable: "FYActiveKPIMeasurements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRItemMOVs_FYActiveKPIMeasurements_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId_Dimension",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_FYActiveKPIMeasurementId_RequirementName",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropColumn(
                name: "Dimension",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropColumn(
                name: "FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "OPCRItemId", "FYActiveKPIMeasurementId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_RequirementName",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "OPCRItemId", "RequirementName" },
                unique: true);
        }
    }
}
