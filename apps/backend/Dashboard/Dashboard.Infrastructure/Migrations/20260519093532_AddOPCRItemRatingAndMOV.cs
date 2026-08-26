using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOPCRItemRatingAndMOV : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RatingSubmittedDate",
                schema: "planning",
                table: "OPCRs",
                newName: "SubmittedDate");

            migrationBuilder.RenameColumn(
                name: "RatingStatus",
                schema: "planning",
                table: "OPCRs",
                newName: "ReviewStatus");

            migrationBuilder.RenameColumn(
                name: "RatingReturnedDate",
                schema: "planning",
                table: "OPCRs",
                newName: "ApprovedDate");

            migrationBuilder.AddColumn<string>(
                name: "CommitmentStatus",
                schema: "planning",
                table: "OPCRs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ActualAccomplishment",
                schema: "planning",
                table: "OPCRItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Justification",
                schema: "planning",
                table: "OPCRItems",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OPCRItemMOVs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AttachedUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    UploadedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_OPCRItemMOVs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRItemMOVs_OPCRItems_OPCRItemId",
                        column: x => x.OPCRItemId,
                        principalSchema: "planning",
                        principalTable: "OPCRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OPCRItemRatings",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OPCRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIMeasurementId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelfRating = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PMTRating = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PMTRemark = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_OPCRItemRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OPCRItemRatings_KPIMeasurements_KPIMeasurementId",
                        column: x => x.KPIMeasurementId,
                        principalSchema: "planning",
                        principalTable: "KPIMeasurements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OPCRItemRatings_OPCRItems_OPCRItemId",
                        column: x => x.OPCRItemId,
                        principalSchema: "planning",
                        principalTable: "OPCRItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId",
                schema: "planning",
                table: "OPCRItemMOVs",
                column: "OPCRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_RequirementName",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "OPCRItemId", "RequirementName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                column: "KPIMeasurementId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_OPCRItemId",
                schema: "planning",
                table: "OPCRItemRatings",
                column: "OPCRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_KPIMeasurementId",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "OPCRItemId", "KPIMeasurementId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OPCRItemMOVs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OPCRItemRatings",
                schema: "planning");

            migrationBuilder.DropColumn(
                name: "CommitmentStatus",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "ActualAccomplishment",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropColumn(
                name: "Justification",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.RenameColumn(
                name: "SubmittedDate",
                schema: "planning",
                table: "OPCRs",
                newName: "RatingSubmittedDate");

            migrationBuilder.RenameColumn(
                name: "ReviewStatus",
                schema: "planning",
                table: "OPCRs",
                newName: "RatingStatus");

            migrationBuilder.RenameColumn(
                name: "ApprovedDate",
                schema: "planning",
                table: "OPCRs",
                newName: "RatingReturnedDate");
        }
    }
}
