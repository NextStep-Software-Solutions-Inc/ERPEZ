import React, { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createDialogAtom } from '../atoms'
import { deleteWFPObjectiveTargetExpenditureRequest } from '../handlers/deleteWFPObjectiveTargetExpenditureRequest'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteExpenditure = createMutationHookFromTemplate(deleteWFPObjectiveTargetExpenditureRequest)

interface ToolbarProps<TData = unknown> {
  table: Table<TData>
  showColumnVisibility?: boolean
  wfpSearch?: string
  navigate?: ReturnType<typeof useNavigate>
  search?: string | undefined
}

export default function Toolbar<TData = unknown>({
  table,
  showColumnVisibility,
  wfpSearch,
  navigate: providedNavigate,
  search: providedSearch,
}: ToolbarProps<TData>) {
  const navigate = providedNavigate || useNavigate()
  const isTabMode = !!providedSearch
  const setCreateDialog = useSetAtom(createDialogAtom)
  const { mutateAsync: deleteExpenditure } = useDeleteExpenditure()
  const queryClient = useQueryClient()

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []
  
  // Used to force UI refresh when column visibility changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const [localSearch, setLocalSearch] = React.useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedRowsCount = selectedRows.length

  const updateWFPSearch = (value: string) => {
    if (isTabMode) {
      navigate({
        to: '.',
        search: { wfpSearch: value || undefined },
        replace: true,
      })
    } else {
      setLocalSearch(value)
    }
  }

  const currentSearch = isTabMode ? wfpSearch : localSearch

  // Apply search filter to the 'projectTitle' column
  React.useEffect(() => {
    table.getColumn('projectTitle')?.setFilterValue(currentSearch || '')
  }, [currentSearch, table])

  const handleBulkDelete = async () => {
    if (!selectedRows.length) return

    setIsDeleting(true)
    try {
      await Promise.all(
        selectedRows.map((row: any) =>
          deleteExpenditure({ pathParams: { id: row.original.id } })
        )
      )

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) =>
              typeof key === 'string' &&
              (key.includes('/wfp-objective-activity-expenditures') ||
                key.includes('/wfp-objective-activities') ||
                key.includes('/wfps'))
          ),
      })

      toast.success(`${selectedRowsCount} Expenditure item(s) deleted successfully!`)
      table.resetRowSelection()
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error('❌ [Bulk Delete Error]:', error)
      toast.error('Failed to delete selected Expenditure item(s).')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search WFP (Project Title)..."
          value={currentSearch || ''}
          onChange={(event) => updateWFPSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="ghost" onClick={() => updateWFPSearch('')}>
          Clear
        </Button>
      </div>

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value)
                        forceUpdate()
                      }}
                      // Prevent dropdown from closing when toggling
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRowsCount > 0 && actions.includes('delete') && !readonly && (
            <PermissionCheck action="delete" actions={actions}>
              <Button
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                Delete Selected {selectedRowsCount} {selectedRowsCount > 1 ? 'Rows' : 'Row'}
              </Button>
            </PermissionCheck>
          )}

          {!readonly && (
            <PermissionCheck action="write" actions={actions}>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs h-8 px-3"
                onClick={() =>
                  setCreateDialog({ isOpen: true, showUnsavedWarning: false })
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Expenditure
              </Button>
            </PermissionCheck>
          )}
        </div>
      </div>

      <ConfirmAlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        loading={isDeleting}
        title={`Delete ${selectedRowsCount} selected Expenditure item(s)?`}
        description="This action cannot be undone. Selected Expenditure item(s) will be permanently deleted from the database."
      />
    </>
  )
}