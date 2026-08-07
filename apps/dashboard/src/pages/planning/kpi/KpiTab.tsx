/**
 * KpiTab Component
 * Renders the KPI table with toolbar, filters, and pagination
 * Follows Single Responsibility: Manages KPI list display and filtering
 */
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useSearch } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import type { KPI } from '@/components/features/planning/kpi/types'
import { Column, Toolbar } from '@/components/features/planning/kpi'
import { TemplateTable } from '@/components/TemplateTable'
import { getKpisRequest } from '@/components/features/planning/kpi/handlers/getKpisRequest'
import CreateKpiDialog from '@/components/features/planning/kpi/dialogs/CreateKpiDialog'
import DeleteKpiDialog from '@/components/features/planning/kpi/dialogs/DeleteKpiDialog'
import { ROLE } from '@/lib/role'

/** Hook for fetching KPIs with pagination and filters */
const useKpis = createQueryHookFromTemplate(getKpisRequest)

interface KpiTabProps {
  // Props can be added here if needed
}

function KpiTab(_props: KpiTabProps) {
  const search = useSearch({ from: '/planning/kpi/' })
  const { limit, page, functionTypeFilter } = search

  // Build query params with optional function type filter
  const queryParams: Record<string, string | number> = {
    pageNumber: page,
    pageSize: limit,
    ...(functionTypeFilter !== undefined && {
      filters: `functionType==${functionTypeFilter}`,
    }),
  }

  const { data: kpis } = useKpis({
    pathParams: {},
    queryParams,
  })

  const actions: MetaActions = ['write', 'approve', 'delete', 'read']

  return (
    <>
      <TemplateTable<KPI>
        columns={Column}
        data={kpis?.data ?? []}
        actions={actions}
        readonly={false}
        toolbar={(table) => <Toolbar table={table} showColumnVisibility />}
        forTab
        fixedPageSize={11}
        role={ROLE} 
      />

      {/* Global dialogs managed by Jotai atoms */}
      <CreateKpiDialog />
      <DeleteKpiDialog />
    </>
  )
}

export default KpiTab
