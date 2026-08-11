using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedSDGData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "planning",
                table: "SDGs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.InsertData(
                schema: "planning",
                table: "SDGs",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DeletedAt", "DeletedBy", "Description", "IsDeleted", "Name", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "End poverty in all its forms everywhere.", false, "Goal 1: No Poverty", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000002"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "End hunger, achieve food security, and promote sustainable agriculture.", false, "Goal 2: Zero Hunger", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000003"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Ensure healthy lives and promote well-being for all.", false, "Goal 3: Good Health and Well-being", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Ensure inclusive and equitable quality education for all.", false, "Goal 4: Quality Education", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Achieve gender equality and empower all women and girls.", false, "Goal 5: Gender Equality", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000006"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Ensure availability and sustainable management of water.", false, "Goal 6: Clean Water and Sanitation", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000007"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Ensure access to affordable, reliable, and sustainable energy.", false, "Goal 7: Affordable and Clean Energy", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000008"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Promote inclusive economic growth and decent work for all.", false, "Goal 8: Decent Work and Economic Growth", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000009"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Build resilient infrastructure and foster innovation.", false, "Goal 9: Industry, Innovation and Infrastructure", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000010"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Reduce inequality within and among countries.", false, "Goal 10: Reduced Inequalities", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000011"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Make cities safe, resilient, and sustainable.", false, "Goal 11: Sustainable Cities and Communities", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000012"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Ensure sustainable consumption and production patterns.", false, "Goal 12: Responsible Consumption and Production", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000013"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Take urgent action to combat climate change.", false, "Goal 13: Climate Action", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000014"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Conserve and sustainably use oceans, seas, and marine resources.", false, "Goal 14: Life Below Water", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000015"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Protect, restore, and promote sustainable terrestrial ecosystems.", false, "Goal 15: Life on Land", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000016"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Promote peaceful societies and access to justice.", false, "Goal 16: Peace, Justice and Strong Institutions", null, null },
                    { new Guid("00000000-0000-0000-0000-000000000017"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", null, null, "Strengthen global partnerships for sustainable development.", false, "Goal 17: Partnerships for the Goals", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_SDGs_Name",
                schema: "planning",
                table: "SDGs",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SDGs_Name",
                schema: "planning",
                table: "SDGs");

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                schema: "planning",
                table: "SDGs",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000017"));

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "planning",
                table: "SDGs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
