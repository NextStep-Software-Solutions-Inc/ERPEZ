using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameActivityBudgetRequirementToWFPObjectiveTargetExpenditure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityBudgetRequirements",
                schema: "planning");

            migrationBuilder.CreateTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CostEstimates = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_WFPObjectiveTargetExpenditures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WFPObjectiveTargetExpenditures_WFPObjectiveTargets_WFPObjec~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_ObjectId",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTargetExpenditures_WFPObjectiveTargetId_ObjectI~",
                schema: "planning",
                table: "WFPObjectiveTargetExpenditures",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WFPObjectiveTargetExpenditures",
                schema: "planning");

            migrationBuilder.CreateTable(
                name: "ActivityBudgetRequirements",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveTargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    CostEstimates = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ItemDescription = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityBudgetRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityBudgetRequirements_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ActivityBudgetRequirements_WFPObjectiveTargets_WFPObjective~",
                        column: x => x.WFPObjectiveTargetId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectiveTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_ObjectId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPObjectiveTargetId_ObjectId_It~",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                columns: new[] { "WFPObjectiveTargetId", "ObjectId", "ItemDescription" });
        }
    }
}
