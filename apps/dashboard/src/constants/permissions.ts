/**
 * Single source of truth for frontend functional permission keys.
 * Synchronized with ERPEZ.Shared.Constants.Permissions on the backend.
 */
export const PERMISSIONS = {
  Planning: {
    Dashboard: {
      ViewGlobal: 'planning.dashboard.view_global',
      ViewOffice: 'planning.dashboard.view_office',
    },
    Lib: {
      Create: 'planning.lib.create',
      View: 'planning.lib.view',
      Update: 'planning.lib.update',
      Delete: 'planning.lib.delete',
      Submit: 'planning.lib.submit',
      Approve: 'planning.lib.approve',
      Amend: 'planning.lib.amend',
    },
    Wfp: {
      Create: 'planning.wfp.create',
      View: 'planning.wfp.view',
      Update: 'planning.wfp.update',
      Delete: 'planning.wfp.delete',
      Submit: 'planning.wfp.submit',
      Approve: 'planning.wfp.approve',
    },
    Opcr: {
      Create: 'planning.opcr.create',
      View: 'planning.opcr.view',
      Update: 'planning.opcr.update',
      Delete: 'planning.opcr.delete',
      Submit: 'planning.opcr.submit',
      Approve: 'planning.opcr.approve',
      Evaluate: 'planning.opcr.evaluate',
    },
    Kpi: {
      Create: 'planning.kpi.create',
      View: 'planning.kpi.view',
      Update: 'planning.kpi.update',
      Delete: 'planning.kpi.delete',
      Assign: 'planning.kpi.assign',
    },
    Target: {
      Manage: 'planning.target.manage',
    },
    RatingScale: {
      Manage: 'planning.rating_scale.manage',
    },
    FiscalYear: {
      View: 'planning.fiscal_year.view',
      Manage: 'planning.fiscal_year.manage',
    },
    BudgetCall: {
      View: 'planning.budget_call.view',
      Manage: 'planning.budget_call.manage',
    },
    WorkflowMatrix: {
      Manage: 'planning.workflow_matrix.manage',
    },
    EconomicIndicators: {
      Manage: 'planning.economic_indicators.manage',
    },
    DataMigrations: {
      Manage: 'planning.data_migrations.manage',
    },
    SpmsFunctionWeights: {
      Manage: 'planning.spms_function_weights.manage',
    },
    MarketScoping: {
      View: 'planning.market_scoping.view',
      Manage: 'planning.market_scoping.manage',
      Submit: 'planning.market_scoping.submit',
      Approve: 'planning.market_scoping.approve',
    },
  },
  Finance: {
    AgencyMasterBudget: {
      Manage: 'finance.agency_master_budget.manage',
    },
    BudgetCeiling: {
      Assign: 'finance.budget_ceiling.assign',
    },
    SubOfficeCeiling: {
      Assign: 'finance.sub_office_ceiling.assign',
    },
    FiscalMonth: {
      LockUnlock: 'finance.fiscal_month.lock_unlock',
    },
    Uacs: {
      View: 'finance.uacs.view',
      Manage: 'finance.uacs.manage',
    },
    FundSource: {
      Manage: 'finance.fund_source.manage',
    },
  },
  Procurement: {
    Ppmp: {
      Create: 'procurement.ppmp.create',
      View: 'procurement.ppmp.view',
      Update: 'procurement.ppmp.update',
      Submit: 'procurement.ppmp.submit',
      Approve: 'procurement.ppmp.approve',
      Consolidate: 'procurement.ppmp.consolidate',
      Review: 'procurement.ppmp.review',
    },
    App: {
      Manage: 'procurement.app.manage',
    },
    Pr: {
      Create: 'procurement.pr.create',
      Manage: 'procurement.pr.manage',
    },
    Rfq: {
      Manage: 'procurement.rfq.manage',
    },
    Bac: {
      Manage: 'procurement.bac.manage',
    },
    Aob: {
      Manage: 'procurement.aob.manage',
    },
    Po: {
      Manage: 'procurement.po.manage',
    },
    ProcurementLibrary: {
      View: 'procurement.procurement_library.view',
      Manage: 'procurement.procurement_library.manage',
    },
    ProcurementThresholds: {
      Manage: 'procurement.procurement_thresholds.manage',
    },
    BiddingDocuments: {
      View: 'procurement.bidding_documents.view',
      Manage: 'procurement.bidding_documents.manage',
    },
    Supplier: {
      View: 'procurement.supplier.view',
      Manage: 'procurement.supplier.manage',
    },
  },
  Admin: {
    Tenants: {
      Manage: 'admin.tenants.manage',
    },
    Members: {
      Manage: 'admin.members.manage',
    },
    Roles: {
      Manage: 'admin.roles.manage',
    },
    Users: {
      Manage: 'admin.users.manage',
    },
    OrgStructure: {
      View: 'admin.org_structure.view',
      Manage: 'admin.org_structure.manage',
    },
    SystemAdmin: {
      View: 'admin.system_admin.view',
      Manage: 'admin.system_admin.manage',
    },
  },
} as const

