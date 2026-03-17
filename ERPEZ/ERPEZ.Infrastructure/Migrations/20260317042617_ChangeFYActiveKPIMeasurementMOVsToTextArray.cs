using System.Collections.Generic;
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
            // Drop and recreate column to change type from jsonb to text[]
            migrationBuilder.Sql(@"ALTER TABLE planning.""FYActiveKPIMeasurements"" DROP COLUMN ""MOVs"";");
            migrationBuilder.Sql(@"ALTER TABLE planning.""FYActiveKPIMeasurements"" ADD COLUMN ""MOVs"" text[] NOT NULL DEFAULT '{}';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert back to jsonb
            migrationBuilder.Sql(@"ALTER TABLE planning.""FYActiveKPIMeasurements"" DROP COLUMN ""MOVs"";");
            migrationBuilder.Sql(@"ALTER TABLE planning.""FYActiveKPIMeasurements"" ADD COLUMN ""MOVs"" jsonb NOT NULL DEFAULT '[]'::jsonb;");
        }
    }
}
