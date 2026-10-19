using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleScopeAndSubscriptionPricingCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ContractedAnnualPrice",
                schema: "public",
                table: "TenantSubscriptions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ContractedMonthlyPrice",
                schema: "public",
                table: "TenantSubscriptions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubscriptionPlanPriceId",
                schema: "public",
                table: "TenantSubscriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Scope",
                schema: "public",
                table: "Roles",
                type: "text",
                nullable: false,
                defaultValue: "Unknown");

            // Deterministic Data Backfill for existing roles
            migrationBuilder.Sql(@"
                UPDATE ""Roles""
                SET ""Scope"" = 'TenantManagement'
                WHERE ""NormalizedName"" IN (
                    'TENANT ADMINISTRATOR',
                    'ORGANIZATION ADMINISTRATOR',
                    'BILLING ADMINISTRATOR',
                    'TENANT AUDITOR'
                );

                UPDATE ""Roles""
                SET ""Scope"" = 'Operational'
                WHERE ""NormalizedName"" IN (
                    'END USER',
                    'PLANNING OFFICER',
                    'FINANCE OFFICER',
                    'PROCUREMENT OFFICER',
                    'LIB APPROVER',
                    'WFP APPROVER',
                    'OPCR APPROVER',
                    'PPMP APPROVER',
                    'DASHBOARD SYSTEM ADMIN'
                );

                UPDATE ""Roles""
                SET ""Scope"" = 'ExternalPortal'
                WHERE ""NormalizedName"" IN (
                    'SUPPLIER',
                    'VENDOR',
                    'BIDDER'
                );

                UPDATE ""Roles""
                SET ""Scope"" = 'Unknown'
                WHERE ""Scope"" IS NULL OR ""Scope"" = '';
            ");

            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    MaxAllowedTenants = table.Column<int>(type: "integer", nullable: false),
                    MaxAllowedUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxAllowedStorageGb = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlanModules",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_SubscriptionPlanModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionPlanModules_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalSchema: "public",
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlanPrices",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    MonthlyPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    AnnualPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    EffectiveFromUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveToUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_SubscriptionPlanPrices", x => x.Id);
                    table.CheckConstraint("CK_SubscriptionPlanPrices_ValidInterval", "\"EffectiveToUtc\" IS NULL OR \"EffectiveToUtc\" > \"EffectiveFromUtc\"");
                    table.ForeignKey(
                        name: "FK_SubscriptionPlanPrices_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalSchema: "public",
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscriptions_SubscriptionPlanPriceId",
                schema: "public",
                table: "TenantSubscriptions",
                column: "SubscriptionPlanPriceId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanModules_SubscriptionPlanId_ModuleCode",
                schema: "public",
                table: "SubscriptionPlanModules",
                columns: new[] { "SubscriptionPlanId", "ModuleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanPrices_SubscriptionPlanId",
                schema: "public",
                table: "SubscriptionPlanPrices",
                column: "SubscriptionPlanId",
                unique: true,
                filter: "\"IsDefault\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlans_Code",
                schema: "public",
                table: "SubscriptionPlans",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantSubscriptions_SubscriptionPlanPrices_SubscriptionPlan~",
                schema: "public",
                table: "TenantSubscriptions",
                column: "SubscriptionPlanPriceId",
                principalSchema: "public",
                principalTable: "SubscriptionPlanPrices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantSubscriptions_SubscriptionPlanPrices_SubscriptionPlan~",
                schema: "public",
                table: "TenantSubscriptions");

            migrationBuilder.DropTable(
                name: "SubscriptionPlanModules",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SubscriptionPlanPrices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SubscriptionPlans",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_TenantSubscriptions_SubscriptionPlanPriceId",
                schema: "public",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "ContractedAnnualPrice",
                schema: "public",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "ContractedMonthlyPrice",
                schema: "public",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "SubscriptionPlanPriceId",
                schema: "public",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "Scope",
                schema: "public",
                table: "Roles");
        }
    }
}
