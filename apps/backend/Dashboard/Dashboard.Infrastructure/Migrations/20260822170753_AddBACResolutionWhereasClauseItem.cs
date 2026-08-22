using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBACResolutionWhereasClauseItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BACResolutionWhereasClauseItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BACResolutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    BACResolutionWhereasClauseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_BACResolutionWhereasClauseItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BACResolutionWhereasClauseItems_BACResolutionWhereasClauses~",
                        column: x => x.BACResolutionWhereasClauseId,
                        principalSchema: "planning",
                        principalTable: "BACResolutionWhereasClauses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BACResolutionWhereasClauseItems_BACResolutions_BACResolutio~",
                        column: x => x.BACResolutionId,
                        principalSchema: "procurement",
                        principalTable: "BACResolutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionWhereasClauseItems_BACResolutionId",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems",
                column: "BACResolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionWhereasClauseItems_BACResolutionWhereasClauseId",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems",
                column: "BACResolutionWhereasClauseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BACResolutionWhereasClauseItems",
                schema: "procurement");
        }
    }
}
