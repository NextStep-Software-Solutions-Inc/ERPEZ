import { createFileRoute } from '@tanstack/react-router'
import SubKpiTab from '@/pages/planning/kpi/subKpi/SubKpiTab'

/** Search params type for SubKPI route */
type SubKpiSearchParams = {
  page?: number
  limit?: number
  subKpiSearch?: string
  statusFilter?: string
  create?: boolean
  delete?: boolean
  update?: string
}

const DEFAULT_SUBKPI_PAGE_SIZE = 9991;

export const Route = createFileRoute(
  '/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$kpiId/subKpi/',
)({
  component: SubKpiRouteComponent,
  validateSearch: (search: Record<string, unknown>): SubKpiSearchParams => ({
    page: Number(search?.page) || 1,
    limit: Number(search?.limit) || DEFAULT_SUBKPI_PAGE_SIZE,
    subKpiSearch: (search?.subKpiSearch as string) || undefined,
    statusFilter: (search?.statusFilter as string) || undefined,
    create: (search?.create as boolean) || undefined,
    update: (search?.update as string) || undefined,
  }),
})

/**
 * SubKPI Route Component
 * Renders the SubKpiTab component for displaying SubKPIs of a parent KPI
 */
function SubKpiRouteComponent() {
  return <SubKpiTab isDuView />
}
