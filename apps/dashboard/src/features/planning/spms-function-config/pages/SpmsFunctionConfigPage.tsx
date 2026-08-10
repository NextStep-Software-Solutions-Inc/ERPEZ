import { useAtom } from 'jotai'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { CalendarDays, Target } from 'lucide-react'
import {
  createFunctionConfigDialogOpenAtom,
  editFunctionConfigDialogOpenAtom,
  deleteFunctionConfigDialogOpenAtom,
  selectedFunctionConfigForEditAtom,
  selectedFunctionConfigForDeleteAtom,
  configPageAtom,
  configPageSizeAtom,
} from '../atoms'
import {
  CreateFunctionConfigDialog,
  EditFunctionConfigDialog,
  DeleteFunctionConfigDialog,
} from '../dialogs'
import { useFunctionConfigs } from '../handlers/hooks'
import { ConfigPaginationFooter } from '../components/ConfigPaginationFooter'
import { FunctionConfig } from '../types/functionConfigTypes'
import { ConfigCard } from '../components/ConfigCard'
import {
  SpmsFunctionConfigToolbar,
  WeightFilters,
} from '../components/SpmsFunctionConfigToolbar'
import { AnimatePresence, motion } from 'framer-motion'

export function SpmsFunctionConfigPage() {
  const [, setCreateDialogOpen] = useAtom(createFunctionConfigDialogOpenAtom)
  const [, setEditDialogOpen] = useAtom(editFunctionConfigDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteFunctionConfigDialogOpenAtom)
  const [, setSelectedForEdit] = useAtom(selectedFunctionConfigForEditAtom)
  const [, setSelectedForDelete] = useAtom(selectedFunctionConfigForDeleteAtom)

  const search = useSearch({ from: '/v2/fiscal-year-and-policies/' })
  const navigate = useNavigate()

  const fiscalYearFilter = search.fiscalYearId || 'all'
  const [currentPage, setCurrentPage] = useAtom(configPageAtom)
  const [pageSize, setPageSize] = useAtom(configPageSizeAtom)

  // Weight filters from URL
  const weightFilters: WeightFilters = {
    minStrategic: search.minStrategic,
    minCore: search.minCore,
    minSupport: search.minSupport,
  }

  // View All / By Fiscal Year toggle logic (matching BudgetCallSection pattern)
  const viewAll = fiscalYearFilter === 'all'

  // Construct API filter string
  const buildApiFilters = () => {
    const parts = []
    if (fiscalYearFilter !== 'all') {
      parts.push(`fiscalYearId==${fiscalYearFilter}`)
    }
    if (weightFilters.minStrategic !== undefined) {
      parts.push(`strategicFunctionMinWeight>=${weightFilters.minStrategic}`)
    }
    if (weightFilters.minCore !== undefined) {
      parts.push(`coreFunctionMinWeight>=${weightFilters.minCore}`)
    }
    if (weightFilters.minSupport !== undefined) {
      parts.push(`supportMinWeight>=${weightFilters.minSupport}`)
    }
    return parts.length > 0 ? parts.join(';') : undefined
  }

  // Fetch configs
  const {
    data: configsData,
    isLoading,
    refetch,
  } = useFunctionConfigs({
    pathParams: {},
    queryParams: {
      filters: buildApiFilters(),
      pageNumber: currentPage,
      pageSize: pageSize,
    },
  })

  const updateFilters = (newFilters: {
    fiscalYearId?: string
    minStrategic?: number
    minCore?: number
    minSupport?: number
  }) => {
    navigate({
      to: '/v2/fiscal-year-and-policies',
      search: (prev) => {
        const next = { ...prev, ...newFilters, page: 1 }

        // Cleanup based on 'all' or undefined
        if (next.fiscalYearId === 'all') delete next.fiscalYearId

        // Handle weight filter removals (undefined/zero)
        if (newFilters.minStrategic === undefined) delete next.minStrategic
        if (newFilters.minCore === undefined) delete next.minCore
        if (newFilters.minSupport === undefined) delete next.minSupport

        return next
      },
    })
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    navigate({
      to: '/v2/fiscal-year-and-policies',
      search: (prev) => {
        const next = { ...prev, tab: prev.tab, page: 1 }
        delete next.fiscalYearId
        delete next.minStrategic
        delete next.minCore
        delete next.minSupport
        return next
      },
    })
    setCurrentPage(1)
  }

  const handleEdit = (config: FunctionConfig) => {
    setSelectedForEdit(config)
    setEditDialogOpen(true)
  }

  const handleDelete = (config: FunctionConfig) => {
    setSelectedForDelete(config)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              SPMS Function Weights
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Configure minimum and maximum weight boundaries for each function
              category.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* New Toolbar with Logic */}
          <SpmsFunctionConfigToolbar
            fiscalYearId={fiscalYearFilter}
            onFiscalYearChange={(id) => updateFilters({ fiscalYearId: id })}
            filters={weightFilters}
            onWeightFilterChange={(weights) => updateFilters(weights)}
            onReset={handleResetFilters}
            onCreateClick={() => setCreateDialogOpen(true)}
          />

          {/* Config List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div key={`skeleton-${i}`} layout>
                    <Card className="animate-pulse bg-muted/30 border-border rounded-xl h-60" />
                  </motion.div>
                ))
              ) : configsData?.data?.length === 0 ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10"
                >
                  <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-default-900 font-bold text-lg">
                    No Configurations Found
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                    {viewAll
                      ? 'No weight configurations have been created yet.'
                      : 'Try selecting a different fiscal year or searching for another year.'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full px-6"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create New Weight Boundary
                  </Button>
                </motion.div>
              ) : (
                configsData?.data?.map((config, index) => (
                  <ConfigCard
                    key={config.id}
                    config={config}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {configsData && configsData.totalRows > 0 && (
            <div className="pt-4 border-t border-border">
              <ConfigPaginationFooter
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={configsData.totalPageNumber}
                totalRows={configsData.totalRows}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <CreateFunctionConfigDialog onSuccess={refetch} />
      <EditFunctionConfigDialog onSuccess={refetch} />
      <DeleteFunctionConfigDialog onSuccess={refetch} />
    </div>
  )
}
