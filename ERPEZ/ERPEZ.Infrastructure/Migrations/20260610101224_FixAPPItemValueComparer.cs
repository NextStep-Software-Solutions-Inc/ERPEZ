using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixAPPItemValueComparer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GeneratedDocuments_Offices_OfficeId",
                schema: "planning",
                table: "GeneratedDocuments");

            migrationBuilder.AddForeignKey(
                name: "FK_GeneratedDocuments_Offices_OfficeId",
                schema: "planning",
                table: "GeneratedDocuments",
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
                name: "FK_GeneratedDocuments_Offices_OfficeId",
                schema: "planning",
                table: "GeneratedDocuments");

            migrationBuilder.AddForeignKey(
                name: "FK_GeneratedDocuments_Offices_OfficeId",
                schema: "planning",
                table: "GeneratedDocuments",
                column: "OfficeId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
