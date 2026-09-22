using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoticeToProceedEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NoticeToProceeds",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NTPNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    NTPDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectivityDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CommencementDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ImplementationPeriodDays = table.Column<int>(type: "integer", nullable: true),
                    DeliveryCompletionDeadline = table.Column<DateOnly>(type: "date", nullable: true),
                    PlaceOfDelivery = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContractNumberSnapshot = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContractApprovedDateSnapshot = table.Column<DateOnly>(type: "date", nullable: true),
                    AwardedAmountSnapshot = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SupplierNameSnapshot = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SupplierAddressSnapshot = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProjectTitleSnapshot = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IssuedById = table.Column<Guid>(type: "uuid", nullable: true),
                    IssuedByName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    ReceivedByName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SignedDocumentFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    SignedDocumentFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PhilGEPSPostedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    PhilGEPSReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CancelledById = table.Column<Guid>(type: "uuid", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_NoticeToProceeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoticeToProceeds_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalSchema: "procurement",
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeToProceeds_ContractId",
                schema: "procurement",
                table: "NoticeToProceeds",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeToProceeds_NTPNumber",
                schema: "procurement",
                table: "NoticeToProceeds",
                column: "NTPNumber");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeToProceeds_Status",
                schema: "procurement",
                table: "NoticeToProceeds",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NoticeToProceeds",
                schema: "procurement");
        }
    }
}
