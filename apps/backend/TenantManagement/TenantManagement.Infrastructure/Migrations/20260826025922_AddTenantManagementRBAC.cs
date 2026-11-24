using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantManagementRBAC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantMember_Tenants_TenantId",
                schema: "public",
                table: "TenantMember");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TenantMember",
                schema: "public",
                table: "TenantMember");

            migrationBuilder.DropIndex(
                name: "IX_TenantMember_TenantId_UserId",
                schema: "public",
                table: "TenantMember");

            migrationBuilder.RenameTable(
                name: "TenantMember",
                schema: "public",
                newName: "TenantMembers",
                newSchema: "public");

            migrationBuilder.AddColumn<string>(
                name: "ExternalIdentityId",
                schema: "public",
                table: "TenantMembers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TenantMembers",
                schema: "public",
                table: "TenantMembers",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Permissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Module = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NormalizedName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsSystemRole = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "public",
                columns: table => new
                {
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.RoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalSchema: "public",
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantMemberRoleAssignments",
                schema: "public",
                columns: table => new
                {
                    TenantMemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMemberRoleAssignments", x => new { x.TenantMemberId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_TenantMemberRoleAssignments_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantMemberRoleAssignments_TenantMembers_TenantMemberId",
                        column: x => x.TenantMemberId,
                        principalSchema: "public",
                        principalTable: "TenantMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_Permissions_Key",
                schema: "public",
                table: "Permissions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                schema: "public",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_NormalizedName",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberRoleAssignments_RoleId",
                schema: "public",
                table: "TenantMemberRoleAssignments",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantMembers_Tenants_TenantId",
                schema: "public",
                table: "TenantMembers",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantMembers_Tenants_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "TenantMemberRoleAssignments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Permissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "public");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TenantMembers",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_ExternalIdentityId_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "ExternalIdentityId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.RenameTable(
                name: "TenantMembers",
                schema: "public",
                newName: "TenantMember",
                newSchema: "public");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TenantMember",
                schema: "public",
                table: "TenantMember",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMember_TenantId_UserId",
                schema: "public",
                table: "TenantMember",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantMember_Tenants_TenantId",
                schema: "public",
                table: "TenantMember",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
