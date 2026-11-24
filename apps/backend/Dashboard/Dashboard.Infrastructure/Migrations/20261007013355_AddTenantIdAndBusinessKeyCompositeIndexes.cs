using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdAndBusinessKeyCompositeIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_Email",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_PhilGEPSNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIs_Code",
                schema: "planning",
                table: "FYActiveKPIs");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowMatrices_TenantId_Id",
                schema: "planning",
                table: "WorkflowMatrices",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_TenantId_Id",
                schema: "planning",
                table: "WFPs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPs_TenantId_Id",
                schema: "planning",
                table: "WFPPAPs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_TenantId_Id",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveTimelines",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_TenantId_Id",
                schema: "planning",
                table: "WFPObjectives",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivityExpenditures_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectiveActivities_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TenantId_Id",
                schema: "planning",
                table: "Transactions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_Email",
                schema: "planning",
                table: "Suppliers",
                columns: new[] { "TenantId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_Id",
                schema: "planning",
                table: "Suppliers",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_TenantId_PhilGEPSNumber",
                schema: "planning",
                table: "Suppliers",
                columns: new[] { "TenantId", "PhilGEPSNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierRequirements_TenantId_Id",
                schema: "planning",
                table: "SupplierRequirements",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCategories_TenantId_Id",
                schema: "planning",
                table: "SupplierCategories",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBids_TenantId_Id",
                schema: "procurement",
                table: "SupplierBids",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierBidItems_TenantId_Id",
                schema: "procurement",
                table: "SupplierBidItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_SubOfficeCeilings_TenantId_Id",
                schema: "planning",
                table: "SubOfficeCeilings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RFQSuppliers_TenantId_Id",
                schema: "procurement",
                table: "RFQSuppliers",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RFQs_TenantId_Id",
                schema: "procurement",
                table: "RFQs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RFQItems_TenantId_Id",
                schema: "procurement",
                table: "RFQItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ResolutionClauses_TenantId_Id",
                schema: "planning",
                table: "ResolutionClauses",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleTemplates_TenantId_Id",
                schema: "planning",
                table: "RatingScaleTemplates",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RatingScaleLevels_TenantId_Id",
                schema: "planning",
                table: "RatingScaleLevels",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_TenantId_Id",
                schema: "planning",
                table: "Ratings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_TenantId_Id",
                schema: "procurement",
                table: "PurchaseRequests",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_TenantId_Id",
                schema: "procurement",
                table: "PurchaseOrders",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderItems_TenantId_Id",
                schema: "procurement",
                table: "PurchaseOrderItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDocumentChecklists_TenantId_Id",
                schema: "procurement",
                table: "ProjectDocumentChecklists",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjects_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjects",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjectApprovalEvents_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjectApprovalEvents",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementProjectAPPItems_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjectAPPItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementPolicyConfigs_TenantId_Id",
                schema: "planning",
                table: "ProcurementPolicyConfigs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementItems_TenantId_Id",
                schema: "planning",
                table: "ProcurementItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PRItems_TenantId_Id",
                schema: "procurement",
                table: "PRItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPs_TenantId_Id",
                schema: "planning",
                table: "PPMPs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItems_TenantId_Id",
                schema: "planning",
                table: "PPMPItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPItemAllocations_TenantId_Id",
                schema: "planning",
                table: "PPMPItemAllocations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPExpenditureItems_TenantId_Id",
                schema: "planning",
                table: "PPMPExpenditureItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PPMPActivities_TenantId_Id",
                schema: "planning",
                table: "PPMPActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_Id",
                schema: "planning",
                table: "Positions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PMTs_TenantId_Id",
                schema: "planning",
                table: "PMTs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PMTMembers_TenantId_Id",
                schema: "planning",
                table: "PMTMembers",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PersonnelPositions_TenantId_Id",
                schema: "planning",
                table: "PersonnelPositions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceMeasures_TenantId_Id",
                schema: "planning",
                table: "PerformanceMeasures",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_TenantId_Code",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "TenantId", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_TenantId_Id",
                schema: "planning",
                table: "OPCRs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRRatings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRPAPDepartments_TenantId_Id",
                schema: "planning",
                table: "OPCRPAPDepartments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItems_TenantId_Id",
                schema: "planning",
                table: "OPCRItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRItemRatings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRItemMOVs_TenantId_Id",
                schema: "planning",
                table: "OPCRItemMOVs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCREvaluations_TenantId_Id",
                schema: "planning",
                table: "OPCREvaluations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRConsolidations_TenantId_Id",
                schema: "planning",
                table: "OPCRConsolidations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityRatings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityMOVs_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityMOVs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivityEvaluations_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityEvaluations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OPCRActivities_TenantId_Id",
                schema: "planning",
                table: "OPCRActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Offices_TenantId_Id",
                schema: "planning",
                table: "Offices",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_OfficeCeilings_TenantId_Id",
                schema: "planning",
                table: "OfficeCeilings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeToProceeds_TenantId_Id",
                schema: "procurement",
                table: "NoticeToProceeds",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwards_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwards",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwardMilestones_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwardMilestones",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_NoticeOfAwardActivities_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwardActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_NonCSEItems_TenantId_Id",
                schema: "planning",
                table: "NonCSEItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MFOPAPs_TenantId_Id",
                schema: "planning",
                table: "MFOPAPs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopings_TenantId_Id",
                schema: "planning",
                table: "MarketScopings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameterSettings_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameterSettings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameters_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameters",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingParameterAttachments_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameterAttachments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingHistories_TenantId_Id",
                schema: "planning",
                table: "MarketScopingHistories",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivitySettings_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivitySettings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivityAttachments_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivityAttachments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MarketScopingActivities_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Locations_TenantId_Id",
                schema: "planning",
                table: "Locations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgets_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgets",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetDetails_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgetDetails",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_LineItemBudgetActivities_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgetActivities",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_LIBAmendmentRequests_TenantId_Id",
                schema: "planning",
                table: "LIBAmendmentRequests",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPITargets_TenantId_Id",
                schema: "planning",
                table: "KPITargets",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_TenantId_Code",
                schema: "planning",
                table: "KPIs",
                columns: new[] { "TenantId", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_TenantId_Id",
                schema: "planning",
                table: "KPIs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIPerformanceMeasures_TenantId_Id",
                schema: "planning",
                table: "KPIPerformanceMeasures",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIModeOfVerifications_TenantId_Id",
                schema: "planning",
                table: "KPIModeOfVerifications",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIMeasurements_TenantId_Id",
                schema: "planning",
                table: "KPIMeasurements",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_KPIAssignments_TenantId_Id",
                schema: "planning",
                table: "KPIAssignments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ItemRequests_TenantId_Id",
                schema: "planning",
                table: "ItemRequests",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ItemPrices_TenantId_Id",
                schema: "planning",
                table: "ItemPrices",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_TenantId_Id",
                schema: "planning",
                table: "GeneratedDocuments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_TenantId_Code",
                schema: "planning",
                table: "FYActiveKPIs",
                columns: new[] { "TenantId", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_TenantId_Id",
                schema: "planning",
                table: "FYActiveKPIs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIMeasurements_TenantId_Id",
                schema: "planning",
                table: "FYActiveKPIMeasurements",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FunctionConfigs_TenantId_Id",
                schema: "planning",
                table: "FunctionConfigs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FunctionAllocations_TenantId_Id",
                schema: "planning",
                table: "FunctionAllocations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_Id",
                schema: "planning",
                table: "FiscalYears",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalMonths_TenantId_Id",
                schema: "planning",
                table: "FiscalMonths",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DUKPITargetAssignments_TenantId_Id",
                schema: "planning",
                table: "DUKPITargetAssignments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfiles_TenantId_Id",
                schema: "procurement",
                table: "DocumentProfiles",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentProfileItems_TenantId_Id",
                schema: "procurement",
                table: "DocumentProfileItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectPurchaseEntries_TenantId_Id",
                schema: "procurement",
                table: "DirectPurchaseEntries",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractings_TenantId_Id",
                schema: "procurement",
                table: "DirectContractings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposals_TenantId_Id",
                schema: "procurement",
                table: "DirectContractingProposals",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectContractingProposalItems_TenantId_Id",
                schema: "procurement",
                table: "DirectContractingProposalItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitions_TenantId_Id",
                schema: "procurement",
                table: "DirectAcquisitions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DirectAcquisitionDocuments_TenantId_Id",
                schema: "procurement",
                table: "DirectAcquisitionDocuments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnits_TenantId_Id",
                schema: "planning",
                table: "DeliveryUnits",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_TenantId_Id",
                schema: "procurement",
                table: "Contracts",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_TenantId_Id",
                schema: "procurement",
                table: "ConsolidatedPRs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRItems_TenantId_Id",
                schema: "procurement",
                table: "ConsolidatedPRItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Clusters_TenantId_Id",
                schema: "planning",
                table: "Clusters",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetCalls_TenantId_Id",
                schema: "planning",
                table: "BudgetCalls",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BidOpeningRecords_TenantId_Id",
                schema: "procurement",
                table: "BidOpeningRecords",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissions_TenantId_Id",
                schema: "procurement",
                table: "BiddingSubmissions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingSubmissionItems_TenantId_Id",
                schema: "procurement",
                table: "BiddingSubmissionItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingPostQualifications_TenantId_Id",
                schema: "procurement",
                table: "BiddingPostQualifications",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluations_TenantId_Id",
                schema: "procurement",
                table: "BiddingEvaluations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_Id",
                schema: "procurement",
                table: "BiddingEvaluatedBids",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingDocument_TenantId_Id",
                schema: "procurement",
                table: "BiddingDocument",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_Id",
                schema: "procurement",
                table: "BiddingAwardRecommendations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BiddingActivitySchedules_TenantId_Id",
                schema: "procurement",
                table: "BiddingActivitySchedules",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionWhereasClauses_TenantId_Id",
                schema: "planning",
                table: "BACResolutionWhereasClauses",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionWhereasClauseItems_TenantId_Id",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutions_TenantId_Id",
                schema: "procurement",
                table: "BACResolutions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BACResolutionClauseLinks_TenantId_Id",
                schema: "procurement",
                table: "BACResolutionClauseLinks",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_BACMembers_TenantId_Id",
                schema: "procurement",
                table: "BACMembers",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Attributes_TenantId_Id",
                schema: "planning",
                table: "Attributes",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APRs_TenantId_Id",
                schema: "procurement",
                table: "APRs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APRItems_TenantId_Id",
                schema: "procurement",
                table: "APRItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APRItemMilestones_TenantId_Id",
                schema: "procurement",
                table: "APRItemMilestones",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APPSignatories_TenantId_Id",
                schema: "planning",
                table: "APPSignatories",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APPs_TenantId_Id",
                schema: "planning",
                table: "APPs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalEvents_TenantId_Id",
                schema: "planning",
                table: "ApprovalEvents",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APPProcurementSchedules_TenantId_Id",
                schema: "planning",
                table: "APPProcurementSchedules",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUploadedDocuments_TenantId_Id",
                schema: "procurement",
                table: "ApplicationUploadedDocuments",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APPItems_TenantId_Id",
                schema: "planning",
                table: "APPItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_APP_PPMP_Selections_TenantId_Id",
                schema: "planning",
                table: "APP_PPMP_Selections",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_AOBs_TenantId_Id",
                schema: "procurement",
                table: "AOBs",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_AOBRFQMappings_TenantId_Id",
                schema: "procurement",
                table: "AOBRFQMappings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_AOBProcurementProjectMappings_TenantId_Id",
                schema: "procurement",
                table: "AOBProcurementProjectMappings",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_AOBAwardedItems_TenantId_Id",
                schema: "procurement",
                table: "AOBAwardedItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_AgencyMasterBudgets_TenantId_Id",
                schema: "planning",
                table: "AgencyMasterBudgets",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Agencies_TenantId_Id",
                schema: "planning",
                table: "Agencies",
                columns: new[] { "TenantId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkflowMatrices_TenantId_Id",
                schema: "planning",
                table: "WorkflowMatrices");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_TenantId_Id",
                schema: "planning",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPs_TenantId_Id",
                schema: "planning",
                table: "WFPPAPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_TenantId_Id",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveTimelines_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveTimelines");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_TenantId_Id",
                schema: "planning",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveActivityExpenditures_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveActivityExpenditures");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectiveActivities_TenantId_Id",
                schema: "planning",
                table: "WFPObjectiveActivities");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TenantId_Id",
                schema: "planning",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_Email",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_Id",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_TenantId_PhilGEPSNumber",
                schema: "planning",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_SupplierRequirements_TenantId_Id",
                schema: "planning",
                table: "SupplierRequirements");

            migrationBuilder.DropIndex(
                name: "IX_SupplierCategories_TenantId_Id",
                schema: "planning",
                table: "SupplierCategories");

            migrationBuilder.DropIndex(
                name: "IX_SupplierBids_TenantId_Id",
                schema: "procurement",
                table: "SupplierBids");

            migrationBuilder.DropIndex(
                name: "IX_SupplierBidItems_TenantId_Id",
                schema: "procurement",
                table: "SupplierBidItems");

            migrationBuilder.DropIndex(
                name: "IX_SubOfficeCeilings_TenantId_Id",
                schema: "planning",
                table: "SubOfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_RFQSuppliers_TenantId_Id",
                schema: "procurement",
                table: "RFQSuppliers");

            migrationBuilder.DropIndex(
                name: "IX_RFQs_TenantId_Id",
                schema: "procurement",
                table: "RFQs");

            migrationBuilder.DropIndex(
                name: "IX_RFQItems_TenantId_Id",
                schema: "procurement",
                table: "RFQItems");

            migrationBuilder.DropIndex(
                name: "IX_ResolutionClauses_TenantId_Id",
                schema: "planning",
                table: "ResolutionClauses");

            migrationBuilder.DropIndex(
                name: "IX_RatingScaleTemplates_TenantId_Id",
                schema: "planning",
                table: "RatingScaleTemplates");

            migrationBuilder.DropIndex(
                name: "IX_RatingScaleLevels_TenantId_Id",
                schema: "planning",
                table: "RatingScaleLevels");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_TenantId_Id",
                schema: "planning",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_TenantId_Id",
                schema: "procurement",
                table: "PurchaseRequests");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_TenantId_Id",
                schema: "procurement",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrderItems_TenantId_Id",
                schema: "procurement",
                table: "PurchaseOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_ProjectDocumentChecklists_TenantId_Id",
                schema: "procurement",
                table: "ProjectDocumentChecklists");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjects_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjects");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjectApprovalEvents_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjectApprovalEvents");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementProjectAPPItems_TenantId_Id",
                schema: "procurement",
                table: "ProcurementProjectAPPItems");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementPolicyConfigs_TenantId_Id",
                schema: "planning",
                table: "ProcurementPolicyConfigs");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementItems_TenantId_Id",
                schema: "planning",
                table: "ProcurementItems");

            migrationBuilder.DropIndex(
                name: "IX_PRItems_TenantId_Id",
                schema: "procurement",
                table: "PRItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPs_TenantId_Id",
                schema: "planning",
                table: "PPMPs");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItems_TenantId_Id",
                schema: "planning",
                table: "PPMPItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPItemAllocations_TenantId_Id",
                schema: "planning",
                table: "PPMPItemAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PPMPExpenditureItems_TenantId_Id",
                schema: "planning",
                table: "PPMPExpenditureItems");

            migrationBuilder.DropIndex(
                name: "IX_PPMPActivities_TenantId_Id",
                schema: "planning",
                table: "PPMPActivities");

            migrationBuilder.DropIndex(
                name: "IX_Positions_TenantId_Id",
                schema: "planning",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_PMTs_TenantId_Id",
                schema: "planning",
                table: "PMTs");

            migrationBuilder.DropIndex(
                name: "IX_PMTMembers_TenantId_Id",
                schema: "planning",
                table: "PMTMembers");

            migrationBuilder.DropIndex(
                name: "IX_PersonnelPositions_TenantId_Id",
                schema: "planning",
                table: "PersonnelPositions");

            migrationBuilder.DropIndex(
                name: "IX_PerformanceMeasures_TenantId_Id",
                schema: "planning",
                table: "PerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_TenantId_Code",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_TenantId_Id",
                schema: "planning",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRPAPDepartments_TenantId_Id",
                schema: "planning",
                table: "OPCRPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItems_TenantId_Id",
                schema: "planning",
                table: "OPCRItems");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRItemRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRItemMOVs_TenantId_Id",
                schema: "planning",
                table: "OPCRItemMOVs");

            migrationBuilder.DropIndex(
                name: "IX_OPCREvaluations_TenantId_Id",
                schema: "planning",
                table: "OPCREvaluations");

            migrationBuilder.DropIndex(
                name: "IX_OPCRConsolidations_TenantId_Id",
                schema: "planning",
                table: "OPCRConsolidations");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivityRatings_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityRatings");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivityMOVs_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityMOVs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivityEvaluations_TenantId_Id",
                schema: "planning",
                table: "OPCRActivityEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_OPCRActivities_TenantId_Id",
                schema: "planning",
                table: "OPCRActivities");

            migrationBuilder.DropIndex(
                name: "IX_Offices_TenantId_Id",
                schema: "planning",
                table: "Offices");

            migrationBuilder.DropIndex(
                name: "IX_OfficeCeilings_TenantId_Id",
                schema: "planning",
                table: "OfficeCeilings");

            migrationBuilder.DropIndex(
                name: "IX_NoticeToProceeds_TenantId_Id",
                schema: "procurement",
                table: "NoticeToProceeds");

            migrationBuilder.DropIndex(
                name: "IX_NoticeOfAwards_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwards");

            migrationBuilder.DropIndex(
                name: "IX_NoticeOfAwardMilestones_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwardMilestones");

            migrationBuilder.DropIndex(
                name: "IX_NoticeOfAwardActivities_TenantId_Id",
                schema: "procurement",
                table: "NoticeOfAwardActivities");

            migrationBuilder.DropIndex(
                name: "IX_NonCSEItems_TenantId_Id",
                schema: "planning",
                table: "NonCSEItems");

            migrationBuilder.DropIndex(
                name: "IX_MFOPAPs_TenantId_Id",
                schema: "planning",
                table: "MFOPAPs");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopings_TenantId_Id",
                schema: "planning",
                table: "MarketScopings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingParameterSettings_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameterSettings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingParameters_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameters");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingParameterAttachments_TenantId_Id",
                schema: "planning",
                table: "MarketScopingParameterAttachments");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingHistories_TenantId_Id",
                schema: "planning",
                table: "MarketScopingHistories");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingActivitySettings_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivitySettings");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingActivityAttachments_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivityAttachments");

            migrationBuilder.DropIndex(
                name: "IX_MarketScopingActivities_TenantId_Id",
                schema: "planning",
                table: "MarketScopingActivities");

            migrationBuilder.DropIndex(
                name: "IX_Locations_TenantId_Id",
                schema: "planning",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgets_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgets");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetDetails_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgetDetails");

            migrationBuilder.DropIndex(
                name: "IX_LineItemBudgetActivities_TenantId_Id",
                schema: "planning",
                table: "LineItemBudgetActivities");

            migrationBuilder.DropIndex(
                name: "IX_LIBAmendmentRequests_TenantId_Id",
                schema: "planning",
                table: "LIBAmendmentRequests");

            migrationBuilder.DropIndex(
                name: "IX_KPITargets_TenantId_Id",
                schema: "planning",
                table: "KPITargets");

            migrationBuilder.DropIndex(
                name: "IX_KPIs_TenantId_Code",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropIndex(
                name: "IX_KPIs_TenantId_Id",
                schema: "planning",
                table: "KPIs");

            migrationBuilder.DropIndex(
                name: "IX_KPIPerformanceMeasures_TenantId_Id",
                schema: "planning",
                table: "KPIPerformanceMeasures");

            migrationBuilder.DropIndex(
                name: "IX_KPIModeOfVerifications_TenantId_Id",
                schema: "planning",
                table: "KPIModeOfVerifications");

            migrationBuilder.DropIndex(
                name: "IX_KPIMeasurements_TenantId_Id",
                schema: "planning",
                table: "KPIMeasurements");

            migrationBuilder.DropIndex(
                name: "IX_KPIAssignments_TenantId_Id",
                schema: "planning",
                table: "KPIAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ItemRequests_TenantId_Id",
                schema: "planning",
                table: "ItemRequests");

            migrationBuilder.DropIndex(
                name: "IX_ItemPrices_TenantId_Id",
                schema: "planning",
                table: "ItemPrices");

            migrationBuilder.DropIndex(
                name: "IX_GeneratedDocuments_TenantId_Id",
                schema: "planning",
                table: "GeneratedDocuments");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIs_TenantId_Code",
                schema: "planning",
                table: "FYActiveKPIs");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIs_TenantId_Id",
                schema: "planning",
                table: "FYActiveKPIs");

            migrationBuilder.DropIndex(
                name: "IX_FYActiveKPIMeasurements_TenantId_Id",
                schema: "planning",
                table: "FYActiveKPIMeasurements");

            migrationBuilder.DropIndex(
                name: "IX_FunctionConfigs_TenantId_Id",
                schema: "planning",
                table: "FunctionConfigs");

            migrationBuilder.DropIndex(
                name: "IX_FunctionAllocations_TenantId_Id",
                schema: "planning",
                table: "FunctionAllocations");

            migrationBuilder.DropIndex(
                name: "IX_FiscalYears_TenantId_Id",
                schema: "planning",
                table: "FiscalYears");

            migrationBuilder.DropIndex(
                name: "IX_FiscalMonths_TenantId_Id",
                schema: "planning",
                table: "FiscalMonths");

            migrationBuilder.DropIndex(
                name: "IX_DUKPITargetAssignments_TenantId_Id",
                schema: "planning",
                table: "DUKPITargetAssignments");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfiles_TenantId_Id",
                schema: "procurement",
                table: "DocumentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_DocumentProfileItems_TenantId_Id",
                schema: "procurement",
                table: "DocumentProfileItems");

            migrationBuilder.DropIndex(
                name: "IX_DirectPurchaseEntries_TenantId_Id",
                schema: "procurement",
                table: "DirectPurchaseEntries");

            migrationBuilder.DropIndex(
                name: "IX_DirectContractings_TenantId_Id",
                schema: "procurement",
                table: "DirectContractings");

            migrationBuilder.DropIndex(
                name: "IX_DirectContractingProposals_TenantId_Id",
                schema: "procurement",
                table: "DirectContractingProposals");

            migrationBuilder.DropIndex(
                name: "IX_DirectContractingProposalItems_TenantId_Id",
                schema: "procurement",
                table: "DirectContractingProposalItems");

            migrationBuilder.DropIndex(
                name: "IX_DirectAcquisitions_TenantId_Id",
                schema: "procurement",
                table: "DirectAcquisitions");

            migrationBuilder.DropIndex(
                name: "IX_DirectAcquisitionDocuments_TenantId_Id",
                schema: "procurement",
                table: "DirectAcquisitionDocuments");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryUnits_TenantId_Id",
                schema: "planning",
                table: "DeliveryUnits");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_TenantId_Id",
                schema: "procurement",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRs_TenantId_Id",
                schema: "procurement",
                table: "ConsolidatedPRs");

            migrationBuilder.DropIndex(
                name: "IX_ConsolidatedPRItems_TenantId_Id",
                schema: "procurement",
                table: "ConsolidatedPRItems");

            migrationBuilder.DropIndex(
                name: "IX_Clusters_TenantId_Id",
                schema: "planning",
                table: "Clusters");

            migrationBuilder.DropIndex(
                name: "IX_BudgetCalls_TenantId_Id",
                schema: "planning",
                table: "BudgetCalls");

            migrationBuilder.DropIndex(
                name: "IX_BidOpeningRecords_TenantId_Id",
                schema: "procurement",
                table: "BidOpeningRecords");

            migrationBuilder.DropIndex(
                name: "IX_BiddingSubmissions_TenantId_Id",
                schema: "procurement",
                table: "BiddingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_BiddingSubmissionItems_TenantId_Id",
                schema: "procurement",
                table: "BiddingSubmissionItems");

            migrationBuilder.DropIndex(
                name: "IX_BiddingPostQualifications_TenantId_Id",
                schema: "procurement",
                table: "BiddingPostQualifications");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluations_TenantId_Id",
                schema: "procurement",
                table: "BiddingEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingEvaluatedBids_TenantId_Id",
                schema: "procurement",
                table: "BiddingEvaluatedBids");

            migrationBuilder.DropIndex(
                name: "IX_BiddingDocument_TenantId_Id",
                schema: "procurement",
                table: "BiddingDocument");

            migrationBuilder.DropIndex(
                name: "IX_BiddingAwardRecommendations_TenantId_Id",
                schema: "procurement",
                table: "BiddingAwardRecommendations");

            migrationBuilder.DropIndex(
                name: "IX_BiddingActivitySchedules_TenantId_Id",
                schema: "procurement",
                table: "BiddingActivitySchedules");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutionWhereasClauses_TenantId_Id",
                schema: "planning",
                table: "BACResolutionWhereasClauses");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutionWhereasClauseItems_TenantId_Id",
                schema: "procurement",
                table: "BACResolutionWhereasClauseItems");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutions_TenantId_Id",
                schema: "procurement",
                table: "BACResolutions");

            migrationBuilder.DropIndex(
                name: "IX_BACResolutionClauseLinks_TenantId_Id",
                schema: "procurement",
                table: "BACResolutionClauseLinks");

            migrationBuilder.DropIndex(
                name: "IX_BACMembers_TenantId_Id",
                schema: "procurement",
                table: "BACMembers");

            migrationBuilder.DropIndex(
                name: "IX_Attributes_TenantId_Id",
                schema: "planning",
                table: "Attributes");

            migrationBuilder.DropIndex(
                name: "IX_APRs_TenantId_Id",
                schema: "procurement",
                table: "APRs");

            migrationBuilder.DropIndex(
                name: "IX_APRItems_TenantId_Id",
                schema: "procurement",
                table: "APRItems");

            migrationBuilder.DropIndex(
                name: "IX_APRItemMilestones_TenantId_Id",
                schema: "procurement",
                table: "APRItemMilestones");

            migrationBuilder.DropIndex(
                name: "IX_APPSignatories_TenantId_Id",
                schema: "planning",
                table: "APPSignatories");

            migrationBuilder.DropIndex(
                name: "IX_APPs_TenantId_Id",
                schema: "planning",
                table: "APPs");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalEvents_TenantId_Id",
                schema: "planning",
                table: "ApprovalEvents");

            migrationBuilder.DropIndex(
                name: "IX_APPProcurementSchedules_TenantId_Id",
                schema: "planning",
                table: "APPProcurementSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationUploadedDocuments_TenantId_Id",
                schema: "procurement",
                table: "ApplicationUploadedDocuments");

            migrationBuilder.DropIndex(
                name: "IX_APPItems_TenantId_Id",
                schema: "planning",
                table: "APPItems");

            migrationBuilder.DropIndex(
                name: "IX_APP_PPMP_Selections_TenantId_Id",
                schema: "planning",
                table: "APP_PPMP_Selections");

            migrationBuilder.DropIndex(
                name: "IX_AOBs_TenantId_Id",
                schema: "procurement",
                table: "AOBs");

            migrationBuilder.DropIndex(
                name: "IX_AOBRFQMappings_TenantId_Id",
                schema: "procurement",
                table: "AOBRFQMappings");

            migrationBuilder.DropIndex(
                name: "IX_AOBProcurementProjectMappings_TenantId_Id",
                schema: "procurement",
                table: "AOBProcurementProjectMappings");

            migrationBuilder.DropIndex(
                name: "IX_AOBAwardedItems_TenantId_Id",
                schema: "procurement",
                table: "AOBAwardedItems");

            migrationBuilder.DropIndex(
                name: "IX_AgencyMasterBudgets_TenantId_Id",
                schema: "planning",
                table: "AgencyMasterBudgets");

            migrationBuilder.DropIndex(
                name: "IX_Agencies_TenantId_Id",
                schema: "planning",
                table: "Agencies");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Email",
                schema: "planning",
                table: "Suppliers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_PhilGEPSNumber",
                schema: "planning",
                table: "Suppliers",
                column: "PhilGEPSNumber");

            migrationBuilder.CreateIndex(
                name: "IX_FYActiveKPIs_Code",
                schema: "planning",
                table: "FYActiveKPIs",
                column: "Code");
        }
    }
}
