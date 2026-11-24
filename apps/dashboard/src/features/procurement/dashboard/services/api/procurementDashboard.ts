import type {
  ConsolidatedPRReportItem,
  ContractReportItem,
  DashboardFiltersV2,
  DirectAcquisitionReportItem,
  DirectContractingReportItem,
  NOAReportItem,
  NTPReportItem,
  POReportItem,
  PRReportItem,
  ProcurementBottleneck,
  ProcurementContractRisk,
  ProcurementDashboardAnalytics,
  ProcurementDashboardSummary,
  ProcurementHealthScorecard,
  RFQReportItem,
  ReportPaginationParams,
  BudgetBurnAnalytics,
  SupplierPerformanceDetail,
  ProcurementAuditLogItem,
} from '../../types/dashboardV2'
import { api } from '@/services/api'

export interface PaginatedBackendResponse<T> {
  succeeded: boolean
  message: string | null
  data: Array<T>
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface ApiBackendResponse<T> {
  succeeded: boolean
  message: string | null
  data: T
}

export const ProcurementDashboardApi = {
  getSummary: async (params: DashboardFiltersV2) => {
    const res = await api.get<ApiBackendResponse<ProcurementDashboardSummary>>('/procurement/dashboard/summary', { params })
    return res.data.data
  },

  getScorecard: async (params: DashboardFiltersV2) => {
    const res = await api.get<ApiBackendResponse<ProcurementHealthScorecard>>('/procurement/dashboard/scorecard', { params })
    return res.data.data
  },

  getBottleneck: async (params: DashboardFiltersV2) => {
    const res = await api.get<ApiBackendResponse<ProcurementBottleneck>>('/procurement/dashboard/bottleneck', { params })
    return res.data.data
  },

  getAnalytics: async (params: DashboardFiltersV2) => {
    const res = await api.get<ApiBackendResponse<ProcurementDashboardAnalytics>>('/procurement/dashboard/analytics', { params })
    return res.data.data
  },

  getContractRisk: async (params: DashboardFiltersV2) => {
    const res = await api.get<ApiBackendResponse<ProcurementContractRisk>>('/procurement/dashboard/contract-risk', { params })
    return res.data.data
  },

  getBudgetBurn: async (params: { fiscalYear: number; officeId?: string }) => {
    const res = await api.get<ApiBackendResponse<BudgetBurnAnalytics>>('/procurement/dashboard/budget-burn', { params })
    return res.data.data
  },

  getSupplierPerformance: async (supplierId: string) => {
    const res = await api.get<ApiBackendResponse<SupplierPerformanceDetail>>(`/procurement/dashboard/supplier-performance/${supplierId}`)
    return res.data.data
  },

  getAuditTrail: async (limit: number = 20) => {
    const res = await api.get<ApiBackendResponse<Array<ProcurementAuditLogItem>>>('/procurement/dashboard/audit-trail', { params: { limit } })
    return res.data.data
  },

  // 9 Report Endpoints
  getPRReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<PRReportItem>>('/procurement/dashboard/reports/purchase-requests', { params })
    return res.data
  },

  getConsolidatedPRReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<ConsolidatedPRReportItem>>('/procurement/dashboard/reports/consolidated-prs', { params })
    return res.data
  },

  getRFQReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<RFQReportItem>>('/procurement/dashboard/reports/rfqs', { params })
    return res.data
  },

  getNOAReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<NOAReportItem>>('/procurement/dashboard/reports/notices-of-award', { params })
    return res.data
  },

  getNTPReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<NTPReportItem>>('/procurement/dashboard/reports/notices-to-proceed', { params })
    return res.data
  },

  getPOReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<POReportItem>>('/procurement/dashboard/reports/purchase-orders', { params })
    return res.data
  },

  getContractReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<ContractReportItem>>('/procurement/dashboard/reports/contracts', { params })
    return res.data
  },

  getDirectContractingReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<DirectContractingReportItem>>('/procurement/dashboard/reports/direct-contracting', { params })
    return res.data
  },

  getDirectAcquisitionReport: async (params: DashboardFiltersV2 & ReportPaginationParams) => {
    const res = await api.get<PaginatedBackendResponse<DirectAcquisitionReportItem>>('/procurement/dashboard/reports/direct-acquisition', { params })
    return res.data
  },
}
