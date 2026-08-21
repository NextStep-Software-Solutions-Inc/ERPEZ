using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlannedQuantityToPPMPItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PlannedQuantity",
                schema: "planning",
                table: "PPMPItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(@"
                UPDATE ""planning"".""PPMPItems"" p
                SET ""PlannedQuantity"" = COALESCE((
                    SELECT SUM(a.""Quantity"")
                    FROM ""planning"".""PPMPItemAllocations"" a
                    WHERE a.""PPMPItemId"" = p.""Id""
                ), 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlannedQuantity",
                schema: "planning",
                table: "PPMPItems");
        }
    }
}
