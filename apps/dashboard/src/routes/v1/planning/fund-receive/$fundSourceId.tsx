import { createFileRoute } from '@tanstack/react-router'
import { FileText, Wallet } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useAtom } from 'jotai'
import type { MetaActions } from '@/types/global'
import { PageContainer } from '@/components/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Column,
  FundReceivingDialogManager,
  Toolbar,
  fundReceivingTableStatesAtom,
} from '@/components/features/planning/fund-receiving'
import { TemplateTable } from '@/components/TemplateTable'
import { getFundReceivingsRequest } from '@/components/features/planning/fund-receiving/handlers/getFundReceivingsRequest'
import { getFundSourceRequest } from '@/components/features/planning/fund-source/handlers/getFundSourceRequest'
import { formatCurrencyPHP, toTitleCase } from '@/utils/formatters'

const useFundReceiving = createQueryHookFromTemplate(getFundReceivingsRequest)
const useFundSource = createQueryHookFromTemplate(getFundSourceRequest)

export const Route = createFileRoute('/v1/planning/fund-receive/$fundSourceId')({
  component: ReceivedFundDetailPage,
})

function ReceivedFundDetailPage() {
  const { fundSourceId } = Route.useParams()

  const { data: fundReceivingResponse, isLoading: isLoadingFundReceiving } =
    useFundReceiving({
      pathParams: { fundSourceId },
      queryParams: { Filters: 'fundSourceId==' + fundSourceId },
    })

  const { data: fundSourcesResponse, isLoading: isLoadingFundSource } =
    useFundSource({
      pathParams: { id: fundSourceId || '' },
      queryParams: {},
    })

  const [tableStates, setTableStates] = useAtom(fundReceivingTableStatesAtom)

  const fundReceivingList = fundReceivingResponse?.data || []
  const isOverallLoading = isLoadingFundReceiving || isLoadingFundSource
  const fundSourceName = fundSourcesResponse?.data?.name || 'N/A'
  const fundReceivingAmount = fundSourcesResponse?.data?.totalReceivedFunds || 0
  const actions: MetaActions = ['write', 'delete', 'read']

  if (isOverallLoading) {
    return (
      <PageContainer
        title="Fund Source Details"
        backTo="/planning/fund"
        backLabel="Back to Fund Receiving"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    )
  }

  if (!fundReceivingList.length) {
    return (
      <PageContainer
        title="Fund Receiving Details"
        backTo="/planning/fund"
        backLabel="Back to Fund Receiving"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">No fund receiving records found</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={`Fund Source: ${toTitleCase(fundSourceName)}`}
      backTo="/planning/fund"
      backLabel="Back to Fund Receiving"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2 p-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <label className="text-sm font-normal text-gray-700">
                    Fund Source
                  </label>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-7">
                  {toTitleCase(fundSourceName)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-gray-500" />
                  <label className="text-sm font-normal text-gray-700">
                    Total Amount Received
                  </label>
                </div>
                <p className="text-xl font-bold text-blue-600 ml-7">
                  {formatCurrencyPHP(fundReceivingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fund Receiving Records</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateTable
              columns={Column}
              data={fundReceivingList}
              actions={actions}
              readonly={false}
              toolbar={(table) => (
                <Toolbar
                  mode="add"
                  initialFundSourceId={fundSourceId}
                  table={table}
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
                setTableStates((prev) => ({
                  ...prev,
                  columnFilters: newFilters,
                }))
              }}
              globalFilter={tableStates.globalFilter}
              onGlobalFilterChange={(value) => {
                setTableStates((prev) => ({ ...prev, globalFilter: value }))
              }}
            />
            <FundReceivingDialogManager />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
