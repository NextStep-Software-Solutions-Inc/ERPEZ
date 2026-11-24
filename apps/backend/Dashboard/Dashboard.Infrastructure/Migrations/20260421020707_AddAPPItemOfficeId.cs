using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAPPItemOfficeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "IsFinal",
                schema: "planning",
                table: "APPs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "planning",
                table: "APPs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'planning'
                          AND table_name = 'APPs'
                          AND column_name = 'FiscalYear'
                    ) THEN
                        UPDATE ""planning"".""APPs"" a
                        SET ""FiscalYearId"" = fy.""Id""
                        FROM ""planning"".""FiscalYears"" fy
                        WHERE fy.""Year"" = a.""FiscalYear"";
                    END IF;
                END$$;

                UPDATE ""planning"".""APPItems"" ai
                SET ""OfficeId"" = du.""OfficeId""
                FROM ""planning"".""DeliveryUnits"" du
                WHERE ai.""DeliveryUnitId"" = du.""Id"";

                UPDATE ""planning"".""APPs"" a
                SET ""OfficeId"" = x.""OfficeId""
                FROM (
                    SELECT DISTINCT ON (ai.""APPId"") ai.""APPId"", ai.""OfficeId""
                    FROM ""planning"".""APPItems"" ai
                    WHERE ai.""OfficeId"" IS NOT NULL
                    ORDER BY ai.""APPId"", ai.""CreatedAt"", ai.""Id""
                ) x
                WHERE a.""Id"" = x.""APPId"";

                UPDATE ""planning"".""APPs""
                SET ""Name"" = ""APPNumber""
                WHERE ""Name"" IS NULL OR ""Name"" = '';
            ");

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM ""planning"".""APPs""
                        WHERE ""FiscalYearId"" IS NULL
                    ) THEN
                        RAISE EXCEPTION 'Migration AddAPPItemOfficeId failed: some APP rows could not be mapped to FiscalYearId.';
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM ""planning"".""APPs""
                        WHERE ""OfficeId"" IS NULL
                    ) THEN
                        RAISE EXCEPTION 'Migration AddAPPItemOfficeId failed: some APP rows could not be mapped to OfficeId.';
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM ""planning"".""APPItems""
                        WHERE ""OfficeId"" IS NULL
                    ) THEN
                        RAISE EXCEPTION 'Migration AddAPPItemOfficeId failed: some APPItem rows could not be mapped to OfficeId.';
                    END IF;
                END$$;
            ");

            migrationBuilder.AlterColumn<Guid>(
                name: "FiscalYearId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OfficeId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'planning'
                          AND table_name = 'APPs'
                          AND column_name = 'FiscalYear'
                    ) THEN
                        IF EXISTS (
                            SELECT 1
                            FROM pg_indexes
                            WHERE schemaname = 'planning'
                              AND tablename = 'APPs'
                              AND indexname = 'IX_APPs_FiscalYear'
                        ) THEN
                            EXECUTE 'DROP INDEX ""planning"".""IX_APPs_FiscalYear""';
                        END IF;

                        ALTER TABLE ""planning"".""APPs"" DROP COLUMN ""FiscalYear"";
                    END IF;
                END$$;
            ");

            migrationBuilder.CreateTable(
                name: "APP_PPMP_Selections",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APPId = table.Column<Guid>(type: "uuid", nullable: false),
                    PPMPId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_APP_PPMP_Selections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APP_PPMP_Selections_APPs_APPId",
                        column: x => x.APPId,
                        principalSchema: "planning",
                        principalTable: "APPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APP_PPMP_Selections_PPMPs_PPMPId",
                        column: x => x.PPMPId,
                        principalSchema: "planning",
                        principalTable: "PPMPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_APPs_FiscalYearId",
                schema: "planning",
                table: "APPs",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_APPs_OfficeId",
                schema: "planning",
                table: "APPs",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_OfficeId",
                schema: "planning",
                table: "APPItems",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_APPId_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                columns: new[] { "APPId", "PPMPId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                column: "PPMPId");

            migrationBuilder.AddForeignKey(
                name: "FK_APPItems_Offices_OfficeId",
                schema: "planning",
                table: "APPItems",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_APPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "APPs",
                column: "FiscalYearId",
                principalSchema: "planning",
                principalTable: "FiscalYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_APPs_Offices_OfficeId",
                schema: "planning",
                table: "APPs",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_APPItems_Offices_OfficeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropForeignKey(
                name: "FK_APPs_FiscalYears_FiscalYearId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropForeignKey(
                name: "FK_APPs_Offices_OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropTable(
                name: "APP_PPMP_Selections",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_APPs_FiscalYearId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APPs_OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_OfficeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "FiscalYearId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "OfficeId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.AlterColumn<string>(
                name: "IsFinal",
                schema: "planning",
                table: "APPs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "FiscalYear",
                schema: "planning",
                table: "APPs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_APPs_FiscalYear",
                schema: "planning",
                table: "APPs",
                column: "FiscalYear");
        }
    }
}
