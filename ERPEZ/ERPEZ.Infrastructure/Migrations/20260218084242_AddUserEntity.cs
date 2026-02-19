using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeNumber = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    NameExtension = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    EmploymentStatus = table.Column<string>(type: "text", nullable: false),
                    DateHired = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateSeparated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PMTMembers_EmployeeId",
                schema: "planning",
                table: "PMTMembers",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonnelPositions_UserId",
                schema: "planning",
                table: "PersonnelPositions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_OfficeId",
                schema: "planning",
                table: "Users",
                column: "OfficeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonnelPositions_Users_UserId",
                schema: "planning",
                table: "PersonnelPositions",
                column: "UserId",
                principalSchema: "planning",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonnelPositions_Users_UserId",
                schema: "planning",
                table: "PersonnelPositions");

            migrationBuilder.DropForeignKey(
                name: "FK_PMTMembers_Users_EmployeeId",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_PMTMembers_EmployeeId",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.DropIndex(
                name: "IX_PersonnelPositions_UserId",
                schema: "planning",
                table: "PersonnelPositions");
        }
    }
}
