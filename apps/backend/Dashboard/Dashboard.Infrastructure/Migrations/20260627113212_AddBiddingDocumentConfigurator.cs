using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBiddingDocumentConfigurator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ChecklistConfirmed",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "DocumentProfiles",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProcurementCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_DocumentProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterDocumentTypes",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EnvelopeType = table.Column<int>(type: "integer", nullable: false),
                    TemplateFileUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
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
                    table.PrimaryKey("PK_MasterDocumentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentProfileItems",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    MasterDocumentTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_DocumentProfileItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentProfileItems_DocumentProfiles_DocumentProfileId",
                        column: x => x.DocumentProfileId,
                        principalSchema: "procurement",
                        principalTable: "DocumentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentProfileItems_MasterDocumentTypes_MasterDocumentType~",
                        column: x => x.MasterDocumentTypeId,
                        principalSchema: "procurement",
                        principalTable: "MasterDocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectDocumentChecklists",
                schema: "procurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcurementProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    MasterDocumentTypeId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomDocumentName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomTemplateFileUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    EnvelopeType = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_ProjectDocumentChecklists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectDocumentChecklists_MasterDocumentTypes_MasterDocumen~",
                        column: x => x.MasterDocumentTypeId,
                        principalSchema: "procurement",
                        principalTable: "MasterDocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectDocumentChecklists_ProcurementProjects_ProcurementPr~",
                        column: x => x.ProcurementProjectId,
                        principalSchema: "procurement",
                        principalTable: "ProcurementProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_DocumentProfileId_MasterDocumentTypeId",
                schema: "procurement",
                table: "DocumentProfileItems",
                columns: new[] { "DocumentProfileId", "MasterDocumentTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_MasterDocumentTypeId",
                schema: "procurement",
                table: "DocumentProfileItems",
                column: "MasterDocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfiles_Name",
                schema: "procurement",
                table: "DocumentProfiles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterDocumentTypes_EnvelopeType",
                schema: "procurement",
                table: "MasterDocumentTypes",
                column: "EnvelopeType");

            migrationBuilder.CreateIndex(
                name: "IX_MasterDocumentTypes_Name",
                schema: "procurement",
                table: "MasterDocumentTypes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDocumentChecklists_MasterDocumentTypeId",
                schema: "procurement",
                table: "ProjectDocumentChecklists",
                column: "MasterDocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDocumentChecklists_ProcurementProjectId_EnvelopeType",
                schema: "procurement",
                table: "ProjectDocumentChecklists",
                columns: new[] { "ProcurementProjectId", "EnvelopeType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentProfileItems",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "ProjectDocumentChecklists",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "DocumentProfiles",
                schema: "procurement");

            migrationBuilder.DropTable(
                name: "MasterDocumentTypes",
                schema: "procurement");

            migrationBuilder.DropColumn(
                name: "ChecklistConfirmed",
                schema: "procurement",
                table: "ProcurementProjects");
        }
    }
}
