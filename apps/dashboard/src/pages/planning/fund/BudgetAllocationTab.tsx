import React from 'react'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import { budgetAllocationTableStatesAtom } from '@/components/features/planning/budget-allocation/atoms'
import {
  ColumnDU,
  Toolbar,
} from '@/components/features/planning/budget-allocation/table'
import BudgetAllocationDialogManager from '@/components/features/planning/budget-allocation/BudgetAllocationDialogManager'
import { getDUAllocationStatsRequest } from '@/components/features/planning/budget-allocation/handlers/getDUAllocationStatsRequest'
import { getDeliveryUnitsRequest } from '@/components/features/planning/budget-allocation/handlers/getDeliveryUnitsRequest'
import { BudgetAllocationStats } from '@/components/features/planning/budget-allocation/components/BudgetAllocationStats'

const useDUAllocationStats = createQueryHookFromTemplate(
  getDUAllocationStatsRequest,
)
const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest)

interface BudgetAllocationTabProps {
  budgetAllocationSearch?: string
}

function BudgetAllocationTab({
  budgetAllocationSearch,
}: BudgetAllocationTabProps) {
  const { data: duAllocationStats } = useDUAllocationStats({
    pathParams: {},
    queryParams: {},
  })
  const { data: deliveryUnits } = useDeliveryUnits({
    pathParams: {},
    queryParams: { pageSize: 1000, filters: 'parentId==null' },
  })

  const actions: MetaActions = ['read', 'write']

  const [tableStates, setTableStates] = useAtom(budgetAllocationTableStatesAtom)

  const deliveryUnitsList = deliveryUnits?.data ?? []

  // ------------------------------------
  // Sync global search
  // ------------------------------------
  React.useEffect(() => {
    setTableStates((prev) => ({
      ...prev,
      globalFilter: budgetAllocationSearch ?? '',
    }))
  }, [budgetAllocationSearch, setTableStates])

  return (
    <>
      <BudgetAllocationStats stats={duAllocationStats?.data} />
      <TemplateTable
        columns={ColumnDU}
        data={deliveryUnitsList}
        actions={actions}
        readonly={false}
        forTab
        fixedPageSize={11}
        toolbar={(table) => <Toolbar table={table} showColumnVisibility onGlobalFilterChange={(value) => {
          setTableStates((prev) => ({
            ...prev,
            globalFilter: value,
          }))
        }} />}
        columnVisibility={tableStates.columnVisibility}
        onColumnVisibilityChange={(updater) => {
          const newVisibility =
            typeof updater === 'function'
              ? updater(tableStates.columnVisibility)
              : updater

          setTableStates((prev) => ({
            ...prev,
            columnVisibility: newVisibility,
          }))
        }}
        sorting={tableStates.sorting}
        onSortingChange={(updater) => {
          const newSorting =
            typeof updater === 'function'
              ? updater(tableStates.sorting)
              : updater

          setTableStates((prev) => ({
            ...prev,
            sorting: newSorting,
          }))
        }}
        columnFilters={tableStates.columnFilters}
        onColumnFiltersChange={(updater) => {
          const newFilters =
            typeof updater === 'function'
              ? updater(tableStates.columnFilters)
              : updater

          setTableStates((prev) => ({
            ...prev,
            columnFilters: newFilters,
          }))
        }}
      />

      <BudgetAllocationDialogManager />
    </>
  )
}

export default BudgetAllocationTab
