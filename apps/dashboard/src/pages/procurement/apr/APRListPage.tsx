/**
 * APR List Page Component
 * Main page for viewing and managing APRs with live backend API data
 */

import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createAPRDialogOpenAtom,
  aprListFilterAtom,
} from '@/features/procurement/apr/atoms'
import { useAPRs, useDeleteAPRMutation } from '@/features/procurement/apr/handlers/hooks'
import { invalidateAPRQueries } from '@/features/procurement/apr/utils/invalidateAPRQueries'
import { matchesAPRStatus } from '@/features/procurement/apr/utils'
import { getAPRsTableColumns } from '@/features/procurement/apr/tables/APRsTableColumns'
import { APRsTableToolbar } from '@/features/procurement/apr/tables/APRsTableToolbar'
import { CreateAPRDialog, AddAgencyAPPDialog } from '@/features/procurement/apr/dialogs'
import type { APRListItemDto } from '@/features/procurement/apr/types'
import { TemplateTable } from '@/components/TemplateTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react'
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

export function APRListPage() {
  const navigate = useNavigate()
  const [, setCreateAPRDialogOpen] = useAtom(createAPRDialogOpenAtom)
  const [filter, setFilter] = useAtom(aprListFilterAtom)
  const [aprToDelete, setAprToDelete] = useState<APRListItemDto | null>(null)

  // Fetch APRs from real backend database
  const { data: responseData, isLoading, error, refetch } = useAPRs({
    queryParams: {
      PageNumber: 1,
      PageSize: 50,
    },
  } as any)

  const { mutateAsync: deleteAPR, isPending: isDeleting } = useDeleteAPRMutation()

  // Extract items array from PaginatedApiResponse
  const aprList: APRListItemDto[] = useMemo(() => {
    if (!responseData) return []
    if (Array.isArray(responseData)) return responseData
    if (Array.isArray((responseData as any).data)) return (responseData as any).data
    if (Array.isArray((responseData as any).items)) return (responseData as any).items
    return []
  }, [responseData])

  const searchTerm = filter.searchTerm
  const statusFilter = filter.status
  const fiscalYearFilter = filter.fiscalYear

  /**
   * Apply client-side filters to live APR list
   */
  const filteredAprList = useMemo(() => {
    return aprList.filter((apr) => {
      // Search term filter (case-insensitive)
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase()
        const aprNum = (apr.aprNumber || '').toLowerCase()
        const office = (apr.officeName || '').toLowerCase()
        if (!aprNum.includes(lowerSearch) && !office.includes(lowerSearch)) {
          return false
        }
      }

      // Status filter
      if (!matchesAPRStatus(apr.status, statusFilter)) {
        return false
      }

      // Fiscal year filter
      if (fiscalYearFilter && apr.fiscalYear && Number(apr.fiscalYear) !== Number(fiscalYearFilter)) {
        return false
      }

      return true
    })
  }, [aprList, searchTerm, statusFilter, fiscalYearFilter])

  const handleCreateClick = () => {
    setCreateAPRDialogOpen(true)
  }

  const handleViewAPR = useCallback((apr: any) => {
    navigate({
      to: '/v2/agency-purchase-requests-apr/$aprId',
      params: { aprId: apr.id },
    })
  }, [navigate])

  const handleDeleteClick = useCallback((apr: APRListItemDto) => {
    setAprToDelete(apr)
  }, [])

  const queryClient = useQueryClient()

  const handleConfirmDelete = async () => {
    if (!aprToDelete) return
    try {
      await deleteAPR({
        pathParams: { aprId: aprToDelete.id },
      } as any)
      toast.success(`APR ${aprToDelete.aprNumber} deleted successfully`)
      invalidateAPRQueries(queryClient)
      setAprToDelete(null)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete APR'
      toast.error(msg)
    }
  }

  const columns = useMemo(
    () =>
      getAPRsTableColumns({
        onView: handleViewAPR,
        onDelete: handleDeleteClick,
      }),
    [handleViewAPR, handleDeleteClick]
  )

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card */}
      <Card className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 dark:from-primary/20 dark:via-primary/10 dark:to-card dark:border-primary/30 shadow-xs">
        <CardHeader className="border-b-0 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Agency Purchase Requests (APR)
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                Manage all APRs and track procurement requests to PS-DBM
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold bg-background/80 text-primary border-primary/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/35"
              >
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> APR
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4 bg-card text-card-foreground rounded-xl border border-border p-5 shadow-xs">
        {/* Toolbar */}
        {<APRsTableToolbar
          searchTerm={searchTerm}
          onSearchChange={(term: string) =>
            setFilter((prev) => ({ ...prev, searchTerm: term }))
          }
          status={statusFilter}
          onStatusChange={(status: string) =>
            setFilter((prev) => ({ ...prev, status }))
          }
          fiscalYear={fiscalYearFilter}
          onFiscalYearChange={(year: number) =>
            setFilter((prev) => ({ ...prev, fiscalYear: year }))
          }
          onCreateClick={handleCreateClick}
        /> as any}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-950/30">
            <CardContent className="p-5 flex items-center justify-between gap-2 text-red-800 dark:text-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold">Failed to load APRs</p>
                  <p className="text-sm text-red-700 dark:text-red-300/90">
                    {String((error as any)?.message || 'An error occurred while fetching APRs from server')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-800 dark:text-red-200 text-xs font-semibold rounded-md border border-red-300 dark:border-red-500/40 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-12 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching live APRs from database...</span>
          </div>
        )}

        {/* Live Table */}
        {!isLoading && filteredAprList && filteredAprList.length > 0 && (
          <TemplateTable
            columns={columns as any}
            data={filteredAprList}
            actions={['read', 'write', 'delete', 'submit']}
          />
        )}

        {/* Empty State */}
        {!isLoading && (!filteredAprList || filteredAprList.length === 0) && !error && (
          <div className="text-center py-12 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-foreground font-semibold mb-1">
              {searchTerm.trim() || statusFilter !== 'all'
                ? 'No APRs match your filters'
                : 'No Agency Purchase Requests found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm.trim() || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Create your first APR from an approved Annual Procurement Plan (APP)'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!aprToDelete} onOpenChange={(open) => !open && setAprToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft APR?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{aprToDelete?.aprNumber}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      <CreateAPRDialog />
      <AddAgencyAPPDialog />
    </div>
  )
}

export default APRListPage
