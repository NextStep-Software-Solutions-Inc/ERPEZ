using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityCodeToProcurementActivityType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityCode",
                schema: "planning",
                table: "ProcurementActivityTypes",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementActivityTypes_ActivityCode",
                schema: "planning",
                table: "ProcurementActivityTypes",
                column: "ActivityCode",
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProcurementActivityTypes_ActivityCode",
                schema: "planning",
                table: "ProcurementActivityTypes");

            migrationBuilder.DropColumn(
                name: "ActivityCode",
                schema: "planning",
                table: "ProcurementActivityTypes");
        }
    }
}
