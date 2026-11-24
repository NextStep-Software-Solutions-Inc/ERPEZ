using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetAllocationAndExpenseClassToDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BudgetAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineItemBudgetDetailId = table.Column<Guid>(type: "uuid", nullable: false),
                    BudgetPeriod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalAllocated = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_BudgetAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetAllocations_LineItemBudgetDetails_LineItemBudgetDetai~",
                        column: x => x.LineItemBudgetDetailId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgetDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "ExpenseClassId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAllocations_LineItemBudgetDetailId",
                schema: "planning",
                table: "BudgetAllocations",
                column: "LineItemBudgetDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItemBudgetDetails_ExpenseClasses_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                column: "ExpenseClassId",
                principalSchema: "planning",
                principalTable: "ExpenseClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItemBudgetDetails_ExpenseClasses_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropTable(
                name: "BudgetAllocations",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropColumn(
                name: "ExpenseClassId",
                schema: "planning",
                table: "LineItemBudgetDetails");
        }
    }
}
