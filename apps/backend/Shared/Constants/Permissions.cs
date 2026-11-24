namespace ERPEZ.Shared.Constants;

public static class Permissions
{
    public static class Planning
    {
        public const string viewGlobalDashboard = "planning.dashboard.view_global";
        public const string viewOfficeDashboard = "planning.dashboard.view_office";

        // Line Item Budget (LIB)
        public const string libCreate = "planning.lib.create";
        public const string libView = "planning.lib.view";
        public const string libUpdate = "planning.lib.update";
        public const string libDelete = "planning.lib.delete";
        public const string libSubmit = "planning.lib.submit";
        public const string libApprove = "planning.lib.approve";
        public const string libAmend = "planning.lib.amend";

        // Work & Financial Plan (WFP)
        public const string wfpCreate = "planning.wfp.create";
        public const string wfpView = "planning.wfp.view";
        public const string wfpUpdate = "planning.wfp.update";
        public const string wfpDelete = "planning.wfp.delete";
        public const string wfpSubmit = "planning.wfp.submit";
        public const string wfpApprove = "planning.wfp.approve";

        // OPCR & Performance
        public const string opcrCreate = "planning.opcr.create";
        public const string opcrView = "planning.opcr.view";
        public const string opcrUpdate = "planning.opcr.update";
        public const string opcrDelete = "planning.opcr.delete";
        public const string opcrSubmit = "planning.opcr.submit";
        public const string opcrApprove = "planning.opcr.approve";
        public const string opcrEvaluate = "planning.opcr.evaluate";

        // KPIs, Targets & Performance Measurement
        public const string kpiCreate = "planning.kpi.create";
        public const string kpiView = "planning.kpi.view";
        public const string kpiUpdate = "planning.kpi.update";
        public const string kpiDelete = "planning.kpi.delete";
        public const string kpiAssign = "planning.kpi.assign";
        public const string targetManage = "planning.target.manage";
        public const string ratingScaleManage = "planning.rating_scale.manage";

        // Planning Lifecycle & Matrix
        public const string fiscalYearView = "planning.fiscal_year.view";
        public const string fiscalYearManage = "planning.fiscal_year.manage";
        public const string budgetCallView = "planning.budget_call.view";
        public const string budgetCallManage = "planning.budget_call.manage";
        public const string workflowMatrixManage = "planning.workflow_matrix.manage";
        public const string economicIndicatorsManage = "planning.economic_indicators.manage";
        public const string dataMigrationsManage = "planning.data_migrations.manage";
        public const string spmsFunctionWeightsManage = "planning.spms_function_weights.manage";

        // Market Scoping
        public const string marketScopingView = "planning.market_scoping.view";
        public const string marketScopingManage = "planning.market_scoping.manage";
        public const string marketScopingSubmit = "planning.market_scoping.submit";
        public const string marketScopingApprove = "planning.market_scoping.approve";
    }

    public static class Finance
    {
        public const string agencyMasterBudgetManage = "finance.agency_master_budget.manage";
        public const string budgetCeilingAssign = "finance.budget_ceiling.assign";
        public const string subOfficeCeilingAssign = "finance.sub_office_ceiling.assign";
        public const string fiscalMonthLockUnlock = "finance.fiscal_month.lock_unlock";
        public const string uacsView = "finance.uacs.view";
        public const string uacsManage = "finance.uacs.manage";
        public const string fundSourceManage = "finance.fund_source.manage";
    }

    public static class Procurement
    {
        public const string ppmpCreate = "procurement.ppmp.create";
        public const string ppmpView = "procurement.ppmp.view";
        public const string ppmpUpdate = "procurement.ppmp.update";
        public const string ppmpSubmit = "procurement.ppmp.submit";
        public const string ppmpApprove = "procurement.ppmp.approve";
        public const string ppmpConsolidate = "procurement.ppmp.consolidate";
        public const string ppmpReview = "procurement.ppmp.review";
        public const string appManage = "procurement.app.manage";
        public const string prCreate = "procurement.pr.create";
        public const string prManage = "procurement.pr.manage";
        public const string rfqManage = "procurement.rfq.manage";
        public const string bacManage = "procurement.bac.manage";
        public const string aobManage = "procurement.aob.manage";
        public const string poManage = "procurement.po.manage";
        public const string procurementLibraryView = "procurement.procurement_library.view";
        public const string procurementLibraryManage = "procurement.procurement_library.manage";
        public const string procurementThresholdsManage = "procurement.procurement_thresholds.manage";
        public const string biddingDocumentsView = "procurement.bidding_documents.view";
        public const string biddingDocumentsManage = "procurement.bidding_documents.manage";
        public const string supplierView = "procurement.supplier.view";
        public const string supplierManage = "procurement.supplier.manage";
    }

