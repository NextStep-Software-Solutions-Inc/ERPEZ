using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeKPIMeasurementMOVsToTextArray : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop and recreate column to change type from jsonb to text[]
            // This will clear existing MOVs data
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements"" 
                DROP COLUMN ""MOVs"";
            ");
            
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements"" 
                ADD COLUMN ""MOVs"" text[] NOT NULL DEFAULT '{}';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop and recreate as jsonb
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements"" 
                DROP COLUMN ""MOVs"";
            ");
            
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""KPIMeasurements"" 
                ADD COLUMN ""MOVs"" jsonb NOT NULL DEFAULT '[]'::jsonb;
            ");
        }
    }
}
