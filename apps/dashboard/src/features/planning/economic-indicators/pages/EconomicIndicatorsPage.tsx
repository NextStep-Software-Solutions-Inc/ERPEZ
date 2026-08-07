import { useAtom } from 'jotai'
import { useSearch } from '@tanstack/react-router'
import {
  economicIndicatorPageAtom,
  economicIndicatorPageSizeAtom,
  createEconomicIndicatorDialogOpenAtom,
} from '../atoms'
import { useEconomicIndicators } from '../handlers/hooks'
import { EconomicIndicatorCard } from '../components/EconomicIndicatorCard'
import {
  CreateEconomicIndicatorDialog,
  EditEconomicIndicatorDialog,
  DeleteEconomicIndicatorDialog,
} from '../dialogs'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainerDashtail } from '@/components/v2'
import { DataTable } from '../components/table/components/data-table'
import { columns } from '../components/table/components/columns'

export function EconomicIndicatorsPage() {
  const search = useSearch({ from: '/v2/fiscal-year-and-policies/' })

  const fiscalYearFilter = search.fiscalYearId || 'all'
  const [currentPage] = useAtom(economicIndicatorPageAtom)
  const [pageSize] = useAtom(economicIndicatorPageSizeAtom)
  const [, setCreateDialogOpen] = useAtom(createEconomicIndicatorDialogOpenAtom)
  // View All / By Fiscal Year toggle logic
  const viewAll = fiscalYearFilter === 'all'
  // Construct API filter string
  const buildApiFilters = () => {
    if (fiscalYearFilter !== 'all') {
      return `fiscalYearId==${fiscalYearFilter}`
    }
    return undefined
  }
  // Fetch indicators
  const {
    data: indicatorsData,
    isLoading,
    refetch,
  } = useEconomicIndicators({
    pathParams: {},
    queryParams: {
      ...(buildApiFilters() && { filters: buildApiFilters() }),
      pageNumber: currentPage,
      pageSize: pageSize,
    },
  })

  const allIndicators = indicatorsData?.data || []

  const actions = (
    <div className="flex items-center gap-3">
      {/* Fiscal Year Selector */}

      <Button
        onClick={() => setCreateDialogOpen(true)}
        size="sm"
        className="h-8"
        title="Create Economic Indicator"
      >
        <Plus className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Create Indicator</span>
      </Button>
    </div>
  )

  return (
    <PageContainerDashtail
      title="Economic Indicators"
      titleIcon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
      description="Manage VAT rates, inflation rates, and income tax rates by fiscal year"
      headerSize="small"
      actions={actions}
      containerClassName="p-4 bg-white"
    >
      {/* Content */}
      <div className="space-y-4 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="space-y-2 p-4">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="space-y-3 px-4 pb-4">
                  <div className="h-20 bg-slate-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : allIndicators.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No Economic Indicators Found
              </h3>
              <p className="text-sm text-slate-600 text-center max-w-sm">
                {viewAll
                  ? 'No economic indicators have been created yet. Select a fiscal year and create one to get started.'
                  : 'No indicators found for this fiscal year. Click "Create Indicator" to add one.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={allIndicators}
            enableViewToggle={true}
            defaultView="table"
            cardRenderer={(indicator, idx) => (
              <EconomicIndicatorCard indicator={indicator} index={idx} />
            )}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateEconomicIndicatorDialog onSuccess={refetch} />
      <EditEconomicIndicatorDialog onSuccess={refetch} />
      <DeleteEconomicIndicatorDialog onSuccess={refetch} />
    </PageContainerDashtail>
  )
}
