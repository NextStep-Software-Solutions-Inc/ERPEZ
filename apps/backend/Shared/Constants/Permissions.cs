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
        public const string budgetCallManage = "planning.budget_call.manage";
        public const string workflowMatrixManage = "planning.workflow_matrix.manage";
    }

    public static class Finance
    {
        public const string agencyMasterBudgetManage = "finance.agency_master_budget.manage";
        public const string budgetCeilingAssign = "finance.budget_ceiling.assign";
        public const string subOfficeCeilingAssign = "finance.sub_office_ceiling.assign";
        public const string fiscalMonthLockUnlock = "finance.fiscal_month.lock_unlock";
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
    }

    public static class Admin
    {
        public const string tenantsManage = "admin.tenants.manage";
        public const string membersManage = "admin.members.manage";
        public const string rolesManage = "admin.roles.manage";
        public const string usersManage = "admin.users.manage";
        public const string orgStructureManage = "admin.org_structure.manage";
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
            Planning.budgetCallManage,
            Planning.workflowMatrixManage,

            // Finance
            Finance.agencyMasterBudgetManage,
            Finance.budgetCeilingAssign,
            Finance.subOfficeCeilingAssign,
            Finance.fiscalMonthLockUnlock,
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

            // Admin
            Admin.tenantsManage,
            Admin.membersManage,
            Admin.rolesManage,
            Admin.usersManage,
            Admin.orgStructureManage
        ];
    }
}
