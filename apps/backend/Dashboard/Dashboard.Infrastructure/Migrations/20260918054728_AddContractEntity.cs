using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContractEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contracts",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NoticeOfAwardId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uuid", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalRemarks = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ReturnRemarks = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    ReturnedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ReturnedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExecutedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    ExecutedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ExecutedByName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContractApprovedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    SignedContractFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    SignedContractFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LateExecutionJustification = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    JustificationLoggedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_Contracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contracts_NoticeOfAwards_NoticeOfAwardId",
                        column: x => x.NoticeOfAwardId,
                        principalSchema: "procurement",
                        principalTable: "NoticeOfAwards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractNumber",
                schema: "procurement",
                table: "Contracts",
                column: "ContractNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_NoticeOfAwardId",
                schema: "procurement",
                table: "Contracts",
                column: "NoticeOfAwardId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contracts",
                schema: "procurement");
        }
    }
}
