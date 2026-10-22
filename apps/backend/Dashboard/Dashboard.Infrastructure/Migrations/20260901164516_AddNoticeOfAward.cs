using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoticeOfAward : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NoticeOfAwards",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NOANumber = table.Column<string>(type: "text", nullable: false),
                    BACResolutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    NOADate = table.Column<DateOnly>(type: "date", nullable: false),
                    BidDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ProcurementType = table.Column<string>(type: "text", nullable: false),
                    AwardedAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    AwardCriterion = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ReturnReason = table.Column<string>(type: "text", nullable: true),
                    SubmittedById = table.Column<Guid>(type: "uuid", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByName = table.Column<string>(type: "text", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    SignedDocumentFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    SignedDocumentFileName = table.Column<string>(type: "text", nullable: true),
                    PhilGEPSPostedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    PhilGEPSReferenceNumber = table.Column<string>(type: "text", nullable: true),
                    ContractExecutionDeadline = table.Column<DateOnly>(type: "date", nullable: true),
                    ContractExecutionJustification = table.Column<string>(type: "text", nullable: true),
                    JustificationLoggedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CascadeTriggeredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CascadeTriggeredById = table.Column<Guid>(type: "uuid", nullable: true),
                    CascadeTriggeredByName = table.Column<string>(type: "text", nullable: true),
                    CascadeNote = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_NoticeOfAwards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoticeOfAwards_BACResolutions_BACResolutionId",
                        column: x => x.BACResolutionId,
                        principalSchema: "procurement",
                        principalTable: "BACResolutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoticeOfAwards_ProcurementProjects_ProcurementProjectId",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoticeOfAwards_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoticeOfAwardActivities",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoticeOfAwardId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorName = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_NoticeOfAwardActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoticeOfAwardActivities_NoticeOfAwards_NoticeOfAwardId",
                        column: x => x.NoticeOfAwardId,
                        principalSchema: "procurement",
                        principalTable: "NoticeOfAwards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoticeOfAwardMilestones",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoticeOfAwardId = table.Column<Guid>(type: "uuid", nullable: false),
                    MilestoneType = table.Column<string>(type: "text", nullable: false),
                    DateLogged = table.Column<DateOnly>(type: "date", nullable: false),
                    FileId = table.Column<Guid>(type: "uuid", nullable: true),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    LoggedById = table.Column<Guid>(type: "uuid", nullable: true),
                    LoggedByName = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_NoticeOfAwardMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoticeOfAwardMilestones_NoticeOfAwards_NoticeOfAwardId",
                        column: x => x.NoticeOfAwardId,
                        principalSchema: "procurement",
                        principalTable: "NoticeOfAwards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwardActivities_NoticeOfAwardId",
                schema: "procurement",
                table: "NoticeOfAwardActivities",
                column: "NoticeOfAwardId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwardMilestones_NoticeOfAwardId",
                schema: "procurement",
                table: "NoticeOfAwardMilestones",
                column: "NoticeOfAwardId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwards_BACResolutionId",
                schema: "procurement",
                table: "NoticeOfAwards",
                column: "BACResolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwards_ProcurementProjectId",
                schema: "procurement",
                table: "NoticeOfAwards",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwards_SupplierId",
                schema: "procurement",
                table: "NoticeOfAwards",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NoticeOfAwardActivities",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "NoticeOfAwardMilestones",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "NoticeOfAwards",
                schema: "procurement");
        }
    }
}
