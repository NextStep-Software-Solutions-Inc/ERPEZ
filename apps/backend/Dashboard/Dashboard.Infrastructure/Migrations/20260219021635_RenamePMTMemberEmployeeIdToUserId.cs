using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenamePMTMemberEmployeeIdToUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PMTMembers_Users_EmployeeId",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.RenameColumn(
                name: "EmployeeId",
                schema: "planning",
                table: "PMTMembers",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_PMTMembers_EmployeeId",
                schema: "planning",
                table: "PMTMembers",
                newName: "IX_PMTMembers_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_PMTMembers_Users_UserId",
                schema: "planning",
                table: "PMTMembers",
                column: "UserId",
                principalSchema: "planning",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PMTMembers_Users_UserId",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "planning",
                table: "PMTMembers",
                newName: "EmployeeId");

            migrationBuilder.RenameIndex(
                name: "IX_PMTMembers_UserId",
                schema: "planning",
                table: "PMTMembers",
                newName: "IX_PMTMembers_EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PMTMembers_Users_EmployeeId",
                schema: "planning",
                table: "PMTMembers",
                column: "EmployeeId",
                principalSchema: "planning",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
