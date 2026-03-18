using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFYActiveKPIMeasurementMOVsToTextArray : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""FYActiveKPIMeasurements""
                ALTER COLUMN ""MOVs"" TYPE text[]
                USING CASE
                    WHEN ""MOVs"" IS NULL THEN ARRAY[]::text[]
                    ELSE ARRAY(SELECT jsonb_array_elements_text(""MOVs""))
                END;

                ALTER TABLE planning.""FYActiveKPIMeasurements""
                ALTER COLUMN ""MOVs"" SET DEFAULT '{}';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""FYActiveKPIMeasurements""
                ALTER COLUMN ""MOVs"" TYPE jsonb
                USING COALESCE(to_jsonb(""MOVs""), '[]'::jsonb);

                ALTER TABLE planning.""FYActiveKPIMeasurements""
                ALTER COLUMN ""MOVs"" SET DEFAULT '[]'::jsonb;
            ");
        }
    }
}
