import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ProcurementDashboardApi } from '../services/api/procurementDashboard'
import type { DashboardFiltersV2, ReportPaginationParams } from '../types/dashboardV2'

// ── Overview Tab Queries ──────────────────────────────────────────────────────

export const useProcurementDashboardSummary = (filters: DashboardFiltersV2) =>
  useQuery({
    queryKey: ['proc-dashboard-summary', filters],
    queryFn: () => ProcurementDashboardApi.getSummary(filters),
    staleTime: 60_000,
  })

export const useProcurementHealthScorecard = (filters: DashboardFiltersV2) =>
  useQuery({
    queryKey: ['proc-dashboard-scorecard', filters],
    queryFn: () => ProcurementDashboardApi.getScorecard(filters),
    staleTime: 60_000,
  })

export const useProcurementBottleneck = (filters: DashboardFiltersV2) =>
  useQuery({
    queryKey: ['proc-dashboard-bottleneck', filters],
    queryFn: () => ProcurementDashboardApi.getBottleneck(filters),
    staleTime: 60_000,
  })

export const useProcurementContractRisk = (filters: DashboardFiltersV2) =>
  useQuery({
    queryKey: ['proc-dashboard-contract-risk', filters],
    queryFn: () => ProcurementDashboardApi.getContractRisk(filters),
    staleTime: 60_000,
  })

// ── Analytics Tab Query (Lazy: only runs when Analytics tab is active) ─────────

export const useProcurementDashboardAnalytics = (filters: DashboardFiltersV2, enabled: boolean) =>
  useQuery({
    queryKey: ['proc-dashboard-analytics', filters],
    queryFn: () => ProcurementDashboardApi.getAnalytics(filters),
    enabled,
    staleTime: 120_000,
  })

// ── Reports Tab Queries (9 Paginated Queries) ─────────────────────────────────

export const usePRReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-pr', params],
    queryFn: () => ProcurementDashboardApi.getPRReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useConsolidatedPRReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-cpr', params],
    queryFn: () => ProcurementDashboardApi.getConsolidatedPRReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useRFQReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-rfq', params],
    queryFn: () => ProcurementDashboardApi.getRFQReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useNOAReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-noa', params],
    queryFn: () => ProcurementDashboardApi.getNOAReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useNTPReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-ntp', params],
    queryFn: () => ProcurementDashboardApi.getNTPReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const usePOReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-po', params],
    queryFn: () => ProcurementDashboardApi.getPOReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useContractReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-contract', params],
    queryFn: () => ProcurementDashboardApi.getContractReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useDirectContractingReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-dc', params],
    queryFn: () => ProcurementDashboardApi.getDirectContractingReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useDirectAcquisitionReport = (params: DashboardFiltersV2 & ReportPaginationParams) =>
  useQuery({
    queryKey: ['proc-report-da', params],
    queryFn: () => ProcurementDashboardApi.getDirectAcquisitionReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
