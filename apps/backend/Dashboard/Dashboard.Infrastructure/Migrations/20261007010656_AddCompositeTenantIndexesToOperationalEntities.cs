using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositeTenantIndexesToOperationalEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate_EndD~",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_FundSourceId_OrganizationId_LocationId_MFOPAPI~",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_KPIPerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_PONumber",
                schema: "procurement",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PerformanceMeasures_Name",
                schema: "planning",
                table: "PerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DU~",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItems_OPCRId_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_MFOPAPs_Name_Code",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropIndex(
                name: "IX_Locations_Name_Code",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPIPerformanceMeasures_KPIId_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_KPIModeOfVerifications_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications");

            migrationBuilder.DropIndex(
                name: "IX_FunctionAllocations_FunctionType_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropIndex(
                name: "IX_FiscalMonths_FiscalYearId_MonthIndex",
                schema: "planning",
                table: "FiscalMonths");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_Name",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId",
                schema: "planning",
                table: "WorkflowMatrices",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "TenantId", "FiscalYearId", "OfficeId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"DocumentType\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "TenantId", "FiscalYearId", "OfficeId", "DocumentType" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_TenantId_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "TenantId", "WFPPAPId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "WFPPAPId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_WFPObjectiveActivityId_Star~1",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "TenantId", "WFPObjectiveActivityId", "StartDate", "EndDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_WFPObjectiveActivityId_Start~",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "TenantId", "WFPObjectiveActivityId", "StartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                column: "WFPObjectiveActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_TenantId_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives",
                columns: new[] { "TenantId", "WFPId", "Description" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId",
                schema: "planning",
                table: "WFPObjectives",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FundSourceId",
                schema: "planning",
                table: "Transactions",
                column: "FundSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_FundSourceId_OrganizationId_LocationI~",
                schema: "planning",
                table: "Transactions",
                columns: new[] { "TenantId", "FundSourceId", "OrganizationId", "LocationId", "MFOPAPId", "ObjectId", "TransactionDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_KPIPerformanceMeasureId",
                schema: "planning",
                table: "Ratings",
                column: "KPIPerformanceMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_TenantId_KPIPerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "Ratings",
                columns: new[] { "TenantId", "KPIPerformanceMeasureId", "NumericalRating" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_TenantId_PONumber",
                schema: "procurement",
                table: "PurchaseOrders",
                columns: new[] { "TenantId", "PONumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceMeasures_TenantId_Name",
                schema: "planning",
                table: "PerformanceMeasures",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_OfficeId",
                schema: "planning",
                table: "OPCRs",
                column: "OfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_TenantId_OfficeId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "TenantId", "OfficeId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId",
                schema: "planning",
                table: "OPCRRatings",
                column: "OPCREvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_TenantId_OPCREvaluationId_PerformanceMeasureId_~",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "TenantId", "OPCREvaluationId", "PerformanceMeasureId", "OPCRId", "DUKPITargetAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                column: "OPCRActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_TenantId_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "TenantId", "OPCRActivityId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_OPCRId",
                schema: "planning",
                table: "OPCRItems",
                column: "OPCRId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_TenantId_OPCRId_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems",
                columns: new[] { "TenantId", "OPCRId", "KPIAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRItemId",
                schema: "planning",
                table: "OPCRActivities",
                column: "OPCRItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_TenantId_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "TenantId", "OPCRItemId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_TenantId_Name_Code",
                schema: "planning",
                table: "MFOPAPs",
                columns: new[] { "TenantId", "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_Name_Code",
                schema: "planning",
                table: "Locations",
                columns: new[] { "TenantId", "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId",
                schema: "planning",
                table: "KPITargets",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_TenantId_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "TenantId", "KPIId", "Period", "QuarterName" },
                unique: true,
                filter: "\"QuarterName\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_KPIId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_TenantId_KPIId_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                columns: new[] { "TenantId", "KPIId", "PerformanceMeasureId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIModeOfVerifications_KPIId",
                schema: "planning",
                table: "KPIModeOfVerifications",
                column: "KPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIModeOfVerifications_TenantId_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications",
                columns: new[] { "TenantId", "KPIId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_TenantId_FunctionType_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                columns: new[] { "TenantId", "FunctionType", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_Year",
                schema: "planning",
                table: "FiscalYears",
                columns: new[] { "TenantId", "Year" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalMonths_FiscalYearId",
                schema: "planning",
                table: "FiscalMonths",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalMonths_TenantId_FiscalYearId_MonthIndex",
                schema: "planning",
                table: "FiscalMonths",
                columns: new[] { "TenantId", "FiscalYearId", "MonthIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_TenantId_Name",
                schema: "planning",
                table: "Clusters",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_FiscalYearId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_TenantId_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_WFPObjectiveActivityId_Star~1",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_WFPObjectiveActivityId_Start~",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_TenantId_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_FundSourceId",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TenantId_FundSourceId_OrganizationId_LocationI~",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_KPIPerformanceMeasureId",
                schema: "planning",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_TenantId_KPIPerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_TenantId_PONumber",
                schema: "procurement",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PerformanceMeasures_TenantId_Name",
                schema: "planning",
                table: "PerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_OfficeId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_TenantId_OfficeId_FiscalYearId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_OPCREvaluationId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_TenantId_OPCREvaluationId_PerformanceMeasureId_~",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_TenantId_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItems_OPCRId",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItems_TenantId_OPCRId_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_OPCRItemId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_TenantId_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_MFOPAPs_TenantId_Name_Code",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropIndex(
                name: "IX_Locations_TenantId_Name_Code",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_KPIId",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_TenantId_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPIPerformanceMeasures_KPIId",
                schema: "planning",
                table: "KPIPerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_KPIPerformanceMeasures_TenantId_KPIId_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_KPIModeOfVerifications_KPIId",
                schema: "planning",
                table: "KPIModeOfVerifications");

            migrationBuilder.DropIndex(
                name: "IX_KPIModeOfVerifications_TenantId_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications");

            migrationBuilder.DropIndex(
                name: "IX_FunctionAllocations_TenantId_FunctionType_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropIndex(
                name: "IX_FiscalYears_TenantId_Year",
                schema: "planning",
                table: "FiscalYears");

            migrationBuilder.DropIndex(
                name: "IX_FiscalMonths_FiscalYearId",
                schema: "planning",
                table: "FiscalMonths");

            migrationBuilder.DropIndex(
                name: "IX_FiscalMonths_TenantId_FiscalYearId_MonthIndex",
                schema: "planning",
                table: "FiscalMonths");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_TenantId_Name",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OfficeId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"DocumentType\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "FiscalYearId", "OfficeId", "DocumentType" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "WFPPAPId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveActivityId", "StartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate_EndD~",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "WFPObjectiveActivityId", "StartDate", "EndDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId_Description",
                schema: "planning",
                table: "WFPObjectives",
                columns: new[] { "WFPId", "Description" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FundSourceId_OrganizationId_LocationId_MFOPAPI~",
                schema: "planning",
                table: "Transactions",
                columns: new[] { "FundSourceId", "OrganizationId", "LocationId", "MFOPAPId", "ObjectId", "TransactionDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_KPIPerformanceMeasureId_NumericalRating",
                schema: "planning",
                table: "Ratings",
                columns: new[] { "KPIPerformanceMeasureId", "NumericalRating" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PONumber",
                schema: "procurement",
                table: "PurchaseOrders",
                column: "PONumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceMeasures_Name",
                schema: "planning",
                table: "PerformanceMeasures",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_OfficeId_FiscalYearId",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "OfficeId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DU~",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "OPCREvaluationId", "PerformanceMeasureId", "OPCRId", "DUKPITargetAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_OPCRActivityId_OfficeId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "OPCRActivityId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_OPCRId_KPIAssignmentId",
                schema: "planning",
                table: "OPCRItems",
                columns: new[] { "OPCRId", "KPIAssignmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_OPCRItemId_Name",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "OPCRItemId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_Name_Code",
                schema: "planning",
                table: "MFOPAPs",
                columns: new[] { "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_Name_Code",
                schema: "planning",
                table: "Locations",
                columns: new[] { "Name", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_KPIId_Period_QuarterName",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "KPIId", "Period", "QuarterName" },
                unique: true,
                filter: "\"QuarterName\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_KPIId_PerformanceMeasureId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                columns: new[] { "KPIId", "PerformanceMeasureId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIModeOfVerifications_KPIId_Name",
                schema: "planning",
                table: "KPIModeOfVerifications",
                columns: new[] { "KPIId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_FunctionType_FiscalYearId",
                schema: "planning",
                table: "FunctionAllocations",
                columns: new[] { "FunctionType", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalMonths_FiscalYearId_MonthIndex",
                schema: "planning",
                table: "FiscalMonths",
                columns: new[] { "FiscalYearId", "MonthIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_Name",
                schema: "planning",
                table: "Clusters",
                column: "Name",
                unique: true);
        }
    }
}
