using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUACSImportLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExpenseClasses",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_ExpenseClasses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UACSCodeCombinations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FundSourceId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: true),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    MFOPAPId = table.Column<Guid>(type: "uuid", nullable: true),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: true),
                    CombinationCode = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsValid = table.Column<bool>(type: "boolean", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UACSCodeCombinations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_FundSources_FundSourceId",
                        column: x => x.FundSourceId,
                        principalSchema: "planning",
                        principalTable: "FundSources",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "planning",
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_MFOPAPs_MFOPAPId",
                        column: x => x.MFOPAPId,
                        principalSchema: "planning",
                        principalTable: "MFOPAPs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinations_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "planning",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UACSCodeSegments",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SegmentType = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    MaxLength = table.Column<int>(type: "integer", nullable: false),
                    Pattern = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UACSCodeSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UACSImportLogs",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ImportId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    TotalRows = table.Column<int>(type: "integer", nullable: false),
                    SuccessfulRows = table.Column<int>(type: "integer", nullable: false),
                    FailedRows = table.Column<int>(type: "integer", nullable: false),
                    ErrorLog = table.Column<string>(type: "text", nullable: false),
                    ImportedBy = table.Column<string>(type: "text", nullable: false),
                    ImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_UACSImportLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ObjectExpenseClasses",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpenseClassId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_ObjectExpenseClasses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ObjectExpenseClasses_ExpenseClasses_ExpenseClassId",
                        column: x => x.ExpenseClassId,
                        principalSchema: "planning",
                        principalTable: "ExpenseClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ObjectExpenseClasses_Objects_ObjectId",
                        column: x => x.ObjectId,
                        principalSchema: "planning",
                        principalTable: "Objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UACSCodeCombinationFiscalYears",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UACSCodeCombinationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UACSCodeCombinationFiscalYears", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinationFiscalYears_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UACSCodeCombinationFiscalYears_UACSCodeCombinations_UACSCod~",
                        column: x => x.UACSCodeCombinationId,
                        principalSchema: "planning",
                        principalTable: "UACSCodeCombinations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UACSCodeSegmentFiscalYears",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UACSCodeSegmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    FiscalYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    EffectiveStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UACSCodeSegmentFiscalYears", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UACSCodeSegmentFiscalYears_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalSchema: "planning",
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UACSCodeSegmentFiscalYears_UACSCodeSegments_UACSCodeSegment~",
                        column: x => x.UACSCodeSegmentId,
                        principalSchema: "planning",
                        principalTable: "UACSCodeSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UACSValidationRules",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CodeSegmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    SegmentType = table.Column<int>(type: "integer", nullable: true),
                    ValidationExpression = table.Column<string>(type: "text", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_UACSValidationRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UACSValidationRules_UACSCodeSegments_CodeSegmentId",
                        column: x => x.CodeSegmentId,
                        principalSchema: "planning",
                        principalTable: "UACSCodeSegments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions",
                column: "UACSCodeCombinationId");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectExpenseClasses_ExpenseClassId",
                schema: "planning",
                table: "ObjectExpenseClasses",
                column: "ExpenseClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectExpenseClasses_ObjectId",
                schema: "planning",
                table: "ObjectExpenseClasses",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinationFiscalYears_FiscalYearId",
                schema: "planning",
                table: "UACSCodeCombinationFiscalYears",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinationFiscalYears_UACSCodeCombinationId",
                schema: "planning",
                table: "UACSCodeCombinationFiscalYears",
                column: "UACSCodeCombinationId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_FiscalYearId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_FundSourceId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_LocationId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_MFOPAPId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "MFOPAPId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_ObjectId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeCombinations_OrganizationId",
                schema: "planning",
                table: "UACSCodeCombinations",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeSegmentFiscalYears_FiscalYearId",
                schema: "planning",
                table: "UACSCodeSegmentFiscalYears",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSCodeSegmentFiscalYears_UACSCodeSegmentId",
                schema: "planning",
                table: "UACSCodeSegmentFiscalYears",
                column: "UACSCodeSegmentId");

            migrationBuilder.CreateIndex(
                name: "IX_UACSValidationRules_CodeSegmentId",
                schema: "planning",
                table: "UACSValidationRules",
                column: "CodeSegmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_UACSCodeCombinations_UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions",
                column: "UACSCodeCombinationId",
                principalSchema: "planning",
                principalTable: "UACSCodeCombinations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_UACSCodeCombinations_UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "ObjectExpenseClasses",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSCodeCombinationFiscalYears",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSCodeSegmentFiscalYears",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSImportLogs",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSValidationRules",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ExpenseClasses",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSCodeCombinations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "UACSCodeSegments",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "UACSCodeCombinationId",
                schema: "planning",
                table: "Transactions");
        }
    }
}
