using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DirectContractingProposalAndProposalItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DirectContractings",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DCNumber = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    BACResolutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExclusiveSupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmissionDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TotalABC = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_DirectContractings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectContractings_BACResolutions_BACResolutionId",
                        column: x => x.BACResolutionId,
                        principalSchema: "procurement",
                        principalTable: "BACResolutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectContractings_Suppliers_ExclusiveSupplierId",
                        column: x => x.ExclusiveSupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DirectContractingProposals",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DirectContractingId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExclusivityDocumentUrl = table.Column<string>(type: "text", nullable: false),
                    ProposalRemarks = table.Column<string>(type: "text", nullable: true),
                    TotalProposalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_DirectContractingProposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectContractingProposals_DirectContractings_DirectContrac~",
                        column: x => x.DirectContractingId,
                        principalSchema: "procurement",
                        principalTable: "DirectContractings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DirectContractingProposals_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "planning",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DirectContractingProposalItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProposalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CPRItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitBid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalBid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Brand = table.Column<string>(type: "text", nullable: true),
                    Model = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    BrochureFileUrl = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_DirectContractingProposalItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectContractingProposalItems_DirectContractingProposals_P~",
                        column: x => x.ProposalId,
                        principalSchema: "procurement",
                        principalTable: "DirectContractingProposals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DirectContractingProposalItems_PPMPItems_CPRItemId",
                        column: x => x.CPRItemId,
                        principalSchema: "planning",
                        principalTable: "PPMPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
                column: "ConsolidatedPRId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposalItems_CPRItemId",
                schema: "procurement",
                table: "DirectContractingProposalItems",
                column: "CPRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposalItems_ProposalId",
                schema: "procurement",
                table: "DirectContractingProposalItems",
                column: "ProposalId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposals_DirectContractingId",
                schema: "procurement",
                table: "DirectContractingProposals",
                column: "DirectContractingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposals_SupplierId",
                schema: "procurement",
                table: "DirectContractingProposals",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractings_BACResolutionId",
                schema: "procurement",
                table: "DirectContractings",
                column: "BACResolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractings_ExclusiveSupplierId",
                schema: "procurement",
                table: "DirectContractings",
                column: "ExclusiveSupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectContractingProposalItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "DirectContractingProposals",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "DirectContractings",
                schema: "procurement");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects");
        }
    }
}
