using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDirectContractings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                schema: "procurement",
                table: "DirectContractings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewRemarks",
                schema: "procurement",
                table: "DirectContractings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReviewedByUserId",
                schema: "procurement",
                table: "DirectContractings",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.DropColumn(
                name: "ReviewRemarks",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.DropColumn(
                name: "ReviewedByUserId",
                schema: "procurement",
                table: "DirectContractings");
        }
    }
}
