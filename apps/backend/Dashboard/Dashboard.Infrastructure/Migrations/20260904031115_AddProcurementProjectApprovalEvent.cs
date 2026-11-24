using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementProjectApprovalEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcurementProjectApprovalEvents",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    ActorId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActorName = table.Column<string>(type: "text", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    AttachmentFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_ProcurementProjectApprovalEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcurementProjectApprovalEvents_ProcurementProjects_Procur~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingActivitySchedules_BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                column: "BACResolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjectApprovalEvents_ProcurementProjectId",
                schema: "procurement",
                table: "ProcurementProjectApprovalEvents",
                column: "ProcurementProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_BiddingActivitySchedules_BACResolutions_BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                column: "BACResolutionId",
                principalSchema: "procurement",
                principalTable: "BACResolutions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BiddingActivitySchedules_BACResolutions_BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropTable(
                name: "ProcurementProjectApprovalEvents",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_BiddingActivitySchedules_BACResolutionId",
                schema: "procurement",
                table: "BiddingActivitySchedules");
        }
    }
}
