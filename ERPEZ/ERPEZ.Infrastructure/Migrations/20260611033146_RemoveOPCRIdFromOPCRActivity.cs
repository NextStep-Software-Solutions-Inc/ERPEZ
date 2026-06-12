using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOPCRIdFromOPCRActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OPCRId",
                schema: "planning",
                table: "OPCRActivities");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OPCRId",
                schema: "planning",
                table: "OPCRActivities",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.Empty);
        }
    }
}