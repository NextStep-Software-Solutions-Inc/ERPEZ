using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotationDocumentAndSignatoryToSupplierBid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateSigned",
                schema: "procurement",
                table: "SupplierBids",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuotationDocumentUrl",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignatoryName",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignatureUrl",
                schema: "procurement",
                table: "SupplierBids",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateSigned",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "QuotationDocumentUrl",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "SignatoryName",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "SignatureUrl",
                schema: "procurement",
                table: "SupplierBids");
        }
    }
}
