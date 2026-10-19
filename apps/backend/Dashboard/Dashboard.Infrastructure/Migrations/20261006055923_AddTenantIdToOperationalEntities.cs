using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToOperationalEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubOfficeCeilings_OfficeCeilingId_SubOfficeId_FundClusterId",
                schema: "planning",
                table: "SubOfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_RFQSuppliers_RFQId_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_RFQNumber",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_TracingNumber",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQItems_RFQId_CPRItemId",
                schema: "procurement",
                table: "RFQItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_PPMPNumber",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.DropIndex(
                name: "IX_Positions_Code",
                schema: "planning",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId_Dimensio",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_FYActiveKPIMeasurementId_Requirement",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropIndex(
                name: "IX_Offices_Code",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_OfficeCeilings_OfficeId_FiscalYearId_AgencyMasterBudgetId_T~",
                schema: "planning",
                table: "OfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_OPCRActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_WFPObjectiveActiv~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_KPIs_Name",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropIndex(
                name: "IX_KPIAssignments_FYActiveKPIId_OfficeId",
                schema: "planning",
                table: "KPIAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ItemPrices_ProcurementItemId_FiscalYearId",
                schema: "planning",
                table: "ItemPrices");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfiles_Name",
                schema: "procurement",
                table: "DocumentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfileItems_DocumentProfileId_MasterDocumentTypeId",
                schema: "procurement",
                table: "DocumentProfileItems");

            migrationBuilder.DropIndex(
                name: "IX_DirectAcquisitions_DANumber",
                schema: "procurement",
                table: "DirectAcquisitions");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRs_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRItems_ConsolidatedPRId_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_Code",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropIndex(
                name: "IX_BiddingSubmissions_ProcurementProjectId_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluatedBids_BiddingEvaluationId_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropIndex(
                name: "IX_BiddingAwardRecommendations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_ResolutionNumber",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_APRs_APRNumber",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropIndex(
                name: "IX_APPs_APPNumber",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APP_PPMP_Selections_APPId_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections");

            migrationBuilder.DropIndex(
                name: "IX_AOBs_AOBNumber",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropIndex(
                name: "IX_AOBRFQMappings_AOBId_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings");

            migrationBuilder.DropIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId_FundSourceId_SourceDocumen~",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WorkflowMatrices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPPAPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPPAPDepartments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectives",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Transactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Suppliers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "SupplierRequirements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "SupplierCategories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "SupplierBids",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "SupplierBidItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "SubOfficeCeilings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "RFQSuppliers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "RFQs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "RFQItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ResolutionClauses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "RatingScaleTemplates",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "RatingScaleLevels",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Ratings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));


            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseOrders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseOrderItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ProjectDocumentChecklists",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjectApprovalEvents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjectAPPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ProcurementPolicyConfigs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ProcurementItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "PRItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PPMPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PPMPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PPMPItemAllocations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PPMPExpenditureItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PPMPActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Positions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PMTs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PMTMembers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PersonnelPositions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "PerformanceMeasures",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRRatings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRPAPDepartments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItemRatings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItemMOVs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCREvaluations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRConsolidations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityRatings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityMOVs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityEvaluations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Offices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "OfficeCeilings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeToProceeds",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwards",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwardMilestones",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwardActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "NonCSEItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MFOPAPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameterSettings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameters",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameterAttachments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingHistories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivitySettings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivityAttachments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Locations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgetDetails",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "LIBAmendmentRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPITargets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPIs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPIModeOfVerifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPIMeasurements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "KPIAssignments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ItemRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ItemPrices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "GeneratedDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FYActiveKPIs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FunctionConfigs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FunctionAllocations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FiscalYears",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "FiscalMonths",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "DUKPITargetAssignments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DocumentProfiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DocumentProfileItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectPurchaseEntries",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractingProposals",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractingProposalItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectAcquisitions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "DirectAcquisitionDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "DeliveryUnits",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "Contracts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ConsolidatedPRs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Clusters",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "BudgetCalls",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BidOpeningRecords",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingSubmissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingSubmissionItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingPostQualifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingEvaluations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingDocument",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "BACResolutionWhereasClauses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutionClauseLinks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "BACMembers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Attributes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "APRs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "APRItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "APRItemMilestones",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "APPSignatories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "APPs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "ApprovalEvents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "APPProcurementSchedules",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "ApplicationUploadedDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "APPItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "AOBs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "AOBRFQMappings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "procurement",
                table: "AOBAwardedItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "AgencyMasterBudgets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "planning",
                table: "Agencies",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers",
                columns: new[] { "TenantId", "BusinessPermitNo" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_TINNumber",
                schema: "planning",
                table: "Suppliers",
                columns: new[] { "TenantId", "TINNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_TenantId_Name",
                schema: "planning",
                table: "SupplierCategories",
                columns: new[] { "TenantId", "Name" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_TenantId_OfficeCeilingId_SubOfficeId_Fund~",
                schema: "planning",
                table: "SubOfficeCeilings",
                columns: new[] { "TenantId", "OfficeCeilingId", "SubOfficeId", "FundClusterId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_TenantId_RFQId_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers",
                columns: new[] { "TenantId", "RFQId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_TenantId_RFQNumber",
                schema: "procurement",
                table: "RFQs",
                columns: new[] { "TenantId", "RFQNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_TenantId_TracingNumber",
                schema: "procurement",
                table: "RFQs",
                columns: new[] { "TenantId", "TracingNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_TenantId_RFQId_CPRItemId",
                schema: "procurement",
                table: "RFQItems",
                columns: new[] { "TenantId", "RFQId", "CPRItemId" },
                unique: true);


            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_TenantId_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests",
                columns: new[] { "TenantId", "PRNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_TenantId_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects",
                columns: new[] { "TenantId", "ConsolidatedPRId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_TenantId_PPMPNumber",
                schema: "planning",
                table: "PPMPs",
                columns: new[] { "TenantId", "PPMPNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId",
                schema: "planning",
                table: "PPMPItemAllocations",
                column: "PPMPItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_TenantId_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "TenantId", "PPMPItemId", "AllocationMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_PPMPId",
                schema: "planning",
                table: "PPMPActivities",
                column: "PPMPId");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_TenantId_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "TenantId", "PPMPId", "LIBActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_Code",
                schema: "planning",
                table: "Positions",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_TenantId_OPCRItemId_FYActiveKPIMeasurementI~",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "TenantId", "OPCRItemId", "FYActiveKPIMeasurementId", "Dimension" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_TenantId_OPCRItemId_FYActiveKPIMeasurementId_R~",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "TenantId", "OPCRItemId", "FYActiveKPIMeasurementId", "RequirementName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offices_TenantId_Code",
                schema: "planning",
                table: "Offices",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_TenantId_OfficeId_FiscalYearId_AgencyMasterB~",
                schema: "planning",
                table: "OfficeCeilings",
                columns: new[] { "TenantId", "OfficeId", "FiscalYearId", "AgencyMasterBudgetId", "TargetType", "IsSupplemental" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TenantId_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                columns: new[] { "TenantId", "TargetLineItemBudgetActivityId" },
                unique: true,
                filter: "\"TargetLineItemBudgetActivityId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TenantId_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                columns: new[] { "TenantId", "TargetLineItemBudgetId" },
                unique: true,
                filter: "\"TargetLineItemBudgetId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_TenantId_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets",
                columns: new[] { "TenantId", "LIBNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_TenantId_LineItemBudgetId_OPCRActi~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "TenantId", "LineItemBudgetId", "OPCRActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"OPCRActivityId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_TenantId_LineItemBudgetId_WFPObjec~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "TenantId", "LineItemBudgetId", "WFPObjectiveActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"WFPObjectiveActivityId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_Name",
                schema: "planning",
                table: "KPIs",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_TenantId_Name",
                schema: "planning",
                table: "KPIs",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_FYActiveKPIId",
                schema: "planning",
                table: "KPIAssignments",
                column: "FYActiveKPIId");

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_TenantId_FYActiveKPIId_OfficeId",
                schema: "planning",
                table: "KPIAssignments",
                columns: new[] { "TenantId", "FYActiveKPIId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_ProcurementItemId",
                schema: "planning",
                table: "ItemPrices",
                column: "ProcurementItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_TenantId_ProcurementItemId_FiscalYearId",
                schema: "planning",
                table: "ItemPrices",
                columns: new[] { "TenantId", "ProcurementItemId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfiles_TenantId_Name",
                schema: "procurement",
                table: "DocumentProfiles",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_DocumentProfileId",
                schema: "procurement",
                table: "DocumentProfileItems",
                column: "DocumentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_TenantId_DocumentProfileId_MasterDocum~",
                schema: "procurement",
                table: "DocumentProfileItems",
                columns: new[] { "TenantId", "DocumentProfileId", "MasterDocumentTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_TenantId_DANumber",
                schema: "procurement",
                table: "DirectAcquisitions",
                columns: new[] { "TenantId", "DANumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_TenantId_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs",
                columns: new[] { "TenantId", "CPRNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_TenantId_ConsolidatedPRId_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                columns: new[] { "TenantId", "ConsolidatedPRId", "PRItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_TenantId_Code",
                schema: "planning",
                table: "Clusters",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BidOpeningRecords_TenantId_BiddingSubmissionId",
                schema: "procurement",
                table: "BidOpeningRecords",
                columns: new[] { "TenantId", "BiddingSubmissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingSubmissions",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_TenantId_ProcurementProjectId_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions",
                columns: new[] { "TenantId", "ProcurementProjectId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingPostQualifications_TenantId_BiddingEvaluatedBidId",
                schema: "procurement",
                table: "BiddingPostQualifications",
                columns: new[] { "TenantId", "BiddingEvaluatedBidId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluations_TenantId_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations",
                columns: new[] { "TenantId", "ProcurementProjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_BiddingEvaluationId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                column: "BiddingEvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_BiddingEvaluationId_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                columns: new[] { "TenantId", "BiddingEvaluationId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_BidOpeningRecordId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                columns: new[] { "TenantId", "BidOpeningRecordId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                column: "ProcurementProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_BiddingPostQualificati~",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                columns: new[] { "TenantId", "BiddingPostQualificationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                columns: new[] { "TenantId", "ProcurementProjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions",
                column: "BiddingAwardRecommendationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_TenantId_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions",
                columns: new[] { "TenantId", "BiddingAwardRecommendationId" },
                unique: true,
                filter: "\"BiddingAwardRecommendationId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_TenantId_ResolutionNumber",
                schema: "procurement",
                table: "BACResolutions",
                columns: new[] { "TenantId", "ResolutionNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_TenantId_APRNumber",
                schema: "procurement",
                table: "APRs",
                columns: new[] { "TenantId", "APRNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_APPs_TenantId_APPNumber",
                schema: "planning",
                table: "APPs",
                columns: new[] { "TenantId", "APPNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_APPId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                column: "APPId");

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_TenantId_APPId_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                columns: new[] { "TenantId", "APPId", "PPMPId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBs_TenantId_AOBNumber",
                schema: "procurement",
                table: "AOBs",
                columns: new[] { "TenantId", "AOBNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_AOBId",
                schema: "procurement",
                table: "AOBRFQMappings",
                column: "AOBId");

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_TenantId_AOBId_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings",
                columns: new[] { "TenantId", "AOBId", "RFQId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_TenantId_FiscalYearId_FundSourceId_Sour~",
                schema: "planning",
                table: "AgencyMasterBudgets",
                columns: new[] { "TenantId", "FiscalYearId", "FundSourceId", "SourceDocumentType" },
                unique: true);


            // Backfill existing operational data to development tenant 'NextJump Solutions'
            migrationBuilder.Sql(@"
DO $$
DECLARE
    target_tenant uuid := '01a0d69d-924b-762c-a774-523a30544619';
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_schema, table_name 
        FROM information_schema.columns 
        WHERE column_name = 'TenantId' 
          AND table_schema IN ('planning', 'procurement')
    ) LOOP
        EXECUTE format('UPDATE %I.%I SET ""TenantId"" = %L WHERE ""TenantId"" = ''00000000-0000-0000-0000-000000000000''', 
            r.table_schema, r.table_name, target_tenant);
    END LOOP;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequests_APRs_APRId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_TINNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_SupplierCategories_TenantId_Name",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubOfficeCeilings_TenantId_OfficeCeilingId_SubOfficeId_Fund~",
                schema: "planning",
                table: "SubOfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_RFQSuppliers_TenantId_RFQId_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_TenantId_RFQNumber",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_TenantId_TracingNumber",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQItems_TenantId_RFQId_CPRItemId",
                schema: "procurement",
                table: "RFQItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_APRId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_TenantId_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_TenantId_ConsolidatedPRId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_TenantId_PPMPNumber",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_TenantId_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_PPMPId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_TenantId_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.DropIndex(
                name: "IX_Positions_TenantId_Code",
                schema: "planning",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemRatings_TenantId_OPCRItemId_FYActiveKPIMeasurementI~",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_TenantId_OPCRItemId_FYActiveKPIMeasurementId_R~",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropIndex(
                name: "IX_Offices_TenantId_Code",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_OfficeCeilings_TenantId_OfficeId_FiscalYearId_AgencyMasterB~",
                schema: "planning",
                table: "OfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TenantId_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TenantId_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_TenantId_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_TenantId_LineItemBudgetId_OPCRActi~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_TenantId_LineItemBudgetId_WFPObjec~",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_KPIs_Name",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropIndex(
                name: "IX_KPIs_TenantId_Name",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropIndex(
                name: "IX_KPIAssignments_FYActiveKPIId",
                schema: "planning",
                table: "KPIAssignments");

            migrationBuilder.DropIndex(
                name: "IX_KPIAssignments_TenantId_FYActiveKPIId_OfficeId",
                schema: "planning",
                table: "KPIAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ItemPrices_ProcurementItemId",
                schema: "planning",
                table: "ItemPrices");

            migrationBuilder.DropIndex(
                name: "IX_ItemPrices_TenantId_ProcurementItemId_FiscalYearId",
                schema: "planning",
                table: "ItemPrices");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfiles_TenantId_Name",
                schema: "procurement",
                table: "DocumentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfileItems_DocumentProfileId",
                schema: "procurement",
                table: "DocumentProfileItems");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfileItems_TenantId_DocumentProfileId_MasterDocum~",
                schema: "procurement",
                table: "DocumentProfileItems");

            migrationBuilder.DropIndex(
                name: "IX_DirectAcquisitions_TenantId_DANumber",
                schema: "procurement",
                table: "DirectAcquisitions");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRs_TenantId_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRItems_TenantId_ConsolidatedPRId_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_TenantId_Code",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropIndex(
                name: "IX_BidOpeningRecords_TenantId_BiddingSubmissionId",
                schema: "procurement",
                table: "BidOpeningRecords");

            migrationBuilder.DropIndex(
                name: "IX_BiddingSubmissions_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_BiddingSubmissions_TenantId_ProcurementProjectId_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_BiddingPostQualifications_TenantId_BiddingEvaluatedBidId",
                schema: "procurement",
                table: "BiddingPostQualifications");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluations_TenantId_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluatedBids_BiddingEvaluationId",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_BiddingEvaluationId_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_BidOpeningRecordId",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropIndex(
                name: "IX_BiddingAwardRecommendations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_BiddingPostQualificati~",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_TenantId_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_TenantId_ResolutionNumber",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_APRs_TenantId_APRNumber",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropIndex(
                name: "IX_APPs_TenantId_APPNumber",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_APP_PPMP_Selections_APPId",
                schema: "planning",
                table: "APP_PPMP_Selections");

            migrationBuilder.DropIndex(
                name: "IX_APP_PPMP_Selections_TenantId_APPId_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections");

            migrationBuilder.DropIndex(
                name: "IX_AOBs_TenantId_AOBNumber",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropIndex(
                name: "IX_AOBRFQMappings_AOBId",
                schema: "procurement",
                table: "AOBRFQMappings");

            migrationBuilder.DropIndex(
                name: "IX_AOBRFQMappings_TenantId_AOBId_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings");

            migrationBuilder.DropIndex(
                name: "IX_AgencyMasterBudgets_TenantId_FiscalYearId_FundSourceId_Sour~",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPPAPs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "SupplierRequirements");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "SubOfficeCeilings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "RFQSuppliers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "RFQItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ResolutionClauses");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "RatingScaleTemplates");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "RatingScaleLevels");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "APRId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "PurchaseOrderItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ProjectDocumentChecklists");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjectApprovalEvents");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ProcurementProjectAPPItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ProcurementPolicyConfigs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ProcurementItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Positions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PMTs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PersonnelPositions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "PerformanceMeasures");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCREvaluations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRConsolidations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityRatings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityMOVs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivityEvaluations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "OfficeCeilings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeToProceeds");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwards");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwardMilestones");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "NoticeOfAwardActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameterSettings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameters");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingParameterAttachments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingHistories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivitySettings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivityAttachments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "MarketScopingActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "LIBAmendmentRequests");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPIPerformanceMeasures");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPIModeOfVerifications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPIMeasurements");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "KPIAssignments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ItemRequests");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ItemPrices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "GeneratedDocuments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FYActiveKPIs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FYActiveKPIMeasurements");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FunctionConfigs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FiscalYears");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "FiscalMonths");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "DUKPITargetAssignments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DocumentProfiles");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DocumentProfileItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectPurchaseEntries");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractingProposals");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectContractingProposalItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectAcquisitions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "DirectAcquisitionDocuments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "DeliveryUnits");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ConsolidatedPRs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ConsolidatedPRItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "BudgetCalls");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BidOpeningRecords");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingSubmissions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingSubmissionItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingPostQualifications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingEvaluations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingDocument");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "BACResolutionWhereasClauses");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BACResolutionClauseLinks");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "BACMembers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Attributes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "APRItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "APRItemMilestones");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "APPSignatories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "APPProcurementSchedules");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "ApplicationUploadedDocuments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "APP_PPMP_Selections");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "AOBRFQMappings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "AOBProcurementProjectMappings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "planning",
                table: "Agencies");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_BusinessPermitNo",
                schema: "planning",
                table: "Suppliers",
                column: "BusinessPermitNo",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TINNumber",
                schema: "planning",
                table: "Suppliers",
                column: "TINNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_Name",
                schema: "planning",
                table: "SupplierCategories",
                column: "Name",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_OfficeCeilingId_SubOfficeId_FundClusterId",
                schema: "planning",
                table: "SubOfficeCeilings",
                columns: new[] { "OfficeCeilingId", "SubOfficeId", "FundClusterId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_RFQId_SupplierId",
                schema: "procurement",
                table: "RFQSuppliers",
                columns: new[] { "RFQId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_RFQNumber",
                schema: "procurement",
                table: "RFQs",
                column: "RFQNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_TracingNumber",
                schema: "procurement",
                table: "RFQs",
                column: "TracingNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_RFQId_CPRItemId",
                schema: "procurement",
                table: "RFQItems",
                columns: new[] { "RFQId", "CPRItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "PRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_PPMPNumber",
                schema: "planning",
                table: "PPMPs",
                column: "PPMPNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_PPMPItemId_AllocationMonth",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "PPMPItemId", "AllocationMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_PPMPId_LIBActivityId",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "PPMPId", "LIBActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_Code",
                schema: "planning",
                table: "Positions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_OPCRItemId_FYActiveKPIMeasurementId_Dimensi~",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "OPCRItemId", "FYActiveKPIMeasurementId", "Dimension" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_OPCRItemId_FYActiveKPIMeasurementId_Requiremen~",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "OPCRItemId", "FYActiveKPIMeasurementId", "RequirementName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offices_Code",
                schema: "planning",
                table: "Offices",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_OfficeId_FiscalYearId_AgencyMasterBudgetId_T~",
                schema: "planning",
                table: "OfficeCeilings",
                columns: new[] { "OfficeId", "FiscalYearId", "AgencyMasterBudgetId", "TargetType", "IsSupplemental" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetActivityId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetActivityId",
                unique: true,
                filter: "\"TargetLineItemBudgetActivityId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TargetLineItemBudgetId",
                schema: "planning",
                table: "MarketScopings",
                column: "TargetLineItemBudgetId",
                unique: true,
                filter: "\"TargetLineItemBudgetId\" IS NOT NULL AND \"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_LIBNumber",
                schema: "planning",
                table: "LineItemBudgets",
                column: "LIBNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_OPCRActivityId",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "LineItemBudgetId", "OPCRActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"OPCRActivityId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_LineItemBudgetId_WFPObjectiveActiv~",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "LineItemBudgetId", "WFPObjectiveActivityId" },
                unique: true,
                filter: "\"IsDeleted\" = false AND \"WFPObjectiveActivityId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_Name",
                schema: "planning",
                table: "KPIs",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_FYActiveKPIId_OfficeId",
                schema: "planning",
                table: "KPIAssignments",
                columns: new[] { "FYActiveKPIId", "OfficeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_ProcurementItemId_FiscalYearId",
                schema: "planning",
                table: "ItemPrices",
                columns: new[] { "ProcurementItemId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfiles_Name",
                schema: "procurement",
                table: "DocumentProfiles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_DocumentProfileId_MasterDocumentTypeId",
                schema: "procurement",
                table: "DocumentProfileItems",
                columns: new[] { "DocumentProfileId", "MasterDocumentTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_DANumber",
                schema: "procurement",
                table: "DirectAcquisitions",
                column: "DANumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs",
                column: "CPRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_ConsolidatedPRId_PRItemId",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                columns: new[] { "ConsolidatedPRId", "PRItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_Code",
                schema: "planning",
                table: "Clusters",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_ProcurementProjectId_SupplierId",
                schema: "procurement",
                table: "BiddingSubmissions",
                columns: new[] { "ProcurementProjectId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingEvaluations",
                column: "ProcurementProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_BiddingEvaluationId_SupplierId",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                columns: new[] { "BiddingEvaluationId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_ProcurementProjectId",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                column: "ProcurementProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_BiddingAwardRecommendationId",
                schema: "procurement",
                table: "BACResolutions",
                column: "BiddingAwardRecommendationId",
                unique: true,
                filter: "\"BiddingAwardRecommendationId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_ResolutionNumber",
                schema: "procurement",
                table: "BACResolutions",
                column: "ResolutionNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_APRNumber",
                schema: "procurement",
                table: "APRs",
                column: "APRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_APPs_APPNumber",
                schema: "planning",
                table: "APPs",
                column: "APPNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_APPId_PPMPId",
                schema: "planning",
                table: "APP_PPMP_Selections",
                columns: new[] { "APPId", "PPMPId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBs_AOBNumber",
                schema: "procurement",
                table: "AOBs",
                column: "AOBNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_AOBId_RFQId",
                schema: "procurement",
                table: "AOBRFQMappings",
                columns: new[] { "AOBId", "RFQId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_FiscalYearId_FundSourceId_SourceDocumen~",
                schema: "planning",
                table: "AgencyMasterBudgets",
                columns: new[] { "FiscalYearId", "FundSourceId", "SourceDocumentType" },
                unique: true);
        }
    }
}