    public static class Platform
    {
        public const string pricingView = "platform.pricing.view";
        public const string pricingManage = "platform.pricing.manage";
        public const string subscribersView = "platform.subscribers.view";
        public const string fleetManage = "platform.fleet.manage";
        public const string databaseSiloManage = "platform.database_silos.manage";
    }

    public static class Admin
    {
        public const string tenantsManage = "admin.tenants.manage";
        public const string membersManage = "admin.members.manage";
        public const string rolesManage = "admin.roles.manage";
        public const string usersManage = "admin.users.manage";
        public const string orgStructureView = "admin.org_structure.view";
        public const string orgStructureManage = "admin.org_structure.manage";
        public const string systemAdminView = "admin.system_admin.view";
        public const string systemAdminManage = "admin.system_admin.manage";

        // Dedicated Operational Role Assignment Boundary
        public const string operationalRolesView = "admin.operational_roles.view";
        public const string operationalRolesManage = "admin.operational_roles.manage";
    }

    /// <summary>
    /// Returns all known atomic permissions in the system.
    /// </summary>
    public static IReadOnlyList<string> GetAllPermissions()
    {
        return
        [
            // Planning
            Planning.viewGlobalDashboard,
            Planning.viewOfficeDashboard,
            Planning.libCreate,
            Planning.libView,
            Planning.libUpdate,
            Planning.libDelete,
            Planning.libSubmit,
            Planning.libApprove,
            Planning.libAmend,
            Planning.wfpCreate,
            Planning.wfpView,
            Planning.wfpUpdate,
            Planning.wfpDelete,
            Planning.wfpSubmit,
            Planning.wfpApprove,
            Planning.opcrCreate,
            Planning.opcrView,
            Planning.opcrUpdate,
            Planning.opcrDelete,
            Planning.opcrSubmit,
            Planning.opcrApprove,
            Planning.opcrEvaluate,
            Planning.kpiCreate,
            Planning.kpiView,
            Planning.kpiUpdate,
            Planning.kpiDelete,
            Planning.kpiAssign,
            Planning.targetManage,
            Planning.ratingScaleManage,
            Planning.fiscalYearView,
            Planning.fiscalYearManage,
            Planning.budgetCallView,
            Planning.budgetCallManage,
            Planning.workflowMatrixManage,
            Planning.economicIndicatorsManage,
            Planning.dataMigrationsManage,
            Planning.spmsFunctionWeightsManage,
            Planning.marketScopingView,
            Planning.marketScopingManage,
            Planning.marketScopingSubmit,
            Planning.marketScopingApprove,

            // Finance
            Finance.agencyMasterBudgetManage,
            Finance.budgetCeilingAssign,
            Finance.subOfficeCeilingAssign,
            Finance.fiscalMonthLockUnlock,
            Finance.uacsView,
            Finance.uacsManage,
            Finance.fundSourceManage,

            // Procurement
            Procurement.ppmpCreate,
            Procurement.ppmpView,
            Procurement.ppmpUpdate,
            Procurement.ppmpSubmit,
            Procurement.ppmpApprove,
            Procurement.ppmpConsolidate,
            Procurement.ppmpReview,
            Procurement.appManage,
            Procurement.prCreate,
            Procurement.prManage,
            Procurement.rfqManage,
            Procurement.bacManage,
            Procurement.aobManage,
            Procurement.poManage,
            Procurement.procurementLibraryView,
            Procurement.procurementLibraryManage,
            Procurement.procurementThresholdsManage,
            Procurement.biddingDocumentsView,
            Procurement.biddingDocumentsManage,
            Procurement.supplierView,
            Procurement.supplierManage,

            // Admin
            Admin.tenantsManage,
            Admin.membersManage,
            Admin.rolesManage,
            Admin.usersManage,
            Admin.orgStructureView,
            Admin.orgStructureManage,
            Admin.systemAdminView,
            Admin.systemAdminManage,
            Admin.operationalRolesView,
            Admin.operationalRolesManage,

            // Platform
            Platform.pricingView,
            Platform.pricingManage,
            Platform.subscribersView,
            Platform.fleetManage,
            Platform.databaseSiloManage
        ];
    }
}