export type PermissionKey =
  | (typeof PERMISSIONS.Planning.Dashboard)[keyof typeof PERMISSIONS.Planning.Dashboard]
  | (typeof PERMISSIONS.Planning.Lib)[keyof typeof PERMISSIONS.Planning.Lib]
  | (typeof PERMISSIONS.Planning.Wfp)[keyof typeof PERMISSIONS.Planning.Wfp]
  | (typeof PERMISSIONS.Planning.Opcr)[keyof typeof PERMISSIONS.Planning.Opcr]
  | (typeof PERMISSIONS.Planning.Kpi)[keyof typeof PERMISSIONS.Planning.Kpi]
  | (typeof PERMISSIONS.Planning.Target)[keyof typeof PERMISSIONS.Planning.Target]
  | (typeof PERMISSIONS.Planning.RatingScale)[keyof typeof PERMISSIONS.Planning.RatingScale]
  | (typeof PERMISSIONS.Planning.FiscalYear)[keyof typeof PERMISSIONS.Planning.FiscalYear]
  | (typeof PERMISSIONS.Planning.BudgetCall)[keyof typeof PERMISSIONS.Planning.BudgetCall]
  | (typeof PERMISSIONS.Planning.WorkflowMatrix)[keyof typeof PERMISSIONS.Planning.WorkflowMatrix]
  | (typeof PERMISSIONS.Planning.EconomicIndicators)[keyof typeof PERMISSIONS.Planning.EconomicIndicators]
  | (typeof PERMISSIONS.Planning.DataMigrations)[keyof typeof PERMISSIONS.Planning.DataMigrations]
  | (typeof PERMISSIONS.Planning.SpmsFunctionWeights)[keyof typeof PERMISSIONS.Planning.SpmsFunctionWeights]
  | (typeof PERMISSIONS.Planning.MarketScoping)[keyof typeof PERMISSIONS.Planning.MarketScoping]
  | (typeof PERMISSIONS.Finance.AgencyMasterBudget)[keyof typeof PERMISSIONS.Finance.AgencyMasterBudget]
  | (typeof PERMISSIONS.Finance.BudgetCeiling)[keyof typeof PERMISSIONS.Finance.BudgetCeiling]
  | (typeof PERMISSIONS.Finance.SubOfficeCeiling)[keyof typeof PERMISSIONS.Finance.SubOfficeCeiling]
  | (typeof PERMISSIONS.Finance.FiscalMonth)[keyof typeof PERMISSIONS.Finance.FiscalMonth]
  | (typeof PERMISSIONS.Finance.Uacs)[keyof typeof PERMISSIONS.Finance.Uacs]
  | (typeof PERMISSIONS.Finance.FundSource)[keyof typeof PERMISSIONS.Finance.FundSource]
  | (typeof PERMISSIONS.Procurement.Ppmp)[keyof typeof PERMISSIONS.Procurement.Ppmp]
  | (typeof PERMISSIONS.Procurement.App)[keyof typeof PERMISSIONS.Procurement.App]
  | (typeof PERMISSIONS.Procurement.Pr)[keyof typeof PERMISSIONS.Procurement.Pr]
  | (typeof PERMISSIONS.Procurement.Rfq)[keyof typeof PERMISSIONS.Procurement.Rfq]
  | (typeof PERMISSIONS.Procurement.Bac)[keyof typeof PERMISSIONS.Procurement.Bac]
  | (typeof PERMISSIONS.Procurement.Aob)[keyof typeof PERMISSIONS.Procurement.Aob]
  | (typeof PERMISSIONS.Procurement.Po)[keyof typeof PERMISSIONS.Procurement.Po]
  | (typeof PERMISSIONS.Procurement.ProcurementLibrary)[keyof typeof PERMISSIONS.Procurement.ProcurementLibrary]
  | (typeof PERMISSIONS.Procurement.ProcurementThresholds)[keyof typeof PERMISSIONS.Procurement.ProcurementThresholds]
  | (typeof PERMISSIONS.Procurement.BiddingDocuments)[keyof typeof PERMISSIONS.Procurement.BiddingDocuments]
  | (typeof PERMISSIONS.Procurement.Supplier)[keyof typeof PERMISSIONS.Procurement.Supplier]
  | (typeof PERMISSIONS.Admin.Tenants)[keyof typeof PERMISSIONS.Admin.Tenants]
  | (typeof PERMISSIONS.Admin.Members)[keyof typeof PERMISSIONS.Admin.Members]
  | (typeof PERMISSIONS.Admin.Roles)[keyof typeof PERMISSIONS.Admin.Roles]
  | (typeof PERMISSIONS.Admin.Users)[keyof typeof PERMISSIONS.Admin.Users]
  | (typeof PERMISSIONS.Admin.OrgStructure)[keyof typeof PERMISSIONS.Admin.OrgStructure]
  | (typeof PERMISSIONS.Admin.SystemAdmin)[keyof typeof PERMISSIONS.Admin.SystemAdmin]

