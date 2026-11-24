using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOPCRConsolidation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OPCRConsolidations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_OPCRConsolidations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRConsolidations_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs",
                column: "OPCRConsolidationId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRConsolidations_FiscalYearId",
                schema: "planning",
                table: "OPCRConsolidations",
                column: "FiscalYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_OPCRConsolidations_OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs",
                column: "OPCRConsolidationId",
                principalSchema: "planning",
                principalTable: "OPCRConsolidations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_OPCRConsolidations_OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropTable(
                name: "OPCRConsolidations",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "OPCRConsolidationId",
                schema: "planning",
                table: "OPCRs");
        }
    }
}
