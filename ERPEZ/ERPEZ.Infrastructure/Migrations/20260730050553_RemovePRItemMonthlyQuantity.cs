using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePRItemMonthlyQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PRItemMonthlyQuantities",
                schema: "procurement");

            migrationBuilder.AddColumn<string>(
                name: "RequestedMonth",
                schema: "procurement",
                table: "PRItems",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequestedMonth",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.CreateTable(
                name: "PRItemMonthlyQuantities",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Month = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PRItemMonthlyQuantities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PRItemMonthlyQuantities_PRItems_PRItemId",
                        column: x => x.PRItemId,
                        principalSchema: "procurement",
                        principalTable: "PRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PRItemMonthlyQuantities_PRItemId_Month",
                schema: "procurement",
                table: "PRItemMonthlyQuantities",
                columns: new[] { "PRItemId", "Month" },
                unique: true);
        }
    }
}
