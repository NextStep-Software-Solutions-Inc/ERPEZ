import { useCallback } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import type { KPI } from '@/components/features/planning/kpi'
import { Column, Toolbar } from '@/components/features/planning/kpi/subKpi'
import SubKpiDialogManager from '@/components/features/planning/kpi/subKpi/dialogs/SubKpiDialogManager'
import { TemplateTable } from '@/components/TemplateTable'
import { getSubKpisRequest } from '@/components/features/planning/kpi/subKpi/handlers/getSubKpisRequest'
import { getKpiRequest } from '@/components/features/planning/kpi/handlers/getKpiRequest'
/** Hook for fetching SubKPIs with pagination and filters */
const useSubKpis = createQueryHookFromTemplate(getSubKpisRequest)
const useKpi = createQueryHookFromTemplate(getKpiRequest)
/** Fixed page size for consistent table display */
const FIXED_PAGE_SIZE = 11

interface SubKpiTabProps {
  /** Optional search value passed from parent */
  subKpiSearch?: string
  isDuView?: boolean
  duKpi?: boolean
}

/**
 * SubKpiTab Component
 * Displays a table of SubKPIs belonging to a parent KPI
 *
 * @param props - Component props
 * @param props.subKpiSearch - Optional search string for filtering
 * @returns SubKPI table with toolbar, filters, and pagination
 */
function SubKpiTab({ subKpiSearch: externalSearch, isDuView, duKpi }: SubKpiTabProps) {
  const navigate = useNavigate()
  const { kpiId } = useParams({ from: isDuView ? '/planning/$deliveryUnitId/opcr/kpi/$kpiId/subkpi/' : duKpi ? '/planning/$deliveryUnitId/opcr/kpi/$kpiId/subkpi/' : '/planning/kpi/$kpiId/subKpi/' })
  const search = useSearch({ from: isDuView ? '/planning/$deliveryUnitId/opcr/kpi/$kpiId/subkpi/' : '/planning/kpi/$kpiId/subKpi/' })
  const { data: parentKpi } = useKpi({
    pathParams: {
      id: kpiId,
    },
    queryParams: {},
  })

  // Extract search params with defaults
  const {
    limit = FIXED_PAGE_SIZE,
    page = 1,
    statusFilter,
    subKpiSearch: urlSearch,
  } = search as {
    limit?: number
    page?: number
    statusFilter?: string
    subKpiSearch?: string
  }

  // Use external search if provided, otherwise use URL search
  const currentSearch = externalSearch ?? urlSearch

  /**
   * Memoized status filter change handler
   * Persists filter to URL and resets page to 1
   */
  const handleStatusFilterChange = useCallback(
    (value: string | undefined) => {
      navigate({
        to: '/planning/kpi/$kpiId/subKpi',
        params: { kpiId },
        search: {
          ...search,
          statusFilter: value,
          // Reset to page 1 when filter changes to avoid empty pages
          page: 1,
        },
        replace: true,
      })
    },
    [navigate, search, kpiId],
  )

  /**
   * Memoized search change handler
   * Persists search to URL
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      navigate({
        to: '/planning/kpi/$kpiId/subKpi',
        params: { kpiId },
        search: {
          ...search,
          subKpiSearch: value || undefined,
          // Reset to page 1 when search changes
          page: 1,
        },
        replace: true,
      })
    },
    [navigate, search, kpiId],
  )

  // Build query params with parentKPIId filter
  const queryParams: Record<string, string | number> = {
    PageNumber: page,
    PageSize: limit,
    // Filter by parent KPI ID to get only SubKPIs of this KPI
    Filters: buildFilters(kpiId, statusFilter),
  }

  // Fetch SubKPIs for the current parent KPI
  const { data: subKpis } = useSubKpis({
    pathParams: {},
    queryParams,
  })

  // Define available actions for the table
  const actions: MetaActions = ['write', 'approve', 'delete']

  return (
    <>
      <TemplateTable<KPI>
        columns={Column}
        data={subKpis?.data ?? []}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <Toolbar
            table={table}
            subKpiSearch={currentSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onSearchChange={handleSearchChange}
            isDuView={isDuView}
            duKpi={duKpi}
          />
        )}
        forTab
        fixedPageSize={FIXED_PAGE_SIZE}
        title={parentKpi?.data.name}
      />

      {/* Dialog Manager for all SubKPI dialogs */}
      <SubKpiDialogManager kpiId={kpiId} />
    </>
  )
}

/**
 * Builds the Filters query parameter string
 * Combines parentKPIId filter with optional status filter
 *
 * @param parentKPIId - The parent KPI ID to filter by
 * @param statusFilter - Optional status filter value
 * @returns Filter string for API query
 */
function buildFilters(parentKPIId: string, statusFilter?: string): string {
  const filters: Array<string> = [`parentKPIId==${parentKPIId}`]

  if (statusFilter) {
    filters.push(`status==${statusFilter}`)
  }

  return filters.join(',')
}

export default SubKpiTab
