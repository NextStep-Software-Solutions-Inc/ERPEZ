using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MarketScopingFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketScopings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectName = table.Column<string>(type: "text", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "numeric", nullable: false),
                    PeriodFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetLIBId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopings_LineItemBudgets_TargetLIBId",
                        column: x => x.TargetLIBId,
                        principalSchema: "planning",
                        principalTable: "LineItemBudgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MarketScopings_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "planning",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingActivities",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketScopingId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopingActivities_MarketScopings_MarketScopingId",
                        column: x => x.MarketScopingId,
                        principalSchema: "planning",
                        principalTable: "MarketScopings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingHistories",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketScopingId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousStatus = table.Column<string>(type: "text", nullable: false),
                    NewStatus = table.Column<string>(type: "text", nullable: false),
                    ChangeReason = table.Column<string>(type: "text", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangedBy = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopingHistories_MarketScopings_MarketScopingId",
                        column: x => x.MarketScopingId,
                        principalSchema: "planning",
                        principalTable: "MarketScopings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingParameters",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketScopingId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParameterId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsConsidered = table.Column<bool>(type: "boolean", nullable: true),
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
                    table.PrimaryKey("PK_MarketScopingParameters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopingParameters_MarketScopings_MarketScopingId",
                        column: x => x.MarketScopingId,
                        principalSchema: "planning",
                        principalTable: "MarketScopings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingActivityAttachments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketScopingActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingActivityAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopingActivityAttachments_MarketScopingActivities_Ma~",
                        column: x => x.MarketScopingActivityId,
                        principalSchema: "planning",
                        principalTable: "MarketScopingActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketScopingParameterAttachments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketScopingParameterId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_MarketScopingParameterAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketScopingParameterAttachments_MarketScopingParameters_M~",
                        column: x => x.MarketScopingParameterId,
                        principalSchema: "planning",
                        principalTable: "MarketScopingParameters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivities_MarketScopingId",
                schema: "planning",
                table: "MarketScopingActivities",
                column: "MarketScopingId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivityAttachments_MarketScopingActivityId",
                schema: "planning",
                table: "MarketScopingActivityAttachments",
                column: "MarketScopingActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingHistories_MarketScopingId",
                schema: "planning",
                table: "MarketScopingHistories",
                column: "MarketScopingId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameterAttachments_MarketScopingParameterId",
                schema: "planning",
                table: "MarketScopingParameterAttachments",
                column: "MarketScopingParameterId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameters_MarketScopingId",
                schema: "planning",
                table: "MarketScopingParameters",
                column: "MarketScopingId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLIBId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLIBId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_UserId",
                schema: "planning",
                table: "MarketScopings",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketScopingActivityAttachments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopingHistories",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopingParameterAttachments",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopingActivities",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopingParameters",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "MarketScopings",
                schema: "planning");
        }
    }
}
