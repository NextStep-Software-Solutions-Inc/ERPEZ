using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantMemberRbacAndHardening : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_ExternalIdentityId_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_NormalizedName",
                schema: "public",
                table: "Roles");

            migrationBuilder.AddColumn<Guid>(
                name: "ConcurrencyStamp",
                schema: "public",
                table: "TenantMembers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "InvitationExpiresAtUtc",
                schema: "public",
                table: "TenantMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvitationTokenHash",
                schema: "public",
                table: "TenantMembers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAssignableToTenant",
                schema: "public",
                table: "Roles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "TenantAuditLogs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorExternalIdentityId = table.Column<string>(type: "text", nullable: false),
                    ActorEmail = table.Column<string>(type: "text", nullable: false),
                    TargetMemberId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetEmail = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    BeforeStateJson = table.Column<string>(type: "text", nullable: true),
                    AfterStateJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_TenantAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantAuditLogs_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_InvitationTokenHash",
                schema: "public",
                table: "TenantMembers",
                column: "InvitationTokenHash",
                unique: true,
                filter: "\"InvitationTokenHash\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "ExternalIdentityId" },
                unique: true,
                filter: "\"ExternalIdentityId\" != '' AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_IsAssignableToTenant_IsDeleted",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "IsAssignableToTenant", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_NormalizedName",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "NormalizedName" },
                unique: true,
                filter: "\"TenantId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAuditLogs_TenantId_CreatedAt",
                schema: "public",
                table: "TenantAuditLogs",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantAuditLogs",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_InvitationTokenHash",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId_ExternalIdentityId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_IsAssignableToTenant_IsDeleted",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_NormalizedName",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "ConcurrencyStamp",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "InvitationExpiresAtUtc",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "InvitationTokenHash",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "IsAssignableToTenant",
                schema: "public",
                table: "Roles");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_ExternalIdentityId_TenantId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "ExternalIdentityId", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId",
                schema: "public",
                table: "TenantMembers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_NormalizedName",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "NormalizedName" },
                unique: true);
        }
    }
}
