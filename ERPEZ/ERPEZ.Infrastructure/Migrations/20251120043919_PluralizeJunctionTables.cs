using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PluralizeJunctionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttribute_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttribute");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttribute_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttribute");

            // Migrate data from MFOKPI to temporary storage before dropping
            migrationBuilder.Sql(@"
                CREATE TEMP TABLE temp_mfokpi_data AS 
                SELECT ""KPIId"", ""MFOPAPId"" 
                FROM planning.""MFOKPI"" 
                WHERE ""IsDeleted"" = false;
            ");

            migrationBuilder.DropTable(
                name: "MFOKPI",
                schema: "planning");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPIAttribute",
                schema: "planning",
                table: "KPIAttribute");

            migrationBuilder.RenameTable(
                name: "KPIAttribute",
                schema: "planning",
                newName: "KPIAttributes",
                newSchema: "planning");

            migrationBuilder.RenameIndex(
                name: "IX_KPIAttribute_KPIsId",
                schema: "planning",
                table: "KPIAttributes",
                newName: "IX_KPIAttributes_KPIsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPIAttributes",
                schema: "planning",
                table: "KPIAttributes",
                columns: new[] { "AttributesId", "KPIsId" });

            migrationBuilder.CreateTable(
                name: "MFOKPIs",
                schema: "planning",
                columns: table => new
                {
                    KPIsId = table.Column<Guid>(type: "uuid", nullable: false),
                    MFOPAPsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MFOKPIs", x => new { x.KPIsId, x.MFOPAPsId });
                    table.ForeignKey(
                        name: "FK_MFOKPIs_KPIs_KPIsId",
                        column: x => x.KPIsId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MFOKPIs_MFOPAPs_MFOPAPsId",
                        column: x => x.MFOPAPsId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MFOKPIs_MFOPAPsId",
                schema: "planning",
                table: "MFOKPIs",
                column: "MFOPAPsId");

            // Migrate data from temporary storage to new MFOKPIs table
            migrationBuilder.Sql(@"
                INSERT INTO planning.""MFOKPIs"" (""KPIsId"", ""MFOPAPsId"")
                SELECT ""KPIId"", ""MFOPAPId"" 
                FROM temp_mfokpi_data;
                
                DROP TABLE temp_mfokpi_data;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttributes_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttributes",
                column: "AttributesId",
                principalSchema: "planning",
                principalTable: "Attributes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttributes_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttributes",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttributes_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIAttributes_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttributes");

            // Migrate data from MFOKPIs to temporary storage before dropping
            migrationBuilder.Sql(@"
                CREATE TEMP TABLE temp_mfokpis_data AS 
                SELECT ""KPIsId"", ""MFOPAPsId"" 
                FROM planning.""MFOKPIs"";
            ");

            migrationBuilder.DropTable(
                name: "MFOKPIs",
                schema: "planning");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KPIAttributes",
                schema: "planning",
                table: "KPIAttributes");

            migrationBuilder.RenameTable(
                name: "KPIAttributes",
                schema: "planning",
                newName: "KPIAttribute",
                newSchema: "planning");

            migrationBuilder.RenameIndex(
                name: "IX_KPIAttributes_KPIsId",
                schema: "planning",
                table: "KPIAttribute",
                newName: "IX_KPIAttribute_KPIsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KPIAttribute",
                schema: "planning",
                table: "KPIAttribute",
                columns: new[] { "AttributesId", "KPIsId" });

            migrationBuilder.CreateTable(
                name: "MFOKPI",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KPIId = table.Column<Guid>(type: "uuid", nullable: false),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MFOKPI", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MFOKPI_KPIs_KPIId",
                        column: x => x.KPIId,
                        principalSchema: "planning",
                        principalTable: "KPIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MFOKPI_MFOPAPs_MFOPAPId",
                        column: x => x.MFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MFOKPI_KPIId",
                schema: "planning",
                table: "MFOKPI",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_MFOKPI_MFOPAPId_KPIId",
                schema: "planning",
                table: "MFOKPI",
                columns: new[] { "MFOPAPId", "KPIId" },
                unique: true);

            // Generate new GUIDs for Id column and migrate data from temporary storage to old MFOKPI table
            migrationBuilder.Sql(@"
                INSERT INTO planning.""MFOKPI"" (""Id"", ""KPIId"", ""MFOPAPId"", ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
                SELECT gen_random_uuid(), ""KPIsId"", ""MFOPAPsId"", NOW(), 'System', false
                FROM temp_mfokpis_data;
                
                DROP TABLE temp_mfokpis_data;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttribute_Attributes_AttributesId",
                schema: "planning",
                table: "KPIAttribute",
                column: "AttributesId",
                principalSchema: "planning",
                principalTable: "Attributes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIAttribute_KPIs_KPIsId",
                schema: "planning",
                table: "KPIAttribute",
                column: "KPIsId",
                principalSchema: "planning",
                principalTable: "KPIs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
