using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfficeRefactorAndPositionEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactNumber",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "Email",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.RenameColumn(
                name: "OfficeHead",
                schema: "planning",
                table: "Offices",
                newName: "Code");

            migrationBuilder.AddColumn<Guid>(
                name: "AdministrativeLevelId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "BudgetCostCenter",
                schema: "planning",
                table: "Offices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OfficeTypeId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProcurementWorkflowId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "planning",
                table: "Clusters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                schema: "planning",
                table: "Clusters",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "planning",
                table: "Clusters",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxSubUnits",
                schema: "planning",
                table: "Clusters",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AdministrativeLevels",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    CanHaveChildren = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_AdministrativeLevels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    CanHaveChildren = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OfficeTypes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    CanHaveChildren = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_OfficeTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlantillaTypes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Duration = table.Column<string>(type: "text", nullable: true),
                    RequiresActingAppointments = table.Column<bool>(type: "boolean", nullable: false),
                    AllowsContractual = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Benefits = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_PlantillaTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PositionTypes",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EducationalLevel = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: true),
                    IsCareerEligibilityRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CanReportDirectly = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_PositionTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcurementWorkflows",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    ApprovalLevel = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_ProcurementWorkflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalaryGrades",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    GradeNumber = table.Column<int>(type: "integer", nullable: false),
                    StepIncrementAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    NumberOfSteps = table.Column<int>(type: "integer", nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_SalaryGrades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Steps",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    StepNumber = table.Column<int>(type: "integer", nullable: false),
                    MinStep = table.Column<int>(type: "integer", nullable: false),
                    MaxStep = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Steps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    FunctionalTitle = table.Column<string>(type: "text", nullable: true),
                    Code = table.Column<string>(type: "text", nullable: false),
                    JobDescription = table.Column<string>(type: "text", nullable: true),
                    Qualifications = table.Column<string>(type: "text", nullable: true),
                    FTE = table.Column<decimal>(type: "numeric", nullable: true),
                    OperationalStatus = table.Column<string>(type: "text", nullable: false),
                    PositionTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlantillaTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalaryGradeId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_Positions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Positions_Offices_OfficeId",
                        column: x => x.OfficeId,
                        principalSchema: "planning",
                        principalTable: "Offices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Positions_PlantillaTypes_PlantillaTypeId",
                        column: x => x.PlantillaTypeId,
                        principalSchema: "planning",
                        principalTable: "PlantillaTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Positions_PositionTypes_PositionTypeId",
                        column: x => x.PositionTypeId,
                        principalSchema: "planning",
                        principalTable: "PositionTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Positions_SalaryGrades_SalaryGradeId",
                        column: x => x.SalaryGradeId,
                        principalSchema: "planning",
                        principalTable: "SalaryGrades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Positions_Steps_StepId",
                        column: x => x.StepId,
                        principalSchema: "planning",
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Offices_AdministrativeLevelId",
                schema: "planning",
                table: "Offices",
                column: "AdministrativeLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_CategoryId",
                schema: "planning",
                table: "Offices",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_Code",
                schema: "planning",
                table: "Offices",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offices_OfficeTypeId",
                schema: "planning",
                table: "Offices",
                column: "OfficeTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_OrganizationId",
                schema: "planning",
                table: "Offices",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_ParentId",
                schema: "planning",
                table: "Offices",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Offices_ProcurementWorkflowId",
                schema: "planning",
                table: "Offices",
                column: "ProcurementWorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_Code",
                schema: "planning",
                table: "Clusters",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdministrativeLevels_Code",
                schema: "planning",
                table: "AdministrativeLevels",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Code",
                schema: "planning",
                table: "Categories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfficeTypes_Code",
                schema: "planning",
                table: "OfficeTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlantillaTypes_Code",
                schema: "planning",
                table: "PlantillaTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_Code",
                schema: "planning",
                table: "Positions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_OfficeId_Title",
                schema: "planning",
                table: "Positions",
                columns: new[] { "OfficeId", "Title" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_PlantillaTypeId",
                schema: "planning",
                table: "Positions",
                column: "PlantillaTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_PositionTypeId",
                schema: "planning",
                table: "Positions",
                column: "PositionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_SalaryGradeId",
                schema: "planning",
                table: "Positions",
                column: "SalaryGradeId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_StepId",
                schema: "planning",
                table: "Positions",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_PositionTypes_Code",
                schema: "planning",
                table: "PositionTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementWorkflows_Code",
                schema: "planning",
                table: "ProcurementWorkflows",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalaryGrades_Code",
                schema: "planning",
                table: "SalaryGrades",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalaryGrades_GradeNumber",
                schema: "planning",
                table: "SalaryGrades",
                column: "GradeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Steps_Code",
                schema: "planning",
                table: "Steps",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Steps_StepNumber",
                schema: "planning",
                table: "Steps",
                column: "StepNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_AdministrativeLevels_AdministrativeLevelId",
                schema: "planning",
                table: "Offices",
                column: "AdministrativeLevelId",
                principalSchema: "planning",
                principalTable: "AdministrativeLevels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Categories_CategoryId",
                schema: "planning",
                table: "Offices",
                column: "CategoryId",
                principalSchema: "planning",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_OfficeTypes_OfficeTypeId",
                schema: "planning",
                table: "Offices",
                column: "OfficeTypeId",
                principalSchema: "planning",
                principalTable: "OfficeTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Offices_ParentId",
                schema: "planning",
                table: "Offices",
                column: "ParentId",
                principalSchema: "planning",
                principalTable: "Offices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_Organizations_OrganizationId",
                schema: "planning",
                table: "Offices",
                column: "OrganizationId",
                principalSchema: "planning",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offices_ProcurementWorkflows_ProcurementWorkflowId",
                schema: "planning",
                table: "Offices",
                column: "ProcurementWorkflowId",
                principalSchema: "planning",
                principalTable: "ProcurementWorkflows",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offices_AdministrativeLevels_AdministrativeLevelId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Categories_CategoryId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_OfficeTypes_OfficeTypeId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Offices_ParentId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_Organizations_OrganizationId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropForeignKey(
                name: "FK_Offices_ProcurementWorkflows_ProcurementWorkflowId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropTable(
                name: "AdministrativeLevels",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "OfficeTypes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Positions",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "ProcurementWorkflows",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PlantillaTypes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "PositionTypes",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SalaryGrades",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "Steps",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_Offices_AdministrativeLevelId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_CategoryId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_Code",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_OfficeTypeId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_OrganizationId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_ParentId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Offices_ProcurementWorkflowId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_Code",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropColumn(
                name: "AdministrativeLevelId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "BudgetCostCenter",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "OfficeTypeId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "ParentId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "ProcurementWorkflowId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "Address",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropColumn(
                name: "Code",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropColumn(
                name: "MaxSubUnits",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.RenameColumn(
                name: "Code",
                schema: "planning",
                table: "Offices",
                newName: "OfficeHead");

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                schema: "planning",
                table: "Offices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "planning",
                table: "Offices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "planning",
                table: "Clusters",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}
