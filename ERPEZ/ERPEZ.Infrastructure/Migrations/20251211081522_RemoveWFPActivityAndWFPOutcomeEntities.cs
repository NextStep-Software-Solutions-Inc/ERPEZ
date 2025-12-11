using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveWFPActivityAndWFPOutcomeEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPPAPs_WFPOutcomes_WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs");

            migrationBuilder.DropTable(
                name: "WFPActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "WFPOutcomes",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPs_WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs");

            migrationBuilder.DropIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropColumn(
                name: "WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs");

            migrationBuilder.DropColumn(
                name: "WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WFPOutcomes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPObjectiveId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPOutcomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPOutcomes_WFPObjectives_WFPObjectiveId",
                        column: x => x.WFPObjectiveId,
                        principalSchema: "planning",
                        principalTable: "WFPObjectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WFPActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPId = table.Column<Guid>(type: "uuid", nullable: false),
                    WFPOutcomeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Deliverable = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OutputIndicator = table.Column<string>(type: "text", nullable: false),
                    PersonsInvolved = table.Column<List<string>>(type: "text[]", nullable: true),
                    Timeframe = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WFPActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WFPActivities_WFPOutcomes_WFPOutcomeId",
                        column: x => x.WFPOutcomeId,
                        principalSchema: "planning",
                        principalTable: "WFPOutcomes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WFPActivities_WFPs_WFPId",
                        column: x => x.WFPId,
                        principalSchema: "planning",
                        principalTable: "WFPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPs_WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs",
                column: "WFPOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityBudgetRequirements_WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "planning",
                table: "WFPActivities",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPOutcomeId",
                schema: "planning",
                table: "WFPActivities",
                column: "WFPOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPOutcomes_WFPObjectiveId_Description",
                schema: "planning",
                table: "WFPOutcomes",
                columns: new[] { "WFPObjectiveId", "Description" });

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_WFPActivities_WFPActivityId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "WFPActivityId",
                principalSchema: "planning",
                principalTable: "WFPActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPPAPs_WFPOutcomes_WFPOutcomeId",
                schema: "planning",
                table: "WFPPAPs",
                column: "WFPOutcomeId",
                principalSchema: "planning",
                principalTable: "WFPOutcomes",
                principalColumn: "Id");
        }
    }
}
