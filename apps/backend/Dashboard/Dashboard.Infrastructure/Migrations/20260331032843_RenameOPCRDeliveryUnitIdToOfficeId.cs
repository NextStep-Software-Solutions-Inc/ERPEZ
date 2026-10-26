using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameOPCRDeliveryUnitIdToOfficeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop old FK and indexes only if they exist (may have been removed by a prior manual change)
            migrationBuilder.Sql(@"ALTER TABLE planning.""OPCRs"" DROP CONSTRAINT IF EXISTS ""FK_OPCRs_DeliveryUnits_DeliveryUnitId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS planning.""IX_OPCRs_DeliveryUnitId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS planning.""IX_OPCRs_RatingReturnedDate"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS planning.""IX_OPCRs_RatingStatus"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS planning.""IX_OPCRs_RatingSubmittedDate"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS planning.""IX_OPCRs_Status"";");

            // Rename column only if it still exists as DeliveryUnitId
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'planning' AND table_name = 'OPCRs' AND column_name = 'DeliveryUnitId'
                    ) THEN
                        ALTER TABLE planning.""OPCRs"" RENAME COLUMN ""DeliveryUnitId"" TO ""OfficeId"";
                    END IF;
                END $$;
            ");

            // Rename index only if it exists under the old name
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_indexes WHERE schemaname = 'planning' AND indexname = 'IX_OPCRs_DeliveryUnitId_FiscalYearId'
                    ) THEN
                        ALTER INDEX planning.""IX_OPCRs_DeliveryUnitId_FiscalYearId"" RENAME TO ""IX_OPCRs_OfficeId_FiscalYearId"";
                    END IF;
                END $$;
            ");

            // Update column types (idempotent AlterColumn)
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

            // Add FK to Offices only if not already present
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.table_constraints
                        WHERE constraint_schema = 'planning' AND constraint_name = 'FK_OPCRs_Offices_OfficeId'
                    ) THEN
                        ALTER TABLE planning.""OPCRs""
                            ADD CONSTRAINT ""FK_OPCRs_Offices_OfficeId""
                            FOREIGN KEY (""OfficeId"") REFERENCES planning.""Offices"" (""Id"") ON DELETE CASCADE;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_Offices_OfficeId",
                schema: "planning",
                table: "OPCRs");

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
