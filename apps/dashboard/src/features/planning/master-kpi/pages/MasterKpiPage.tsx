/**
 * Key Performance Indicator Library Page
 * Main page for managing performance indicators with multiple display modes (Card, Table, Accordion)
 */

import { useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { pageAnimations } from '@/utils/animation'
import {
  kpiDialogOpenAtom,
  kpiDialogModeAtom,
  deleteKpiDialogOpenAtom,
  selectedKpiForEditAtom,
  selectedKpiForDeleteAtom,
  selectedKpiIdsAtom,
  kpiTableSortingAtom,
  kpiTableColumnFiltersAtom,
  kpiTableColumnVisibilityAtom,
  kpiViewModeAtom,
  kpiCardGridColumnsAtom,
  kpiCardSortByAtom,
} from '../atoms'
import {
  KpiDialog,
  DeleteKpiDialog,
  DeleteMultipleKpisDialog,
} from '../dialogs'
import { MasterKpiCard } from '../components/MasterKpiCard'
import { MasterKpiCardToolbar } from '../components/MasterKpiCardToolbar'
import { TemplateCardListDashtail } from '../components/TemplateCardListDashtail'
import { TemplateTableListDashtail } from '../table/templates'
import { getColumns } from '../table/columns-dashtail'
import { KpiPaginationFooter } from '../components/KpiPaginationFooter'
import { MasterKpiTableToolbar } from '../components/MasterKpiTableToolbar'
import { useKpis } from '../handlers/hooks'
import { MasterKPI } from '../types'
import { cn } from '@/lib/utils'
import { PageContainerDashtail } from '@/components/v2'
import { KpiLibrarySearchParams } from '@/routes/v2/kpi-library/constants'
import {
  mapKpiListItemToMasterKPI,
  mapKpiListResponseToMasterKpis,
} from '../utils/kpiMapper'
import { KpiEmptyState } from '../components/KpiEmptyState'
import {
  filterMasterKpis,
  normalizeStatusFilter,
  parseAdvancedFilters,
  sortMasterKpisForCard,
  sortMasterKpisForTable,
  type MasterKpiHierarchyFilter,
} from '../utils/masterKpiListFilters'

const FULL_REGISTRY_PAGE_SIZE = 1000

export function MasterKpiPage() {
  const navigate = useNavigate({ from: '/v2/kpi-library' })
  const search = useSearch({
    from: '/v2/kpi-library/',
  }) as KpiLibrarySearchParams

  const currentPage = search.page ?? 1
  const pageSize = search.limit ?? 12
  const searchValue = search.search ?? ''
  const statusFilter = normalizeStatusFilter(search.statusFilter)
  const functionCategoryFilter = search.functionTypeFilter ?? 'all'
  const hierarchyFilter = (search.hierarchyFilter ??
    'all') as MasterKpiHierarchyFilter
  const advancedFilters = useMemo(
    () => parseAdvancedFilters(search.advancedFilters),
    [search.advancedFilters],
  )

  const [, setKpiDialogOpen] = useAtom(kpiDialogOpenAtom)
  const [, setKpiDialogMode] = useAtom(kpiDialogModeAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteKpiDialogOpenAtom)
  const [, setSelectedKpiForEdit] = useAtom(selectedKpiForEditAtom)
  const [, setSelectedKpiForDelete] = useAtom(selectedKpiForDeleteAtom)
  const [sorting, setSorting] = useAtom(kpiTableSortingAtom)
  const [columnFilters, setColumnFilters] = useAtom(kpiTableColumnFiltersAtom)
  const [columnVisibility, setColumnVisibility] = useAtom(
    kpiTableColumnVisibilityAtom,
  )
  const [viewMode, setViewMode] = useAtom(kpiViewModeAtom)
  const [gridColumns, setGridColumns] = useAtom(kpiCardGridColumnsAtom)
  const [cardSortBy, setCardSortBy] = useAtom(kpiCardSortByAtom)
  const [rowSelection, setRowSelection] = useAtom(selectedKpiIdsAtom)

  const { data: kpisResponse, isLoading: isKpisLoading } = useKpis({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: FULL_REGISTRY_PAGE_SIZE,
    },
  })

  const allKpis = useMemo(() => {
    return mapKpiListResponseToMasterKpis(kpisResponse?.data ?? [])
  }, [kpisResponse?.data])

  const filteredKpis = useMemo(
    () =>
      filterMasterKpis(allKpis, {
        search: searchValue,
        statusFilter,
        functionCategoryFilter,
        hierarchyFilter,
        advancedFilters,
      }),
    [
      allKpis,
      searchValue,
      statusFilter,
      functionCategoryFilter,
      hierarchyFilter,
      advancedFilters,
    ],
  )

  const sortedKpis = useMemo(() => {
    if (viewMode === 'card') {
      return sortMasterKpisForCard(filteredKpis, cardSortBy)
    }

    return sortMasterKpisForTable(filteredKpis, sorting)
  }, [filteredKpis, viewMode, cardSortBy, sorting])

  const pagedKpis = useMemo(() => {
    const safePage = Math.max(currentPage, 1)
    const start = (safePage - 1) * pageSize
    return sortedKpis.slice(start, start + pageSize)
  }, [sortedKpis, currentPage, pageSize])

  const isLoading = isKpisLoading
  const totalRows = filteredKpis.length
  const totalPages = pageSize > 0 ? Math.ceil(totalRows / pageSize) : 0

  const isFiltered =
    !!searchValue ||
    statusFilter !== 'all' ||
    functionCategoryFilter !== 'all' ||
    hierarchyFilter !== 'all' ||
    Object.keys(advancedFilters).length > 0

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        statusFilter: value === 'all' ? undefined : value,
        page: 1,
      }),
    })
  }

  const handleFunctionCategoryChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        functionTypeFilter: value === 'all' ? undefined : value,
        page: 1,
      }),
    })
  }

  const handleHierarchyChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        hierarchyFilter: value === 'all' ? undefined : value,
        page: 1,
      }),
    })
  }

  const handleClearCardFilters = () => {
    setColumnFilters([])
    navigate({
      search: (prev) => ({
        ...prev,
        search: undefined,
        statusFilter: undefined,
        functionTypeFilter: undefined,
        hierarchyFilter: undefined,
        advancedFilters: undefined,
        page: 1,
      }),
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    })
  }

  const handlePageSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        limit: newSize,
      }),
    })
  }

  const handleEditKpi = (kpi: MasterKPI) => {
    setSelectedKpiForEdit(mapKpiListItemToMasterKPI(kpi))
    setKpiDialogMode('edit')
    setKpiDialogOpen(true)
  }

  useEffect(() => {
    const handleBulkDelete = (event: Event) => {
      const customEvent = event as CustomEvent<{ ids: string[] }>
      const selectedIds = customEvent.detail?.ids || []
      if (selectedIds.length > 0) {
        toast.success(
          `Ready to delete ${selectedIds.length} KPI(s). Implement deletion logic.`,
        )
        // TODO: Implement actual deletion API call
        setRowSelection({})
      }
    }

    window.addEventListener('bulk-delete-kpis', handleBulkDelete)
    return () =>
      window.removeEventListener('bulk-delete-kpis', handleBulkDelete)
  }, [setRowSelection])

  const viewModeIcons = {
    card: (
      <LayoutGrid
        className={cn(
          'h-5 w-5 transition-colors',
          viewMode === 'card' && 'text-primary',
        )}
      />
    ),
    table: (
      <List
        className={cn(
          'h-5 w-5 transition-colors',
          viewMode === 'table' && 'text-primary',
        )}
      />
    ),
  }

  return (
    <PageContainerDashtail contentType="default" mode="simple">
      <Card className="mt-6">
        <CardHeader className="border-b-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Key Performance Indicator Library</CardTitle>
              <CardDescription>
                Manage your centralized indicator library with hierarchical
                organization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'p-2 rounded transition-all duration-200',
                    viewMode === 'card'
                      ? 'bg-background shadow-sm'
                      : 'hover:bg-background/50',
                  )}
                  title="Card view"
                >
                  {viewModeIcons.card}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'p-2 rounded transition-all duration-200',
                    viewMode === 'table'
                      ? 'bg-background shadow-sm'
                      : 'hover:bg-background/50',
                  )}
                  title="Table view"
                >
                  {viewModeIcons.table}
                </motion.button>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setKpiDialogMode('create')
                  setSelectedKpiForEdit(undefined)
                  setKpiDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create KPI
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <AnimatePresence mode="wait">
            {viewMode === 'card' && (
              <motion.div
                key="card-view"
                variants={pageAnimations.pageEnter}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <MasterKpiCardToolbar
                  searchValue={searchValue}
                  onSearchChange={handleSearchChange}
                  functionCategoryFilter={functionCategoryFilter}
                  onFunctionCategoryChange={handleFunctionCategoryChange}
                  statusFilter={statusFilter}
                  onStatusChange={handleStatusChange}
                  hierarchyFilter={hierarchyFilter}
                  onHierarchyChange={handleHierarchyChange}
                  isFiltered={isFiltered}
                  onReset={handleClearCardFilters}
                  gridColumns={gridColumns}
                  onGridColumnsChange={setGridColumns}
                  sortBy={cardSortBy}
                  onSortByChange={setCardSortBy}
                />

                <TemplateCardListDashtail
                  data={pagedKpis}
                  isLoading={isLoading}
                  gridColumns={gridColumns}
                  renderCard={(kpi: MasterKPI) => {
                    const parentKpi = kpi.parentKPIId
                      ? allKpis.find(
                          (candidate) => candidate.id === kpi.parentKPIId,
                        )
                      : undefined

                    return (
                      <MasterKpiCard
                        key={kpi.id}
                        kpi={kpi}
                        parentKpiCode={parentKpi?.code}
                        onView={() =>
                          navigate({
                            to: `/v2/kpi-library/master-kpi/${kpi.id}`,
                          })
                        }
                        onEdit={() => handleEditKpi(kpi)}
                        onDelete={() => {
                          setSelectedKpiForDelete(kpi)
                          setDeleteDialogOpen(true)
                        }}
                      />
                    )
                  }}
                  emptyState={
                    <KpiEmptyState
                      isFiltered={isFiltered}
                      onReset={handleClearCardFilters}
                      onCreateClick={() => {
                        setKpiDialogMode('create')
                        setSelectedKpiForEdit(undefined)
                        setKpiDialogOpen(true)
                      }}
                    />
                  }
                />
              </motion.div>
            )}

            {viewMode === 'table' && (
              <motion.div
                key="table-view"
                variants={pageAnimations.pageEnter}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <TemplateTableListDashtail
                  columns={getColumns({
                    onView: (kpi: MasterKPI) =>
                      navigate({
                        to: `/v2/kpi-library/master-kpi/${kpi.id}`,
                      }),
                    onEdit: handleEditKpi,
                    onDelete: (kpi) => {
                      setSelectedKpiForDelete(kpi)
                      setDeleteDialogOpen(true)
                    },
                  })}
                  data={pagedKpis}
                  isLoading={isLoading}
                  sorting={sorting}
                  onSortingChange={setSorting}
                  columnFilters={columnFilters}
                  onColumnFiltersChange={setColumnFilters}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={setColumnVisibility}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
                  renderToolbar={(table) => (
                    <MasterKpiTableToolbar table={table} />
                  )}
                  emptyState={
                    <KpiEmptyState
                      isFiltered={isFiltered}
                      onReset={handleClearCardFilters}
                      onCreateClick={() => {
                        setKpiDialogMode('create')
                        setSelectedKpiForEdit(undefined)
                        setKpiDialogOpen(true)
                      }}
                    />
                  }
                  pagination={
                    <KpiPaginationFooter
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalRows={totalRows}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && totalRows > 0 && viewMode === 'card' && (
            <KpiPaginationFooter
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

      <KpiDialog availableKpis={allKpis} />
      <DeleteKpiDialog availableKpis={allKpis} />
      <DeleteMultipleKpisDialog />
    </PageContainerDashtail>
  )
}
