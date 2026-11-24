/**
 * Planning Dashboard Data Hook
 *
 * Fetches real analytics data from the Planning Dashboard backend API endpoints
 * (/dashboard/planning or /dashboard/office) with role-based routing and filters.
 *
 * @module features/planning/dashboard/hooks/usePlanningDashboard
 */

import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import type {
  DashboardOverviewApiResponse,
  DashboardSummary,
  OPCRChartData,
  DepartmentBudgetDistributionItem,
  PPMPConsolidationData,
  Department,
  FiscalYearOption,
  AttentionItem,
} from '../types'

interface OfficeDto {
  id: string
  name: string
  code?: string
}

export function usePlanningDashboard(fiscalYear: number, departmentId: string | null) {
  const { isPlanningUser, departmentId: userOfficeId } = useDashboardRole()

  // 1. Fetch Fiscal Years
  const { data: fiscalYears = [], isLoading: isLoadingFY } = useQuery<FiscalYearOption[]>({
    queryKey: ['dashboard-fiscal-years'],
    queryFn: async () => {
      try {
        const res = await api.get('/fiscal-years')
        const items = res.data?.data || res.data?.items || res.data || []
        const list: any[] = Array.isArray(items) ? items : []
        return list.map((fy) => ({
          id: fy.id,
          year: typeof fy.year === 'number' ? fy.year : parseInt(fy.year, 10),
          status: fy.status,
        })).filter((fy) => !isNaN(fy.year))
      } catch (err) {
        console.error('Failed to fetch fiscal years:', err)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // 2. Fetch Offices / Departments
  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ['dashboard-offices'],
    queryFn: async () => {
      try {
        const res = await api.get('/offices')
        const items = res.data?.data || res.data?.items || res.data || []
        return (Array.isArray(items) ? items : []).map((o: OfficeDto) => ({
          id: o.id,
          name: o.name,
          code: o.code || o.name.substring(0, 4).toUpperCase(),
        }))
      } catch (err) {
        console.error('Failed to fetch offices:', err)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // Match the selected FiscalYear entity GUID (STRICT MATCH — no fallback to another year)
  const selectedFY = fiscalYears.find((fy) => fy.year === fiscalYear)
  const fiscalYearId = selectedFY?.id

  // 3. Fetch Dashboard Overview
  const effectiveOfficeId = isPlanningUser ? departmentId : (userOfficeId || departmentId)

  const {
    data: rawData,
    isLoading: isLoadingData,
    isError,
    error,
    refetch,
  } = useQuery<DashboardOverviewApiResponse>({
    queryKey: ['dashboard-overview', fiscalYearId, isPlanningUser, effectiveOfficeId],
    enabled: !!fiscalYearId,
    queryFn: async () => {
      let endpoint = '/dashboard/planning'
      const params: Record<string, string> = { fiscalYearId: fiscalYearId! }

      if (isPlanningUser) {
        endpoint = '/dashboard/planning'
        if (effectiveOfficeId) {
          params.organizationId = effectiveOfficeId
        }
      } else {
        endpoint = '/dashboard/office'
        if (effectiveOfficeId) {
          params.officeId = effectiveOfficeId
        }
      }

      const response = await api.get(endpoint, { params })
      return response.data?.data || response.data
    },
    staleTime: 60 * 1000,
  })

  // Transform raw API data to view models (If FY is not found or has no data, return clean 0s)
  const summary: DashboardSummary = {
    totalKPIsEncoded: rawData?.kpiStats?.totalKPIsEncoded ?? 0,
    encodedThisMonth: rawData?.kpiStats?.encodedThisMonth ?? 0,
    kpiChangeFromLastMonth: rawData?.kpiStats?.monthOverMonthChange ?? 0,

    totalOPCRs: rawData?.opcrStats?.totalOPCRs ?? 0,
    submittedOPCRs: rawData?.opcrStats?.submittedCount ?? 0,
    pendingOPCRs: rawData?.opcrStats?.pendingCount ?? 0,
    opcrSubmittedPercent: rawData?.opcrStats?.submittedPercentage ?? 0,

    budgetPlanned: rawData?.budgetStats?.plannedAmount ?? 0,
    budgetUtilized: rawData?.budgetStats?.utilizedAmount ?? 0,
    budgetUtilizationPercent: rawData?.budgetStats?.utilizationPercentage ?? 0,

    totalPPMPs: rawData?.ppmpStats?.totalPPMPs ?? 0,
    consolidatedPPMPs: rawData?.ppmpStats?.consolidatedCount ?? 0,
    inProgressPPMPs: rawData?.ppmpStats?.inProgressCount ?? 0,
    pendingPPMPs: rawData?.ppmpStats?.pendingItemsCount ?? 0,
    ppmpConsolidationPercent: rawData?.ppmpStats?.consolidatedPercentage ?? 0,
  }

  // OPCR planned vs actual chart points
  const opcrChartData: OPCRChartData = rawData?.opcrCommitments && rawData.opcrCommitments.length > 0
    ? rawData.opcrCommitments.map((c) => ({
        month: c.month,
        planned: c.plannedAmount,
        actual: c.actualAmount,
        variance: c.variance,
        hasData: c.hasData ?? (c.plannedAmount > 0),
        hasAccomplishmentReported: c.hasAccomplishmentReported ?? (c.actualAmount > 0),
      }))
    : [
        { month: 'Q1', planned: 0, actual: 0, variance: 0, hasData: false, hasAccomplishmentReported: false },
        { month: 'Q2', planned: 0, actual: 0, variance: 0, hasData: false, hasAccomplishmentReported: false },
        { month: 'Q3', planned: 0, actual: 0, variance: 0, hasData: false, hasAccomplishmentReported: false },
        { month: 'Q4', planned: 0, actual: 0, variance: 0, hasData: false, hasAccomplishmentReported: false },
      ]

  // Department Programmed Budget vs Ceiling Distribution
  const departmentBudgetDistribution: DepartmentBudgetDistributionItem[] =
    rawData?.departmentBudgetDistribution || []

  // PPMP Consolidation Donut / Progress
  const ppmpConsolidationData: PPMPConsolidationData = rawData?.ppmpStats
    ? [
        { status: 'Consolidated', count: rawData.ppmpStats.consolidatedCount, color: '#10b981' },
        { status: 'In Progress', count: rawData.ppmpStats.inProgressCount, color: '#3b82f6' },
        { status: 'Pending', count: rawData.ppmpStats.pendingItemsCount, color: '#f59e0b' },
      ]
    : [
        { status: 'Consolidated', count: 0, color: '#10b981' },
        { status: 'In Progress', count: 0, color: '#3b82f6' },
        { status: 'Pending', count: 0, color: '#f59e0b' },
      ]

  // Build Actionable Attention Items from real backend overview metrics
  const attentionItems: AttentionItem[] = []

  if (rawData?.ppmpStats?.pendingItemsCount && rawData.ppmpStats.pendingItemsCount > 0) {
    attentionItems.push({
      id: 'pending-ppmp',
      title: `${rawData.ppmpStats.pendingItemsCount} PPMP${rawData.ppmpStats.pendingItemsCount > 1 ? 's' : ''} Pending Consolidation`,
      description: 'Department procurement management plans require consolidation into the Annual Procurement Plan (APP).',
      count: rawData.ppmpStats.pendingItemsCount,
      severity: 'warning',
      category: 'PPMP',
      actionText: 'Review PPMPs',
    })
  }

  if (rawData?.appProcurementReadiness?.missingScheduleCount && rawData.appProcurementReadiness.missingScheduleCount > 0) {
    attentionItems.push({
      id: 'missing-app-schedule',
      title: `${rawData.appProcurementReadiness.missingScheduleCount} APP Item${rawData.appProcurementReadiness.missingScheduleCount > 1 ? 's' : ''} Missing Procurement Schedules`,
      description: 'Procurement activity timelines must be scheduled prior to APP finalization and bidding.',
      count: rawData.appProcurementReadiness.missingScheduleCount,
      severity: 'critical',
      category: 'APP',
      actionText: 'Schedule Items',
    })
  }

  if (rawData?.opcrStats?.pendingCount && rawData.opcrStats.pendingCount > 0) {
    attentionItems.push({
      id: 'pending-opcr',
      title: `${rawData.opcrStats.pendingCount} Office${rawData.opcrStats.pendingCount > 1 ? 's' : ''} Pending OPCR Submission`,
      description: 'Office Performance Commitment and Review forms have not yet been submitted for PMT review.',
      count: rawData.opcrStats.pendingCount,
      severity: 'warning',
      category: 'OPCR',
      actionText: 'Inspect OPCRs',
    })
  }

  const overBudgetDepts = (rawData?.departmentBudgetDistribution || []).filter(
    (d) => d.hasCeilingAllocated && d.programmedAmount > d.ceilingAmount && d.ceilingAmount > 0
  )
  if (overBudgetDepts.length > 0) {
    attentionItems.push({
      id: 'over-budget-depts',
      title: `${overBudgetDepts.length} Department${overBudgetDepts.length > 1 ? 's' : ''} Over Budget Ceiling`,
      description: `${overBudgetDepts.map((d) => d.department).join(', ')} programmed amounts exceed approved ceiling limits.`,
      count: overBudgetDepts.length,
      severity: 'critical',
      category: 'BUDGET',
      actionText: 'Adjust Allocation',
    })
  }

  const unallocatedDepts = (rawData?.departmentBudgetDistribution || []).filter(
    (d) => !d.hasCeilingAllocated && d.programmedAmount > 0
  )
  if (unallocatedDepts.length > 0) {
    attentionItems.push({
      id: 'unallocated-ceiling-depts',
      title: `${unallocatedDepts.length} Department${unallocatedDepts.length > 1 ? 's' : ''} Programmed with No Ceiling Allocated`,
      description: `${unallocatedDepts.map((d) => d.department).join(', ')} have line item budgets encoded without an authorized ceiling.`,
      count: unallocatedDepts.length,
      severity: 'warning',
      category: 'BUDGET',
      actionText: 'Assign Ceilings',
    })
  }

  return {
    fiscalYears,
    departments,
    summary,
    opcrChartData,
    departmentBudgetDistribution,
    ppmpConsolidationData,
    uacsObligationData: rawData?.expenseClassAllocation || null,
    appProcurementReadinessData: rawData?.appProcurementReadiness || null,
    kpiClassificationData: rawData?.kpiClassification || null,
    attentionItems,
    isLoading: isLoadingFY || isLoadingDepts || (isLoadingData && !!fiscalYearId && !rawData),
    isError,
    error,
    refetch,
  }
}
