import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useAtom } from 'jotai'
import React from 'react'
import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import {
  ColumnFundSource,
  FundReceivingDialogManager,
  Toolbar,
  fundReceivingTableStatesAtom,
} from '@/components/features/planning/fund-receiving'
import { getFundSourcesRequest } from '@/components/features/planning/fund-source/handlers/getFundSourcesRequest'

const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)

interface FundReceivingTabProps {
  fundReceivingSearch?: string
}

function FundReceivingTab({ fundReceivingSearch }: FundReceivingTabProps) {
  const { data: fundSources } = useFundSources({
    pathParams: {},
    queryParams: {},
  })

  const actions: MetaActions = ['write', 'delete', 'read', 'approve']

  const [tableStates, setTableStates] = useAtom(fundReceivingTableStatesAtom)

  const fundSourcesList = fundSources?.data || []

  React.useEffect(() => {
    setTableStates((prev) => ({
      ...prev,
      globalFilter: fundReceivingSearch || '',
    }))
  }, [fundReceivingSearch, setTableStates])

  const filteredFundSourcesList = fundSourcesList.filter(
    (item) => item.totalReceivedFunds !== 0,
  )
  return (
    <>
      <TemplateTable
        columns={ColumnFundSource}
        data={filteredFundSourcesList}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <Toolbar table={table} showColumnVisibility mode={'create'} />
        )}
        forTab
        fixedPageSize={11}
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
          setTableStates((prev) => ({ ...prev, sorting: newSorting }))
        }}
        columnFilters={tableStates.columnFilters}
        onColumnFiltersChange={(updater) => {
          const newFilters =
            typeof updater === 'function'
              ? updater(tableStates.columnFilters)
              : updater
          setTableStates((prev) => ({ ...prev, columnFilters: newFilters }))
        }}
        globalFilter={tableStates.globalFilter}
        onGlobalFilterChange={(value) => {
          setTableStates((prev) => ({ ...prev, globalFilter: value }))
        }}
      />
      <FundReceivingDialogManager />
    </>
  )
}
export default FundReceivingTab
