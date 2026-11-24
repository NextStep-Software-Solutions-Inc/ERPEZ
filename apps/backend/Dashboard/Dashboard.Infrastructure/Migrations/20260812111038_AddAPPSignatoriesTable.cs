using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAPPSignatoriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "APPSignatories",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    APPId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    PersonnelPositionId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleKey = table.Column<string>(type: "text", nullable: false),
                    SequenceOrder = table.Column<int>(type: "integer", nullable: false),
                    SignatureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Position = table.Column<string>(type: "text", nullable: false),
                    Department = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_APPSignatories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APPSignatories_APPs_APPId",
                        column: x => x.APPId,
                        principalSchema: "planning",
                        principalTable: "APPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_APPSignatories_PersonnelPositions_PersonnelPositionId",
                        column: x => x.PersonnelPositionId,
                        principalSchema: "planning",
                        principalTable: "PersonnelPositions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_APPSignatories_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "planning",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_APPSignatories_APPId",
                schema: "planning",
                table: "APPSignatories",
                column: "APPId");

            migrationBuilder.CreateIndex(
                name: "IX_APPSignatories_PersonnelPositionId",
                schema: "planning",
                table: "APPSignatories",
                column: "PersonnelPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_APPSignatories_UserId",
                schema: "planning",
                table: "APPSignatories",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "APPSignatories",
                schema: "planning");
        }
    }
}
