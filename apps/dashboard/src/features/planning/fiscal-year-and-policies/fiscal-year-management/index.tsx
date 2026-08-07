import { useState } from 'react'
import { toast } from 'sonner'
import type { FiscalYear } from './types/types'
// import { useFiscalYearQueries } from './hooks/useFiscalYearQueries'
import {
  useCreateFiscalYearState,
  useStatusChangeState,
  useExpandedYearState,
} from './hooks/useLocalState'
import {
  useEditFiscalYearState,
  useDeleteFiscalYearState,
} from './hooks/useEditDeleteState'
import { getStatusTransitionWarning } from './utils/validation'
import { ErrorAlert } from './components/ErrorAlert'
import { CreateFiscalYearDialog } from './dialogs/CreateFiscalYearDialog'
import { EditFiscalYearDialog } from './dialogs/EditFiscalYearDialog'
import { FiscalYearTable } from './components/FiscalYearTable'
import { createFiscalYearRequest } from './handlers/createFiscalYearRequest'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { updateFiscalYearRequest } from './handlers/updateFiscalYearRequest'
import { patchFiscalYearRequest } from './handlers/patchFiscalYearRequest'
import { deleteFiscalYearRequest } from './handlers/deleteFiscalYearRequest'
import { unlockFiscalMonthRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/unlockFiscalMonthRequest'
import { lockFiscalMonthRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/lockFiscalMonthRequest'
import { getFiscalMonthsRequest } from '@/lib/fiscal-year-and-policies/handlers/fiscal-months/getFiscalMonthsRequest'
import { getFiscalYearsRequest } from './handlers/getFiscalYearsRequest'
import { StatusChangeConfirmDialog } from './components/StatusChangeConfirmDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
interface FiscalYearManagementProps {
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}
const useCreateFiscalYear = createMutationHookFromTemplate(
  createFiscalYearRequest,
)
const useUpdateFiscalYear = createMutationHookFromTemplate(
  updateFiscalYearRequest,
)
const usePatchFiscalYear = createMutationHookFromTemplate(
  patchFiscalYearRequest,
)

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useFiscalMonths = createQueryHookFromTemplate(getFiscalMonthsRequest)
const useLockFiscalMonth = createMutationHookFromTemplate(
  lockFiscalMonthRequest,
)
const useDeleteFiscalYear = createMutationHookFromTemplate(
  deleteFiscalYearRequest,
)
const useUnlockFiscalMonth = createMutationHookFromTemplate(
  unlockFiscalMonthRequest,
)
/**
 * FiscalYearManagement - Main container component
 *
 * Responsibilities:
 * - Orchestrate state management across multiple local state hooks
 * - Handle fiscal year creation, status changes, editing, deletion, and month locking
 * - Coordinate with API calls via useFiscalYearQueries
 * - Delegate UI rendering to specialized components
 */
export default function FiscalYearManagement({
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: FiscalYearManagementProps) {
  const queryClient = useQueryClient()

  const { data: fiscalYears } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })

  const { data: fiscalMonths } = useFiscalMonths({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })
  const { mutate: lockFiscalMonth } = useLockFiscalMonth()
  const { mutate: unlockFiscalMonth } = useUnlockFiscalMonth()

  const { mutateAsync: createFiscalYear } = useCreateFiscalYear()
  const { mutateAsync: updateFiscalYear } = useUpdateFiscalYear()
  const { mutateAsync: patchFiscalYear } = usePatchFiscalYear()
  const { mutateAsync: deleteFiscalYear } = useDeleteFiscalYear()
  const createState = useCreateFiscalYearState()
  const statusState = useStatusChangeState()
  const expandState = useExpandedYearState()
  const editState = useEditFiscalYearState()
  const deleteState = useDeleteFiscalYearState()
  const [globalError, setGlobalError] = useState<string | null>(null)

  /**
   * Handle creating a new fiscal year
   */
  const handleCreateFiscalYear = async (values: {
    year: number
    description?: string
  }) => {
    try {
      setGlobalError(null)

      // Call API
      createFiscalYear(
        {
          pathParams: {},
          payload: {
            year: values.year,
            description: values.description || undefined,
            status: 'setup',
          },
        },
        {
          onSuccess: () => {
            // Invalidate query to refetch fiscal years
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/fiscal-years')
                )
              },
            })
            createState.reset()
            createState.setDialogOpen(false)
            onPageChange?.(1) // Reset to first page
            toast.success('Fiscal year created successfully')
          },
          onError: (err) => {
            const errorMsg =
              err instanceof Error
                ? err.message
                : 'Failed to create fiscal year'
            setGlobalError(errorMsg)
            toast.error(errorMsg)
          },
        },
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to create fiscal year'
      setGlobalError(errorMsg)
      toast.error(errorMsg)
    }
  }

  /**
   * Handle initiating an edit
   */
  const handleEditInitiate = (fiscalYear: FiscalYear) => {
    editState.initiateEdit(fiscalYear)
    setGlobalError(null)
  }

  /**
   * Handle confirming an edit with retry logic
   */
  const handleEditConfirm = (values: {
    year: number
    description?: string
  }) => {
    if (!editState.editingFiscalYear) return

    try {
      setGlobalError(null)
      editState.setLoading(true)

      // Call API
      updateFiscalYear(
        {
          pathParams: { id: editState.editingFiscalYear.id },
          payload: {
            year: values.year,
            description: values.description || undefined,
          },
        },
        {
          onSuccess: () => {
            // Invalidate query to refetch fiscal years
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/fiscal-years')
                )
              },
            })
            editState.reset()
            editState.setDialogOpen(false)
            toast.success('Fiscal year updated successfully')
          },
          onError: (err) => {
            const errorMsg =
              err instanceof Error
                ? err.message
                : 'Failed to update fiscal year'
            editState.setLoading(false)
            setGlobalError(errorMsg)
            toast.error(errorMsg)
          },
        },
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to update fiscal year'
      editState.setLoading(false)
      setGlobalError(errorMsg)
      toast.error(errorMsg)
    }
  }

  /**
   * Handle initiating a delete
   */
  const handleDeleteInitiate = (fiscalYear: FiscalYear) => {
    deleteState.initiateDelete(fiscalYear)
    setGlobalError(null)
  }

  /**
   * Handle confirming a delete with retry logic
   */
  const handleDeleteConfirm = () => {
    if (!deleteState.deletingFiscalYear) return

    try {
      setGlobalError(null)
      deleteState.setLoading(true)

      // Call API
      deleteFiscalYear(
        {
          pathParams: { id: deleteState.deletingFiscalYear.id },
        },
        {
          onSuccess: () => {
            // Invalidate query to refetch fiscal years
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/fiscal-years')
                )
              },
            })
            deleteState.reset()
            deleteState.setConfirmOpen(false)
            onPageChange?.(1) // Reset to first page
            toast.success('Fiscal year deleted successfully')
          },
          onError: (err) => {
            const errorMsg =
              err instanceof Error
                ? err.message
                : 'Failed to delete fiscal year'
            deleteState.setLoading(false)
            deleteState.setError(errorMsg)
            setGlobalError(errorMsg)
            toast.error(errorMsg)
          },
        },
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete fiscal year'
      deleteState.setLoading(false)
      deleteState.setError(errorMsg)
      setGlobalError(errorMsg)
      toast.error(errorMsg)
    }
  }
  /**
   * Handle initiating a status change
   */
  const handleStatusChangeInitiate = (
    fiscalYear: FiscalYear,
    newStatus: FiscalYear['status'],
  ) => {
    statusState.initiate(fiscalYear, newStatus)
    setGlobalError(null)
  }

  /**
   * Handle confirming a status change
   */
  const handleStatusChangeConfirm = () => {
    if (!statusState.pendingChange) return

    const { fiscalYear, newStatus } = statusState.pendingChange

    patchFiscalYear(
      {
        pathParams: { id: fiscalYear.id },
        queryParams: {},
        payload: { status: newStatus },
      },
      {
        onSuccess: () => {
          statusState.confirm()
          void queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0]
              return typeof key === 'string' && key.startsWith('/fiscal-years')
            },
          })
          toast.success('Fiscal year status updated successfully')
        },
        onError: (err) => {
          const errorMsg =
            err instanceof Error
              ? err.message
              : 'Failed to update fiscal year status'
          statusState.setError(errorMsg)
          setGlobalError(errorMsg)
          toast.error(errorMsg)
        },
      },
    )
  }

  /**
   * Handle expanding/collapsing a fiscal year
   */
  const handleExpandYearClick = (yearId: string) => {
    expandState.toggle(yearId)
    setGlobalError(null)

    // Simulate loading if not already loaded
    if (
      !expandState.loadedYearIds.has(yearId) &&
      !expandState.loadingYearIds.has(yearId)
    ) {
      expandState.setLoading(yearId, true)

      const timer = setTimeout(() => {
        expandState.setLoading(yearId, false)
        expandState.setLoaded(yearId)
      }, 600)

      return () => clearTimeout(timer)
    }
  }

  /**
   * Handle toggling month lock status
   */
  const handleMonthLockToggle = (monthId: string) => {
    try {
      setGlobalError(null)

      // Find the month to determine current state
      const month = fiscalMonths?.data.find((m) => m.id === monthId)
      if (!month) {
        const errorMsg = 'Month not found'
        setGlobalError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Find the fiscal year this month belongs to
      const fiscalYear = fiscalYears?.data.find(
        (fy) => fy.id === month.fiscalYearId,
      )

      // Check if fiscal year is closed
      if (fiscalYear?.status === 'closed') {
        const errorMsg = 'Cannot lock/unlock months in a closed fiscal year'
        setGlobalError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Determine whether to lock or unlock based on current state
      const mutation = month.isLocked ? unlockFiscalMonth : lockFiscalMonth
      const action = month.isLocked ? 'unlocking' : 'locking'

      mutation(
        {
          pathParams: { id: monthId },
          queryParams: { id: monthId },
          payload: {},
        },
        {
          onSuccess: () => {
            // Invalidate fiscal months query to refetch updated data
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/fiscal-months')
                )
              },
            })
            const actionText = month.isLocked ? 'unlocked' : 'locked'
            toast.success(`Month ${actionText}`, {
              description: `${month.name} has been ${actionText}.`,
            })
          },
          onError: (err) => {
            const errorMsg =
              err instanceof Error ? err.message : `Failed to ${action} month`
            setGlobalError(errorMsg)
            toast.error(errorMsg)
          },
        },
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to toggle month lock'
      setGlobalError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <div className="space-y-6">
      {globalError && (
        <ErrorAlert
          error={globalError}
          onDismiss={() => setGlobalError(null)}
        />
      )}

      <FiscalYearTable
        fiscalYears={fiscalYears?.data || []}
        fiscalMonths={fiscalMonths?.data || []}
        expandedYearId={expandState.expandedYearId}
        loadingYearIds={expandState.loadingYearIds}
        loadedYearIds={expandState.loadedYearIds}
        currentPage={currentPage}
        onPageChange={(newPage) => onPageChange?.(newPage)}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          onPageSizeChange?.(size)
        }}
        onCreateInitiate={() => createState.setDialogOpen(true)}
        headerAction={
          <CreateFiscalYearDialog
            open={createState.isDialogOpen}
            onOpenChange={createState.setDialogOpen}
            onCreate={handleCreateFiscalYear}
            existingYears={fiscalYears?.data || []}
          />
        }
        onStatusChange={handleStatusChangeInitiate}
        onExpandClick={handleExpandYearClick}
        onMonthLockToggle={handleMonthLockToggle}
        onEdit={handleEditInitiate}
        onDelete={handleDeleteInitiate}
      />

      <EditFiscalYearDialog
        open={editState.isDialogOpen}
        onOpenChange={editState.setDialogOpen}
        fiscalYear={editState.editingFiscalYear}
        onUpdate={handleEditConfirm}
        isLoading={editState.isLoading}
        existingYears={fiscalYears?.data || []}
      />

      <StatusChangeConfirmDialog
        open={statusState.isConfirmOpen}
        onOpenChange={(open) => (!open ? statusState.cancel() : null)}
        pendingChange={statusState.pendingChange}
        warning={
          statusState.pendingChange
            ? getStatusTransitionWarning(
                statusState.pendingChange.fiscalYear,
                statusState.pendingChange.newStatus,
              )
            : ''
        }
        onConfirm={handleStatusChangeConfirm}
      />

      {deleteState.deletingFiscalYear && (
        <AlertDialog
          open={deleteState.isConfirmOpen}
          onOpenChange={deleteState.setConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Fiscal Year</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete fiscal year{' '}
                {deleteState.deletingFiscalYear.year}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteState.isLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteState.isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteState.isLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
