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
import { ChevronLeft, ChevronRight, Plus, Gavel } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAOBListRequest } from '../handlers/getAOBListRequest'
import { createAOBDialogAtom } from '../atoms/createAOBDialogAtom'
import { CreateAOBDialog } from '../dialogs/CreateAOBDialog'
import { AOBListToolbar } from '../tables/AOBListToolbar'
import { createAOBListColumns } from '../tables/AOBListColumns'
import type { AOB } from '../types'

const useAOBList = createQueryHookFromTemplate(getAOBListRequest)

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

  // Fetch AOB list with mock data fallback
  const { data: apiResponse } = useAOBList({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const aobList = useMemo(() => {
    return apiResponse?.data || []
  }, [apiResponse])

  // Create columns with user actions
  const columns = useMemo(
    () =>
      createAOBListColumns({
        onView: onViewDetails,
        onEdit: onEdit,
        onDelete: onDelete,
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

          {/* Empty state for no AOBs */}
          {aobList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-gray-50 gap-4">
              <p className="text-muted-foreground">No AOBs created yet</p>
              <Button onClick={handleCreateClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First AOB
              </Button>
            </div>
          )}

          {/* Table */}
          {aobList.length > 0 && (
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
    </>
  )
}
