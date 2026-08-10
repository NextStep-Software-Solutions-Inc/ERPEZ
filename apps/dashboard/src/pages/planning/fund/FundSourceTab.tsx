import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useAtom } from 'jotai'
import { useSearch } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import {
  Column,
  FundSourceDialogManager,
  Toolbar,
} from '@/components/features/planning/fund-source'
import { getFundSourcesRequest } from '@/components/features/planning/fund-source/handlers/getFundSourcesRequest'
import { fundSourceTableStatesAtom } from '@/components/features/planning/fund-source/atoms'

const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)
function FundSourceTab({ fundSourceSearch }: { fundSourceSearch?: string }) {
  // const { data: fundSources } = useFundSources({
  //     pathParams: {},
  //     queryParams: {
  //         Filters: "type==AuthorizationCode",
  //     },
  // });
  const searchParams = useSearch({ from: '/planning/fund/' })
  const { limit, page } = searchParams
  const { data: fundSources } = useFundSources({
    pathParams: {},
    queryParams: {
      pageNumber: page,
      pageSize: limit,
    },
  })
  const actions: MetaActions = ['write', 'delete']

  const [tableStates, setTableStates] = useAtom(fundSourceTableStatesAtom)

  return (
    <>
      <TemplateTable
        columns={Column}
        data={fundSources?.data || []}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <Toolbar
            table={table}
            fundSourceSearch={fundSourceSearch}
            showColumnVisibility
          />
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
      <FundSourceDialogManager />
    </>
  )
}

export default FundSourceTab
