using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPPMPColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Drop indexes if they exist (may already be gone) ──────────────
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS planning.""IX_KPIMeasurements_Dimension"";
                DROP INDEX IF EXISTS planning.""IX_FYActiveKPIMeasurements_Dimension"";
            ");

            // ── Rename Dimension → Statement if the column still exists ───────
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'KPIMeasurements' 
                        AND column_name = 'Dimension'
                    ) THEN
                        ALTER TABLE planning.""KPIMeasurements"" RENAME COLUMN ""Dimension"" TO ""Statement"";
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'planning' 
                        AND table_name = 'FYActiveKPIMeasurements' 
                        AND column_name = 'Dimension'
                    ) THEN
                        ALTER TABLE planning.""FYActiveKPIMeasurements"" RENAME COLUMN ""Dimension"" TO ""Statement"";
                    END IF;
                END $$;
            ");

            // ── Add new KPIMeasurement / FYActiveKPIMeasurement columns ────────
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements""
                    ADD COLUMN IF NOT EXISTS ""Dimensions"" text[] NOT NULL DEFAULT '{}',
                    ADD COLUMN IF NOT EXISTS ""Name""       text    NOT NULL DEFAULT '';

                ALTER TABLE planning.""FYActiveKPIMeasurements""
                    ADD COLUMN IF NOT EXISTS ""Dimensions"" text[] NOT NULL DEFAULT '{}',
                    ADD COLUMN IF NOT EXISTS ""Name""       text    NOT NULL DEFAULT '';
            ");

            // ── Add new PPMPItem columns ───────────────────────────────────────
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""PPMPItems""
                    ADD COLUMN IF NOT EXISTS ""ProjectType""             text    NOT NULL DEFAULT 'Goods',
                    ADD COLUMN IF NOT EXISTS ""Remarks""                 text,
                    ADD COLUMN IF NOT EXISTS ""PreProcurementConference"" boolean,
                    ADD COLUMN IF NOT EXISTS ""ProcurementStartDate""    date,
                    ADD COLUMN IF NOT EXISTS ""ProcurementEndDate""      date,
                    ADD COLUMN IF NOT EXISTS ""ExpectedDeliveryStart""   date,
                    ADD COLUMN IF NOT EXISTS ""ExpectedDeliveryEnd""     date;
            ");

            // ── Create Agencies table ─────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "Agencies",
                schema: "planning",
                columns: table => new
                {
                    Id          = table.Column<Guid>(type: "uuid", nullable: false),
                    Name        = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Address     = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    LogoImage   = table.Column<byte[]>(type: "bytea", nullable: true),
                    CreatedAt   = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy   = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt   = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy   = table.Column<string>(type: "text", nullable: true),
                    IsDeleted   = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt   = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy   = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agencies", x => x.Id);
                });

            // ── Create GeneratedDocuments table ───────────────────────────────
            migrationBuilder.CreateTable(
                name: "GeneratedDocuments",
                schema: "planning",
                columns: table => new
                {
                    Id            = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType  = table.Column<string>(type: "text", nullable: false),
                    Format        = table.Column<string>(type: "text", nullable: false),
                    OfficeId      = table.Column<Guid>(type: "uuid", nullable: false),
                    StoragePath   = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    FileName      = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    FiscalYear    = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    GeneratedBy   = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GeneratedAt   = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt     = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy     = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt     = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy     = table.Column<string>(type: "text", nullable: true),
                    IsDeleted     = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt     = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy     = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeneratedDocuments_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_OfficeId",
                schema: "planning",
                table: "GeneratedDocuments",
                column: "OfficeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ── Drop new tables ───────────────────────────────────────────────
            migrationBuilder.DropTable(name: "Agencies",          schema: "planning");
            migrationBuilder.DropTable(name: "GeneratedDocuments", schema: "planning");

            // ── Drop PPMPItem columns ─────────────────────────────────────────
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""PPMPItems""
                    DROP COLUMN IF EXISTS ""ProjectType"",
                    DROP COLUMN IF EXISTS ""Remarks"",
                    DROP COLUMN IF EXISTS ""PreProcurementConference"",
                    DROP COLUMN IF EXISTS ""ProcurementStartDate"",
                    DROP COLUMN IF EXISTS ""ProcurementEndDate"",
                    DROP COLUMN IF EXISTS ""ExpectedDeliveryStart"",
                    DROP COLUMN IF EXISTS ""ExpectedDeliveryEnd"";
            ");

            // ── Drop KPIMeasurement / FYActiveKPIMeasurement columns ──────────
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements""
                    DROP COLUMN IF EXISTS ""Dimensions"",
                    DROP COLUMN IF EXISTS ""Name"";

                ALTER TABLE planning.""FYActiveKPIMeasurements""
                    DROP COLUMN IF EXISTS ""Dimensions"",
                    DROP COLUMN IF EXISTS ""Name"";
            ");

            // ── Rename Statement → Dimension if it exists ─────────────────────
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'planning'
                        AND table_name = 'KPIMeasurements'
                        AND column_name = 'Statement'
                    ) THEN
                        ALTER TABLE planning.""KPIMeasurements"" RENAME COLUMN ""Statement"" TO ""Dimension"";
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'planning'
                        AND table_name = 'FYActiveKPIMeasurements'
                        AND column_name = 'Statement'
                    ) THEN
                        ALTER TABLE planning.""FYActiveKPIMeasurements"" RENAME COLUMN ""Statement"" TO ""Dimension"";
                    END IF;
                END $$;
            ");

            // ── Recreate original indexes ─────────────────────────────────────
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_KPIMeasurements_Dimension""
                    ON planning.""KPIMeasurements"" (""Dimension"");

                CREATE INDEX IF NOT EXISTS ""IX_FYActiveKPIMeasurements_Dimension""
                    ON planning.""FYActiveKPIMeasurements"" (""Dimension"");
            ");
        }
    }
}