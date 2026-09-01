using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementProjectAPPItemsAndResolutionClauses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcurementProjectAPPItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    APPItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_ProcurementProjectAPPItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcurementProjectAPPItems_APPItems_APPItemId",
                        column: x => x.APPItemId,
                        principalSchema: "planning",
                        principalTable: "APPItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProcurementProjectAPPItems_ProcurementProjects_ProcurementP~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResolutionClauses",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    ClauseType = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_ResolutionClauses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BACResolutionClauseLinks",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BACResolutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResolutionClauseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClauseType = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_BACResolutionClauseLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BACResolutionClauseLinks_BACResolutions_BACResolutionId",
                        column: x => x.BACResolutionId,
                        principalSchema: "procurement",
                        principalTable: "BACResolutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BACResolutionClauseLinks_ResolutionClauses_ResolutionClause~",
                        column: x => x.ResolutionClauseId,
                        principalSchema: "planning",
                        principalTable: "ResolutionClauses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionClauseLinks_BACResolutionId",
                schema: "procurement",
                table: "BACResolutionClauseLinks",
                column: "BACResolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionClauseLinks_ResolutionClauseId",
                schema: "procurement",
                table: "BACResolutionClauseLinks",
                column: "ResolutionClauseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjectAPPItems_APPItemId",
                schema: "procurement",
                table: "ProcurementProjectAPPItems",
                column: "APPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjectAPPItems_ProcurementProjectId",
                schema: "procurement",
                table: "ProcurementProjectAPPItems",
                column: "ProcurementProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BACResolutionClauseLinks",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "ProcurementProjectAPPItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "ResolutionClauses",
                schema: "planning");
        }
    }
}
