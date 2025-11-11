using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AutomaticSchemaDetection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_Objects_ObjectId",
                schema: "catalog",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_Objects_Objects_ParentObjectId",
                schema: "catalog",
                table: "Objects");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Objects_ObjectId",
                schema: "catalog",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Objects",
                schema: "catalog",
                table: "Objects");

            migrationBuilder.EnsureSchema(
                name: "planning");

            migrationBuilder.RenameTable(
                name: "WFPs",
                schema: "catalog",
                newName: "WFPs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPPAPDepartment",
                schema: "catalog",
                newName: "WFPPAPDepartment",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPPAP",
                schema: "catalog",
                newName: "WFPPAP",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPOutcomes",
                schema: "catalog",
                newName: "WFPOutcomes",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPObjectiveTimelines",
                schema: "catalog",
                newName: "WFPObjectiveTimelines",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPObjectiveTargets",
                schema: "catalog",
                newName: "WFPObjectiveTargets",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPObjectives",
                schema: "catalog",
                newName: "WFPObjectives",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "WFPActivities",
                schema: "catalog",
                newName: "WFPActivities",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Transactions",
                schema: "catalog",
                newName: "Transactions",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "SubDUAllocation",
                schema: "catalog",
                newName: "SubDUAllocation",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "SubDeliveryUnit",
                schema: "catalog",
                newName: "SubDeliveryUnit",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "SDGs",
                schema: "catalog",
                newName: "SDGs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "ReceivedFunds",
                schema: "catalog",
                newName: "ReceivedFunds",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "PerformanceMeasures",
                schema: "catalog",
                newName: "PerformanceMeasures",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Organizations",
                schema: "catalog",
                newName: "Organizations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRs",
                schema: "catalog",
                newName: "OPCRs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRRatings",
                schema: "catalog",
                newName: "OPCRRatings",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRPAPDepartments",
                schema: "catalog",
                newName: "OPCRPAPDepartments",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRKPI",
                schema: "catalog",
                newName: "OPCRKPI",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCREvaluations",
                schema: "catalog",
                newName: "OPCREvaluations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "OPCRActivities",
                schema: "catalog",
                newName: "OPCRActivities",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Offices",
                schema: "catalog",
                newName: "Offices",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "MFOPAPs",
                schema: "catalog",
                newName: "MFOPAPs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "MFOKPI",
                schema: "catalog",
                newName: "MFOKPI",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Locations",
                schema: "catalog",
                newName: "Locations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPITargets",
                schema: "catalog",
                newName: "KPITargets",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPISDGs",
                schema: "catalog",
                newName: "KPISDGs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIs",
                schema: "catalog",
                newName: "KPIs",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIRatings",
                schema: "catalog",
                newName: "KPIRatings",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIModeOfVerifications",
                schema: "catalog",
                newName: "KPIModeOfVerifications",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "KPIAttribute",
                schema: "catalog",
                newName: "KPIAttribute",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "FundSources",
                schema: "catalog",
                newName: "FundSources",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "FunctionAllocations",
                schema: "catalog",
                newName: "FunctionAllocations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "FiscalYear",
                schema: "catalog",
                newName: "FiscalYear",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "DUKPIAssignment",
                schema: "catalog",
                newName: "DUKPIAssignment",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "DUFundAllocations",
                schema: "catalog",
                newName: "DUFundAllocations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "DUAllocations",
                schema: "catalog",
                newName: "DUAllocations",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "catalog",
                newName: "DeliveryUnitOPCRActivity",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "DeliveryUnit",
                schema: "catalog",
                newName: "DeliveryUnit",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Clusters",
                schema: "catalog",
                newName: "Clusters",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Attributes",
                schema: "catalog",
                newName: "Attributes",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "ActivityBudgetRequirements",
                schema: "catalog",
                newName: "ActivityBudgetRequirements",
                newSchema: "planning");

            migrationBuilder.RenameTable(
                name: "Objects",
                schema: "catalog",
                newName: "[Object]s");

            migrationBuilder.RenameIndex(
                name: "IX_Objects_ParentObjectId",
                table: "[Object]s",
                newName: "IX_[Object]s_ParentObjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Objects_ParentId_Code",
                table: "[Object]s",
                newName: "IX_[Object]s_ParentId_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_[Object]s",
                table: "[Object]s",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_[Object]s_[Object]s_ParentObjectId",
                table: "[Object]s",
                column: "ParentObjectId",
                principalTable: "[Object]s",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_[Object]s_ObjectId",
                schema: "planning",
                table: "ActivityBudgetRequirements",
                column: "ObjectId",
                principalTable: "[Object]s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_[Object]s_ObjectId",
                schema: "planning",
                table: "Transactions",
                column: "ObjectId",
                principalTable: "[Object]s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_[Object]s_[Object]s_ParentObjectId",
                table: "[Object]s");

            migrationBuilder.DropForeignKey(
                name: "FK_ActivityBudgetRequirements_[Object]s_ObjectId",
                schema: "planning",
                table: "ActivityBudgetRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_[Object]s_ObjectId",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_[Object]s",
                table: "[Object]s");

            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPs",
                schema: "planning",
                newName: "WFPs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPPAPDepartment",
                schema: "planning",
                newName: "WFPPAPDepartment",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPPAP",
                schema: "planning",
                newName: "WFPPAP",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPOutcomes",
                schema: "planning",
                newName: "WFPOutcomes",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPObjectiveTimelines",
                schema: "planning",
                newName: "WFPObjectiveTimelines",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPObjectiveTargets",
                schema: "planning",
                newName: "WFPObjectiveTargets",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPObjectives",
                schema: "planning",
                newName: "WFPObjectives",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "WFPActivities",
                schema: "planning",
                newName: "WFPActivities",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Transactions",
                schema: "planning",
                newName: "Transactions",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "SubDUAllocation",
                schema: "planning",
                newName: "SubDUAllocation",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "SubDeliveryUnit",
                schema: "planning",
                newName: "SubDeliveryUnit",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "SDGs",
                schema: "planning",
                newName: "SDGs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "ReceivedFunds",
                schema: "planning",
                newName: "ReceivedFunds",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "PerformanceMeasures",
                schema: "planning",
                newName: "PerformanceMeasures",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Organizations",
                schema: "planning",
                newName: "Organizations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCRs",
                schema: "planning",
                newName: "OPCRs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCRRatings",
                schema: "planning",
                newName: "OPCRRatings",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCRPAPDepartments",
                schema: "planning",
                newName: "OPCRPAPDepartments",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCRKPI",
                schema: "planning",
                newName: "OPCRKPI",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCREvaluations",
                schema: "planning",
                newName: "OPCREvaluations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "OPCRActivities",
                schema: "planning",
                newName: "OPCRActivities",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Offices",
                schema: "planning",
                newName: "Offices",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "MFOPAPs",
                schema: "planning",
                newName: "MFOPAPs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "MFOKPI",
                schema: "planning",
                newName: "MFOKPI",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Locations",
                schema: "planning",
                newName: "Locations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPITargets",
                schema: "planning",
                newName: "KPITargets",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPISDGs",
                schema: "planning",
                newName: "KPISDGs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPIs",
                schema: "planning",
                newName: "KPIs",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPIRatings",
                schema: "planning",
                newName: "KPIRatings",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPIModeOfVerifications",
                schema: "planning",
                newName: "KPIModeOfVerifications",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "KPIAttribute",
                schema: "planning",
                newName: "KPIAttribute",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "FundSources",
                schema: "planning",
                newName: "FundSources",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "FunctionAllocations",
                schema: "planning",
                newName: "FunctionAllocations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "FiscalYear",
                schema: "planning",
                newName: "FiscalYear",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "DUKPIAssignment",
                schema: "planning",
                newName: "DUKPIAssignment",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "DUFundAllocations",
                schema: "planning",
                newName: "DUFundAllocations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "DUAllocations",
                schema: "planning",
                newName: "DUAllocations",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "DeliveryUnitOPCRActivity",
                schema: "planning",
                newName: "DeliveryUnitOPCRActivity",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "DeliveryUnit",
                schema: "planning",
                newName: "DeliveryUnit",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Clusters",
                schema: "planning",
                newName: "Clusters",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "Attributes",
                schema: "planning",
                newName: "Attributes",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "ActivityBudgetRequirements",
                schema: "planning",
                newName: "ActivityBudgetRequirements",
                newSchema: "catalog");

            migrationBuilder.RenameTable(
                name: "[Object]s",
                newName: "Objects",
                newSchema: "catalog");

            migrationBuilder.RenameIndex(
                name: "IX_[Object]s_ParentObjectId",
                schema: "catalog",
                table: "Objects",
                newName: "IX_Objects_ParentObjectId");

            migrationBuilder.RenameIndex(
                name: "IX_[Object]s_ParentId_Code",
                schema: "catalog",
                table: "Objects",
                newName: "IX_Objects_ParentId_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Objects",
                schema: "catalog",
                table: "Objects",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityBudgetRequirements_Objects_ObjectId",
                schema: "catalog",
                table: "ActivityBudgetRequirements",
                column: "ObjectId",
                principalSchema: "catalog",
                principalTable: "Objects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Objects_Objects_ParentObjectId",
                schema: "catalog",
                table: "Objects",
                column: "ParentObjectId",
                principalSchema: "catalog",
                principalTable: "Objects",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Objects_ObjectId",
                schema: "catalog",
                table: "Transactions",
                column: "ObjectId",
                principalSchema: "catalog",
                principalTable: "Objects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
