/**
 * AOB List Page Component
 * User/creator dashboard for creating and managing AOBs
 * Features: Create new AOBs, view own AOBs, edit/delete drafts
 *
 * @see documentations/aob-feature-overview.md for complete feature documentation
 */

import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Gavel, Loader2, AlertCircle } from 'lucide-react'
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
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { getAOBListRequest } from '../handlers/getAOBListRequest'
import { deleteAOBRequest } from '../handlers/deleteAOBRequest'
import { createAOBDialogAtom } from '../atoms/createAOBDialogAtom'
import { CreateAOBDialog } from '../dialogs/CreateAOBDialog'
import { AOBListToolbar } from '../tables/AOBListToolbar'
import { createAOBListColumns } from '../tables/AOBListColumns'
import type { AOB } from '../types'

const useAOBList = createQueryHookFromTemplate(getAOBListRequest)
const useDeleteAOB = createMutationHookFromTemplate(deleteAOBRequest)

interface AOBListPageProps {
  onViewDetails?: (aob: AOB) => void
  onEdit?: (aob: AOB) => void
  onDelete?: (aob: AOB) => void 
}

export function AOBListPage({ onViewDetails, onEdit, onDelete }: AOBListPageProps) {
  const [createDialogOpen, setCreateDialogOpen] = useAtom(createAOBDialogAtom)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [aobToDelete, setAobToDelete] = useState<AOB | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync: deleteAOB, isPending: isDeleting } = useDeleteAOB()

  // Fetch AOB list
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useAOBList({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const aobList = useMemo(() => {
    return apiResponse?.data || []
  }, [apiResponse])

  const handleRequestDeleteAOB = (aob: AOB) => {
    if (onDelete) {
      onDelete(aob)
      return
    }
    setAobToDelete(aob)
  }

  const handleConfirmDeleteAOB = async () => {
    if (!aobToDelete) return
    try {
      await deleteAOB({
        pathParams: { id: aobToDelete.id },
      })
      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })
      setAobToDelete(null)
    } catch {
      // Global API interceptor displays the error toast
    }
  }

  // Create columns with user actions
  const columns = useMemo(
    () =>
      createAOBListColumns({
        onView: onViewDetails,
        onEdit: onEdit,
        onDelete: handleRequestDeleteAOB,
      }),
    [onViewDetails, onEdit, onDelete]
  )

  const table = useReactTable({
    data: aobList,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleCreateClick = () => {
    setCreateDialogOpen({ isOpen: true })
  }

  return (
    <>
      <div className="w-full space-y-6 pb-10">
        {/* Header - match Fiscal Year & Policies styling */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-3xl">Abstract of Bids (AOB)</CardTitle>
                <CardDescription className="text-base">
                  Create and manage your Abstract of Bids documents for procurement activities
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                  <Gavel className="h-3.5 w-3.5 mr-1.5" /> Abstract of Bids
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abstract of Bids (AOB)</CardTitle>
          <CardDescription>Create and manage your Abstract of Bids documents for procurement activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toolbar with Create button */}
          <div className="flex items-center justify-between gap-4">
            <AOBListToolbar
              table={table}
              onSearch={(value) => table.getColumn('aobNumber')?.setFilterValue(value)}
              onCreate={handleCreateClick}
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-muted/20 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading Abstract of Bids...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-64 border border-destructive/30 rounded-md bg-destructive/5 gap-3 p-6 text-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                Failed to load Abstract of Bids.
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty state for no AOBs */}
          {!isLoading && !error && aobList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-gray-50 gap-4">
              <p className="text-muted-foreground">No AOBs created yet</p>
              <Button onClick={handleCreateClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First AOB
              </Button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && aobList.length > 0 && (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="bg-gray-50">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Create AOB Dialog */}
      <CreateAOBDialog
        open={createDialogOpen.isOpen}
        onOpenChange={(open) => setCreateDialogOpen({ isOpen: open })}
        onSuccess={(aob) => {
          onViewDetails?.(aob)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!aobToDelete} onOpenChange={(open) => !open && setAobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Abstract of Bids?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete AOB &quot;{aobToDelete?.aobNumber}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDeleteAOB()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
