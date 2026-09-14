using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenseKeysAndOnPremiseControls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllowedDomain",
                schema: "public",
                table: "TenantSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MaxAllowedTenants",
                schema: "public",
                table: "TenantSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                schema: "public",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "LicenseKeys",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantSubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Prefix = table.Column<string>(type: "text", nullable: false),
                    BoundEmail = table.Column<string>(type: "text", nullable: false),
                    Plan = table.Column<string>(type: "text", nullable: false),
                    AllowedDomain = table.Column<string>(type: "text", nullable: false),
                    MaxTenants = table.Column<int>(type: "integer", nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsAirGapped = table.Column<bool>(type: "boolean", nullable: false),
                    Signature = table.Column<string>(type: "text", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_LicenseKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LicenseKeys_TenantSubscriptions_TenantSubscriptionId",
                        column: x => x.TenantSubscriptionId,
                        principalSchema: "public",
                        principalTable: "TenantSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LicenseKeys_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LicenseKeys_Key",
                schema: "public",
                table: "LicenseKeys",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LicenseKeys_TenantId",
                schema: "public",
                table: "LicenseKeys",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LicenseKeys_TenantSubscriptionId",
                schema: "public",
                table: "LicenseKeys",
                column: "TenantSubscriptionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LicenseKeys",
                schema: "public");

            migrationBuilder.DropColumn(
                name: "AllowedDomain",
                schema: "public",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "MaxAllowedTenants",
                schema: "public",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                schema: "public",
                table: "Tenants");
        }
    }
}
