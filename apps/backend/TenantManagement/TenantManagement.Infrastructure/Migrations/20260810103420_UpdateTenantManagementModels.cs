using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTenantManagementModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.RenameTable(
                name: "TenantSubscriptions",
                schema: "catalog",
                newName: "TenantSubscriptions",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "TenantSettings",
                schema: "catalog",
                newName: "TenantSettings",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Tenants",
                schema: "catalog",
                newName: "Tenants",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "TenantModule",
                schema: "catalog",
                newName: "TenantModule",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "TenantMember",
                schema: "catalog",
                newName: "TenantMember",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Modules",
                schema: "catalog",
                newName: "Modules",
                newSchema: "public");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "public",
                table: "TenantSubscriptions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Plan",
                schema: "public",
                table: "TenantSubscriptions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "BillingCycle",
                schema: "public",
                table: "TenantSubscriptions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "public",
                table: "TenantSubscriptions",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "public",
                table: "TenantSettings",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "public",
                table: "Tenants",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "public",
                table: "TenantMember",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "public",
                table: "Modules",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.RenameTable(
                name: "TenantSubscriptions",
                schema: "public",
                newName: "TenantSubscriptions",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "TenantSettings",
                schema: "public",
                newName: "TenantSettings",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Tenants",
                schema: "public",
                newName: "Tenants",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "TenantModule",
                schema: "public",
                newName: "TenantModule",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "TenantMember",
                schema: "public",
                newName: "TenantMember",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Modules",
                schema: "public",
                newName: "Modules",
                newSchema: "catalog");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "catalog",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Plan",
                schema: "catalog",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "BillingCycle",
                schema: "catalog",
                table: "TenantSubscriptions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "TenantSubscriptions",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "TenantSettings",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "Tenants",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "TenantMember",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "Modules",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }
    }
}
