using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNullableScopeAndSourceDocumentIdToGenerateDocumentEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Scope",
                schema: "planning",
                table: "GeneratedDocuments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceDocumentId",
                schema: "planning",
                table: "GeneratedDocuments",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Scope",
                schema: "planning",
                table: "GeneratedDocuments");

            migrationBuilder.DropColumn(
                name: "SourceDocumentId",
                schema: "planning",
                table: "GeneratedDocuments");
        }
    }
}
