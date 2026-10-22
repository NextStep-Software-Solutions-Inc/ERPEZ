using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicBiddingEvaluationAndAwardEcosystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BiddingEvaluations",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    AwardCriterion = table.Column<string>(type: "text", nullable: false),
                    TechnicalWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    FinancialWeight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    EvaluatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    EvaluatedByName = table.Column<string>(type: "text", nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_BiddingEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingEvaluations_ProcurementProjects_ProcurementProjectId",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BiddingSubmissions",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicSupplierApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    OriginalProposedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    BidSecurityType = table.Column<string>(type: "text", nullable: false),
                    BidSecurityAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    BidSecurityNumber = table.Column<string>(type: "text", nullable: true),
                    BidSecurityValidityDays = table.Column<int>(type: "integer", nullable: true),
                    SubmissionType = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_BiddingSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingSubmissions_ProcurementProjects_ProcurementProjectId",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BiddingSubmissions_PublicSupplierApplications_PublicSupplie~",
                        column: x => x.PublicSupplierApplicationId,
                        principalSchema: "procurement",
                        principalTable: "PublicSupplierApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BiddingSubmissions_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BidOpeningRecords",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BiddingSubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    BiddingActivityScheduleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Envelope1Result = table.Column<string>(type: "text", nullable: false),
                    Envelope2Opened = table.Column<bool>(type: "boolean", nullable: false),
                    AsReadBidAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DisqualificationReason = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    OpenedById = table.Column<Guid>(type: "uuid", nullable: true),
                    OpenedByName = table.Column<string>(type: "text", nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_BidOpeningRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BidOpeningRecords_BiddingActivitySchedules_BiddingActivityS~",
                        column: x => x.BiddingActivityScheduleId,
                        principalSchema: "procurement",
                        principalTable: "BiddingActivitySchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BidOpeningRecords_BiddingSubmissions_BiddingSubmissionId",
                        column: x => x.BiddingSubmissionId,
                        principalSchema: "procurement",
                        principalTable: "BiddingSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BiddingEvaluatedBids",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BiddingEvaluationId = table.Column<Guid>(type: "uuid", nullable: false),
                    BidOpeningRecordId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatedBidPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TechnicalScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    NormalizedFinancialScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TotalScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Rank = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsResponsive = table.Column<bool>(type: "boolean", nullable: false),
                    NonResponsiveReason = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_BiddingEvaluatedBids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingEvaluatedBids_BidOpeningRecords_BidOpeningRecordId",
                        column: x => x.BidOpeningRecordId,
                        principalSchema: "procurement",
                        principalTable: "BidOpeningRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BiddingEvaluatedBids_BiddingEvaluations_BiddingEvaluationId",
                        column: x => x.BiddingEvaluationId,
                        principalSchema: "procurement",
                        principalTable: "BiddingEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BiddingEvaluatedBids_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BiddingPostQualifications",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BiddingEvaluatedBidId = table.Column<Guid>(type: "uuid", nullable: false),
                    PostQualificationNoticeSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocsReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetDeadlineDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Passed = table.Column<bool>(type: "boolean", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Findings = table.Column<string>(type: "text", nullable: true),
                    VerifiedById = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedByName = table.Column<string>(type: "text", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_BiddingPostQualifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingPostQualifications_BiddingEvaluatedBids_BiddingEvalu~",
                        column: x => x.BiddingEvaluatedBidId,
                        principalSchema: "procurement",
                        principalTable: "BiddingEvaluatedBids",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BiddingAwardRecommendations",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    WinningSupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    BiddingPostQualificationId = table.Column<Guid>(type: "uuid", nullable: false),
                    AwardedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AwardCriterion = table.Column<string>(type: "text", nullable: false),
                    RecommendedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecommendedById = table.Column<Guid>(type: "uuid", nullable: true),
                    RecommendedByName = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_BiddingAwardRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiddingAwardRecommendations_BiddingPostQualifications_Biddi~",
                        column: x => x.BiddingPostQualificationId,
                        principalSchema: "procurement",
                        principalTable: "BiddingPostQualifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BiddingAwardRecommendations_ProcurementProjects_Procurement~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BiddingAwardRecommendations_Suppliers_WinningSupplierId",
                        column: x => x.WinningSupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions",
                column: "BiddingAwardRecommendationId",
                unique: true,
                filter: "\"BiddingAwardRecommendationId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_BiddingPostQualificationId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                column: "BiddingPostQualificationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                column: "ProcurementProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_WinningSupplierId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                column: "WinningSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_BiddingEvaluationId_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                columns: new[] { "BiddingEvaluationId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_BidOpeningRecordId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                column: "BidOpeningRecordId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_Rank",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                column: "Rank");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations",
                column: "ProcurementProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingPostQualifications_BiddingEvaluatedBidId",
                schema: "procurement",
                table: "BiddingPostQualifications",
                column: "BiddingEvaluatedBidId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_ProcurementProjectId_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions",
                columns: new[] { "ProcurementProjectId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_PublicSupplierApplicationId",
                schema: "procurement",
                table: "BiddingSubmissions",
                column: "PublicSupplierApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_BidOpeningRecords_BiddingActivityScheduleId",
                schema: "procurement",
                table: "BidOpeningRecords",
                column: "BiddingActivityScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_BidOpeningRecords_BiddingSubmissionId",
                schema: "procurement",
                table: "BidOpeningRecords",
                column: "BiddingSubmissionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BACResolutions_BiddingAwardRecommendations_BiddingAwardReco~",
                schema: "procurement",
                table: "BACResolutions",
                column: "BiddingAwardRecommendationId",
                principalSchema: "procurement",
                principalTable: "BiddingAwardRecommendations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BACResolutions_BiddingAwardRecommendations_BiddingAwardReco~",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropTable(
                name: "BiddingAwardRecommendations",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BiddingPostQualifications",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BiddingEvaluatedBids",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BidOpeningRecords",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BiddingEvaluations",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "BiddingSubmissions",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions");
        }
    }
}
