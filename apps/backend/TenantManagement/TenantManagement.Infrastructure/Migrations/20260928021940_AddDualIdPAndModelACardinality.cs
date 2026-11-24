using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDualIdPAndModelACardinality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.AddColumn<string>(
                name: "AuthProvider",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: false,
                defaultValue: "Keycloak");

            migrationBuilder.AddColumn<string>(
                name: "ExternalOrgId",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastFullReconciliationAtUtc",
                schema: "public",
                table: "Tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastProcessedEventId",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSuccessfulWebhookProcessingAtUtc",
                schema: "public",
                table: "Tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MembershipProjectionStatus",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: false,
                defaultValue: "Healthy");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastReconciledAtUtc",
                schema: "public",
                table: "TenantMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ProjectionVersion",
                schema: "public",
                table: "TenantMembers",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                schema: "public",
                table: "TenantMembers",
                type: "text",
                nullable: false,
                defaultValue: "Keycloak");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_AuthProvider_ExternalOrgId",
                schema: "public",
                table: "Tenants",
                columns: new[] { "AuthProvider", "ExternalOrgId" },
                unique: true,
                filter: "\"ExternalOrgId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_Provider_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "Provider", "ExternalIdentityId" },
                unique: true,
                filter: "\"ExternalIdentityId\" != '' AND \"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tenants_AuthProvider_ExternalOrgId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId_Provider_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "AuthProvider",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ExternalOrgId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LastFullReconciliationAtUtc",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LastProcessedEventId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LastSuccessfulWebhookProcessingAtUtc",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "MembershipProjectionStatus",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LastReconciledAtUtc",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "ProjectionVersion",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "Provider",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "ExternalIdentityId" },
                unique: true,
                filter: "\"ExternalIdentityId\" != '' AND \"IsDeleted\" = false");
        }
    }
}
