using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangePlantillaTypeDurationToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""PlantillaTypes"" 
                ALTER COLUMN ""Duration"" TYPE integer 
                USING CASE 
                    WHEN ""Duration"" ~ '^[0-9]+$' THEN ""Duration""::integer 
                    ELSE NULL 
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Duration",
                schema: "planning",
                table: "PlantillaTypes",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
