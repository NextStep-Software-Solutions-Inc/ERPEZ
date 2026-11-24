using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ImplementationOfMarketScoping : Migration
    {
        /// <summary>
        /// BREAKING CHANGE: This migration renames TargetLIBId to TargetLineItemBudgetActivityId and changes
        /// the foreign key target from LineItemBudgets to LineItemBudgetActivities.
        /// 
        /// PRECONDITION: This migration assumes one of the following:
        /// 1. This is a fresh database with no existing MarketScoping records, OR
        /// 2. All existing MarketScoping.TargetLIBId values have been migrated to valid LineItemBudgetActivities IDs
        /// 
        /// If upgrading from an existing database with MarketScoping records, manual data migration is required:
        /// - First migrate existing LineItemBudget IDs to their corresponding LineItemBudgetActivity IDs
        /// - Then apply this migration
        /// 
        /// Otherwise, the FK constraint creation will fail with referential integrity violations.
        /// </summary>
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgets_TargetLIBId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.RenameColumn(
                name: "TargetLIBId",
                schema: "planning",
                table: "MarketScopings",
                newName: "TargetLineItemBudgetActivityId");

            migrationBuilder.RenameIndex(
                name: "IX_MarketScopings_TargetLIBId",
                schema: "planning",
                table: "MarketScopings",
                newName: "IX_MarketScopings_TargetLineItemBudgetActivityId");

            migrationBuilder.AddColumn<Guid>(
                name: "ParameterSettingsId",
                schema: "planning",
                table: "MarketScopingParameters",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ActivitySettingsId",
                schema: "planning",
                table: "MarketScopingActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "MarketScopingActivitySettings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityType = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingActivitySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingParameterSettings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    GuidedQuestion = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingParameterSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameters_ParameterSettingsId",
                schema: "planning",
                table: "MarketScopingParameters",
                column: "ParameterSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivities_ActivitySettingsId",
                schema: "planning",
                table: "MarketScopingActivities",
                column: "ActivitySettingsId");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopingActivities_MarketScopingActivitySettings_Activ~",
                schema: "planning",
                table: "MarketScopingActivities",
                column: "ActivitySettingsId",
                principalSchema: "planning",
                principalTable: "MarketScopingActivitySettings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopingParameters_MarketScopingParameterSettings_Para~",
                schema: "planning",
                table: "MarketScopingParameters",
                column: "ParameterSettingsId",
                principalSchema: "planning",
                principalTable: "MarketScopingParameterSettings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                principalSchema: "planning",
                principalTable: "LineItemBudgetActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopingActivities_MarketScopingActivitySettings_Activ~",
                schema: "planning",
                table: "MarketScopingActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopingParameters_MarketScopingParameterSettings_Para~",
                schema: "planning",
                table: "MarketScopingParameters");

            migrationBuilder.DropForeignKey(
                name: "FK_MarketScopings_LineItemBudgetActivities_TargetLineItemBudge~",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropTable(
                name: "MarketScopingActivitySettings",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopingParameterSettings",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingParameters_ParameterSettingsId",
                schema: "planning",
                table: "MarketScopingParameters");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingActivities_ActivitySettingsId",
                schema: "planning",
                table: "MarketScopingActivities");

            migrationBuilder.DropColumn(
                name: "ParameterSettingsId",
                schema: "planning",
                table: "MarketScopingParameters");

            migrationBuilder.DropColumn(
                name: "ActivitySettingsId",
                schema: "planning",
                table: "MarketScopingActivities");

            migrationBuilder.RenameColumn(
                name: "TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                newName: "TargetLIBId");

            migrationBuilder.RenameIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                newName: "IX_MarketScopings_TargetLIBId");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketScopings_LineItemBudgets_TargetLIBId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLIBId",
                principalSchema: "planning",
                principalTable: "LineItemBudgets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
