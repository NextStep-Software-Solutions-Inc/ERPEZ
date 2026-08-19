import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  useBulkActions,
  useDialogStates,
  useLibFiltering,
  useLibsStatistics,
  usePagination,
} from '../../../../features/planning/line-item-budgeting/line-item-budget/hooks'
import {
  BulkActionsBar,
  BulkDeleteDialog,
  FilterPanel,
  HeroSection,
  LIBApprovalDialog,
  LibList,
  PaginationControls,
  QuickStatsGrid,
  SearchBar,
} from '../../../../features/planning/line-item-budgeting/line-item-budget/components'
import { DeleteConfirmDialog } from '../../../../features/planning/line-item-budgeting/realignment/dialogs/DeleteConfirmDialog'
import LIBDetailPage from '../LIBDetailPage'
import { getLIBsRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBsRequest'
import { deleteLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/deleteLIBRequest'
import { updateLIBStatusRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/updateLIBStatusRequest'
import { LinkCeilingDialog } from '../dialogs/LinkCeilingDialog'
import type { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

const useLIBs = createQueryHookFromTemplate(getLIBsRequest)
const useDeleteLIB = createMutationHookFromTemplate(deleteLIBRequest)
const useUpdateLIBStatus = createMutationHookFromTemplate(
  updateLIBStatusRequest,
)

const LIB_FETCH_PAGE_SIZE = 1000

const parseCsv = (value?: string) =>
  value
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []

const toggleSelection = (current: Array<string>, value: string) =>
  current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value]

export function LineItemBudgetTab({
  title,
  scope,
}: { title?: string; scope?: 'office' | 'sub-office' } = {}) {
  const navigate = useNavigate({ from: '/v2/line-item-budgeting' })
  const searchParams = useSearch({ from: '/v2/line-item-budgeting' })
  const queryClient = useQueryClient()
  const {
    libId,
    officeId,
    pageNumber = 1,
    pageSize = 100,
    searchQuery = '',
    selectedYear = '',
    selectedStatuses: selectedStatusesParam = '',
    selectedSourceTypes: selectedSourceTypesParam = '',
  } = searchParams

  const selectedStatuses = useMemo(
    () => parseCsv(selectedStatusesParam),
    [selectedStatusesParam],
  )
  const selectedSourceTypes = useMemo(
    () => parseCsv(selectedSourceTypesParam),
    [selectedSourceTypesParam],
  )

  // ============================================================================
  // PAGINATION & FILTERING STATE
  // ============================================================================

  const ITEMS_PER_PAGE = Math.max(1, pageSize)

  // Approval Dialog State
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>(
    'approve',
  )
  const [selectedLibForApproval, setSelectedLibForApproval] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isApprovalLoading, setIsApprovalLoading] = useState(false)

  // Delete Dialog State
  const [libToDelete, setLibToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Link Ceiling Dialog State
  const [selectedLibForCeiling, setSelectedLibForCeiling] = useState<LIB | null>(null)

  const { mutateAsync: deleteAsync } = useDeleteLIB()
  const { mutateAsync: updateStatusAsync } = useUpdateLIBStatus()
  const {
    data: libs,
    isLoading,
    error,
    refetch,
  } = useLIBs({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: LIB_FETCH_PAGE_SIZE,
      ...(officeId ? { filters: `officeId==${officeId}` } : {}),
    },
  })

  const {
    showFilterPanel,
    setShowFilterPanel,
    showBulkDelete,
    setShowBulkDelete,
  } = useDialogStates()

  // Bulk Selection
  const {
    selectedLibIds,
    toggleLibSelection,
    toggleSelectAll,
    clearSelection,
  } = useBulkActions()

  const handleUpdateLIB = (id: string) => {
    handleViewDetails(id)
  }

  const handleDeleteLIB = (libraryId: string) => {
    const lib = libs?.data.find((l) => l.id === libraryId)
    if (lib) {
      setLibToDelete({ id: libraryId, name: lib.name })
    }
  }

  const confirmDeleteLIB = async () => {
    if (!libToDelete) return
    setIsDeleting(true)
    try {
      await deleteAsync(
        { pathParams: { id: libToDelete.id } },
        {
          onSuccess: async () => {
            toast.success(`LIB "${libToDelete.name}" deleted successfully`)
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/libs'),
            })
            setLibToDelete(null)
          },
        }
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete LIB'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApproveLIB = (libraryId: string) => {
    const lib = libs?.data.find((l) => l.id === libraryId)
    if (lib) {
      setSelectedLibForApproval({ id: libraryId, name: lib.name })
      setApprovalAction('approve')
      setApprovalDialogOpen(true)
    }
  }

  const handleRejectLIB = (libraryId: string) => {
    const lib = libs?.data.find((l) => l.id === libraryId)
    if (lib) {
      setSelectedLibForApproval({ id: libraryId, name: lib.name })
      setApprovalAction('reject')
      setApprovalDialogOpen(true)
    }
  }

  const handleConfirmApproval = async () => {
    if (!selectedLibForApproval) return

    setIsApprovalLoading(true)

    try {
      const newStatus = approvalAction === 'approve' ? 'Approved' : 'Rejected'

      await updateStatusAsync(
        {
          pathParams: { id: selectedLibForApproval.id },
          queryParams: {},
          payload: { status: newStatus },
        },
        {
          onSuccess: async () => {
            const actionLabel =
              approvalAction === 'approve' ? 'approved' : 'rejected'
            toast.success(
              `LIB "${selectedLibForApproval.name}" has been ${actionLabel}!`,
            )

            // Refetch the LIBs list to reflect the updated status
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith(`/libs`),
            })

            setApprovalDialogOpen(false)
            setSelectedLibForApproval(null)
          },
        },
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update LIB status'
      toast.error(errorMessage)
      setApprovalDialogOpen(false)
      setSelectedLibForApproval(null)
    } finally {
      setIsApprovalLoading(false)
    }
  }

  const handleBulkDeleteLibs = () => {}

  const updateSearch = useCallback(
    (updater: (prev: typeof searchParams) => typeof searchParams) => {
      navigate({
        search: updater,
        replace: true,
      })
    },
    [navigate],
  )

  const handleLinkCeilingTrigger = (lib: LIB) => {
    setSelectedLibForCeiling(lib)
  }

  const handleViewDetails = (id: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        libId: id,
        libActivityId: undefined,
        wfpObjectiveActivityId: undefined,
      }),
    })
  }

  const handleBackFromDetails = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        libId: undefined,
        libActivityId: undefined,
        wfpObjectiveActivityId: undefined,
      }),
    })
  }

  const allLibs = libs?.data || []
  const activeLibs = useMemo(() => {
    return allLibs.filter(
      (lib) => !allLibs.some((other) => other.previousVersionId === lib.id)
    )
  }, [allLibs])
  
  const filteredLibs = useLibFiltering(
    activeLibs,
    searchQuery,
    selectedStatuses,
    selectedSourceTypes,
    selectedYear,
  )
  const stats = useLibsStatistics(filteredLibs)
  const totalPages = Math.ceil(filteredLibs.length / ITEMS_PER_PAGE)
  const safeCurrentPage =
    totalPages > 0 ? Math.min(Math.max(1, pageNumber), totalPages) : 1
  const { filteredLibs: paginatedLibs } = usePagination(
    filteredLibs,
    safeCurrentPage,
    ITEMS_PER_PAGE,
  )

  useEffect(() => {
    if (pageNumber !== safeCurrentPage) {
      updateSearch((prev) => ({
        ...prev,
        pageNumber: safeCurrentPage,
      }))
    }
  }, [pageNumber, safeCurrentPage, updateSearch])

  const handleStatusFilter = (status: string) => {
    updateSearch((prev) => ({
      ...prev,
      selectedStatuses:
        toggleSelection(selectedStatuses, status).join(',') || undefined,
      pageNumber: 1,
    }))
  }

  const handleSourceTypeFilter = (type: string) => {
    updateSearch((prev) => ({
      ...prev,
      selectedSourceTypes:
        toggleSelection(selectedSourceTypes, type).join(',') || undefined,
      pageNumber: 1,
    }))
  }

  const handleYearChange = (value: string) => {
    updateSearch((prev) => ({
      ...prev,
      selectedYear: value === 'all' ? undefined : value,
      pageNumber: 1,
    }))
  }

  const handleSearchChange = (value: string) => {
    updateSearch((prev) => ({
      ...prev,
      searchQuery: value || undefined,
      pageNumber: 1,
    }))
  }

  const handleClearFilters = () => {
    updateSearch((prev) => ({
      ...prev,
      searchQuery: undefined,
      selectedStatuses: undefined,
      selectedSourceTypes: undefined,
      selectedYear: undefined,
      pageNumber: 1,
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <HeroSection title={title} scope={scope} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading libraries...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <HeroSection title={title} scope={scope} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading libraries</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Show detail page if libId in search params, otherwise show list */}
      {libId ? (
        <LIBDetailPage
          onBack={handleBackFromDetails}
          // onStatusUpdate={handleStatusChange}
        />
      ) : (
        <>
          <HeroSection title={title} scope={scope} isSubOfficeToggleEnabled />
          {/* Quick Stats Grid */}
          <QuickStatsGrid stats={stats} />

          {/* Search & Filter Section */}
          <div className="space-y-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
              filterCount={() =>
                selectedStatuses.length +
                selectedSourceTypes.length +
                (selectedYear ? 1 : 0)
              }
            />

            {/* Filter Panel */}
            <FilterPanel
              open={showFilterPanel}
              selectedStatuses={selectedStatuses}
              selectedSourceTypes={selectedSourceTypes}
              selectedYear={selectedYear || 'all'}
              stats={stats}
              onStatusChange={handleStatusFilter}
              onSourceTypeChange={handleSourceTypeFilter}
              onYearChange={handleYearChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedLibIds.size > 0 && (
            <BulkActionsBar
              count={selectedLibIds.size}
              onDelete={() => setShowBulkDelete(true)}
              onClearSelection={clearSelection}
            />
          )}

          {/* LIB List */}
          <LibList
            libs={paginatedLibs}
            selectedIds={selectedLibIds}
            onSelectOne={toggleLibSelection}
            onSelectAll={() => toggleSelectAll(filteredLibs)}
            onView={handleViewDetails}
            onEdit={handleUpdateLIB}
            onDelete={handleDeleteLIB}
            onApprove={handleApproveLIB}
            onReject={handleRejectLIB}
            onLinkCeiling={handleLinkCeilingTrigger}
          />

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <PaginationControls
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredLibs.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) =>
                updateSearch((prev) => ({
                  ...prev,
                  pageNumber: page,
                }))
              }
            />
          )}

          {/* Bulk Delete Confirmation Dialog */}
          <BulkDeleteDialog
            open={showBulkDelete}
            count={selectedLibIds.size}
            onConfirm={handleBulkDeleteLibs}
            onCancel={() => setShowBulkDelete(false)}
          />

          {/* LIB Approval/Rejection Dialog */}
          {selectedLibForApproval && (
            <LIBApprovalDialog
              open={approvalDialogOpen}
              libName={selectedLibForApproval.name}
              action={approvalAction}
              onConfirm={handleConfirmApproval}
              onCancel={() => {
                setApprovalDialogOpen(false)
                setSelectedLibForApproval(null)
              }}
              isLoading={isApprovalLoading}
            />
          )}

          {/* Delete Confirmation Dialog */}
          {libToDelete && (
            <DeleteConfirmDialog
              open={!!libToDelete}
              onOpenChange={(open) => !open && setLibToDelete(null)}
              onConfirm={confirmDeleteLIB}
              itemType="budget item"
              itemName={libToDelete.name}
              isLoading={isDeleting}
            />
          )}

          {/* Link Ceiling Dialog */}
          <LinkCeilingDialog
            open={!!selectedLibForCeiling}
            onOpenChange={(open) => !open && setSelectedLibForCeiling(null)}
            lib={selectedLibForCeiling}
            onSuccess={refetch}
          />
        </>
      )}
    </div>
  )
}
