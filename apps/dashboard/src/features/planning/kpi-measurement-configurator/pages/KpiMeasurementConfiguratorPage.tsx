/**
 * KPI Measurement Configurator
 * Main page for defining measurement configurations across MPIs
 */

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { measurementViewModeAtom } from '../atoms'
import {
  CreateMeasurementDialog,
  EditMeasurementDialog,
  DeleteMeasurementDialog,
} from '../dialogs'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import { pageAnimations, useReducedMotion } from '@/utils/animation'
import { cn } from '@/lib/utils'
import {
  IndicatorPaginationFooter,
  PerformanceMeasureScaleAccordionView,
  PerformanceMeasureScaleCardView,
  KpiMeasurementConfiguratorHeader,
  KpiMeasurementConfiguratorFilters,
} from '../components'
import { useKpiMeasurements } from '../handlers/hooks'
import { useKpiMeasurementConfigurator } from '../hooks/useKpiMeasurementConfigurator'
import { KPIMeasurement, IndicatorDimension } from '../types'
import { PerformanceMeasuringScale } from '../types/performance-measuring-scale.types'

/**
 * Helper to map API model to UI model structure for card/accordion views
 */
function mapMeasurements(
  data: KPIMeasurement[] = [],
): PerformanceMeasuringScale[] {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    masterKPIId: item.kpiId,
    statement: item.statement,
    dimensions: (item.dimensions || []).map((dim) => {
      const found = Object.values(IndicatorDimension).find(
        (val) => val.toLowerCase() === dim.toLowerCase()
      )
      return found || dim
    }) as IndicatorDimension[],
    mov: item.moVs.filter((m): m is string => m !== null),
    templateId: item.ratingScaleTemplateId || '',
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  }))
}

export function KpiMeasurementConfiguratorPage() {
  const {
    kpiParam,
    searchFilter,
    dimensionFilter,
    currentPage,
    pageSize,
    isFiltered,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleKpiChange,
    handleDimensionChange,
    handleClearFilters,
    setCreateDialogOpen,
  } = useKpiMeasurementConfigurator()

  const [viewMode, setViewMode] = useAtom(measurementViewModeAtom)
  const prefersReducedMotion = useReducedMotion()

  // Fetch KPI master data for filters and mapping
  const { data: kpisData, isLoading: isLoadingKpis } = useKpis({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const masterKpis = kpisData?.data || []

  // Filter Master KPIs for the dropdown to match search filter, but keep the selected one
  const filteredMasterKpisForSelect = useMemo(() => {
    if (!searchFilter) return masterKpis
    const searchLower = searchFilter.toLowerCase().trim()
    return masterKpis.filter(
      (kpi) =>
        kpi.id === kpiParam ||
        kpi.code?.toLowerCase().includes(searchLower) ||
        kpi.name?.toLowerCase().includes(searchLower)
    )
  }, [masterKpis, searchFilter, kpiParam])

  // Fetch all measurements to support flexible client-side filter and search
  const { data: kpiMeasurements, isLoading } = useKpiMeasurements({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 1000,
    },
    enabled: true,
  })

  // Filter and search measurements client-side
  const filteredMeasurements = useMemo(() => {
    let items = kpiMeasurements?.data || []

    // 1. Filter by selected Master KPI
    if (kpiParam && kpiParam !== 'all') {
      items = items.filter((item) => item.kpiId === kpiParam)
    }

    // 2. Filter by dimension (case-insensitive check)
    if (dimensionFilter && dimensionFilter !== 'all') {
      items = items.filter((item) => {
        return item.dimensions?.some(
          (dim) => dim.toLowerCase() === dimensionFilter.toLowerCase()
        )
      })
    }

    // 3. Filter by search filter (searching across KPI name/code, statements, dimensions, MOVs)
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase().trim()
      items = items.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(searchLower)
        const statementMatch = item.statement?.toLowerCase().includes(searchLower)

        const dimensionMatch = item.dimensions?.some((dim) =>
          dim.toLowerCase().includes(searchLower),
        )

        const movMatch = item.moVs?.some((mov) =>
          mov?.toLowerCase().includes(searchLower),
        )

        // Lookup matching Master KPI to check code/name
        const kpi = masterKpis.find((k) => k.id === item.kpiId)
        const kpiCodeMatch = kpi?.code?.toLowerCase().includes(searchLower)
        const kpiNameMatch = kpi?.name?.toLowerCase().includes(searchLower)

        return (
          nameMatch ||
          statementMatch ||
          dimensionMatch ||
          movMatch ||
          kpiCodeMatch ||
          kpiNameMatch
        )
      })
    }

    return items
  }, [kpiMeasurements?.data, kpiParam, dimensionFilter, searchFilter, masterKpis])

  const totalRows = filteredMeasurements.length
  const totalPages = Math.ceil(totalRows / pageSize)

  const paginatedMeasurements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMeasurements.slice(start, start + pageSize)
  }, [filteredMeasurements, currentPage, pageSize])

  // Map API response to UI model
  const mappedScales = mapMeasurements(paginatedMeasurements)

  return (
    <div className="space-y-6">
      <KpiMeasurementConfiguratorHeader
        onAddClick={() => setCreateDialogOpen(true)}
      />

      <KpiMeasurementConfiguratorFilters
        kpiParam={kpiParam}
        searchFilter={searchFilter}
        dimensionFilter={dimensionFilter}
        masterKpis={filteredMasterKpisForSelect}
        isLoadingKpis={isLoadingKpis}
        isFiltered={isFiltered}
        onKpiChange={handleKpiChange}
        onDimensionChange={handleDimensionChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content Card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Performance Measure Scales
                {totalRows > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({totalRows})
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5">
                Manage names, default dimensions, MOVs, and rating scales for
                KPI measurement configurations
              </CardDescription>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  viewMode === 'card'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Card view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('accordion')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  viewMode === 'accordion'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Table view"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Content Area */}
          <AnimatePresence mode="wait">
            {!isLoading && mappedScales.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="rounded-full bg-muted p-4 mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  No performance measure scales found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFiltered
                    ? 'Try adjusting your filters or search query.'
                    : 'Add your first performance measure scale to get started.'}
                </p>
                {!isFiltered && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Performance Measure Scale
                  </Button>
                )}
              </motion.div>
            ) : viewMode === 'card' ? (
              <motion.div
                key="card-view"
                variants={pageAnimations.pageEnter}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.2 }}
              >
                <PerformanceMeasureScaleCardView
                  scales={mappedScales}
                  isLoading={isLoading}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </motion.div>
            ) : (
              <motion.div
                key="accordion-view"
                variants={pageAnimations.pageEnter}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.2 }}
              >
                <PerformanceMeasureScaleAccordionView
                  scales={mappedScales}
                  isLoading={isLoading}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Footer */}
          {!isLoading && totalRows > 0 && (
            <IndicatorPaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRows={totalRows}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateMeasurementDialog />
      <EditMeasurementDialog />
      <DeleteMeasurementDialog />
    </div>
  )
}
