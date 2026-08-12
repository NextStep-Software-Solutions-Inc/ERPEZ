import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { createDialogAtom } from '../../wfp-objective/atoms'
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

interface ToolbarProps<TData = unknown> {
  table: Table<TData>
  showColumnVisibility?: boolean
  wfpObjectiveSearch?: string
  navigate?: ReturnType<typeof useNavigate>
  search?: unknown
  remainingWeight?: number
}

export default function Toolbar<TData = unknown>({
  table,
  remainingWeight,
  showColumnVisibility,
  wfpObjectiveSearch,
  navigate: providedNavigate,
  search: providedSearch,
}: ToolbarProps<TData>) {
  const navigate = providedNavigate || useNavigate()
  const isTabMode = !!providedSearch
  const setCreateDialog = useSetAtom(createDialogAtom)

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []
  
  // Used to force UI refresh when column visibility changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const [localSearch, setLocalSearch] = React.useState('')

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

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

  const currentSearch = isTabMode ? wfpObjectiveSearch : localSearch

  // Apply search filter to the 'projectTitle' column
  React.useEffect(() => {
    table.getColumn('projectTitle')?.setFilterValue(currentSearch || '')
  }, [currentSearch, table])

  const totalRowsCount = table.getPreFilteredRowModel().rows.length
  const showSearch = totalRowsCount > 5

  return (
    <>
      {showSearch && (
        <div className="flex flex-row space-x-2">
          <Input
            placeholder="Search Objective ..."
            value={currentSearch || ''}
            onChange={(event) => updateWFPSearch(event.target.value)}
            className="max-w-sm"
          />
          <Button variant="ghost" onClick={() => updateWFPSearch('')}>
            Clear
          </Button>
        </div>
      )}

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {showColumnVisibility && showSearch && (
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

        <div className="flex items-center gap-2 ml-auto">
          {selectedRowsCount > 0 && actions.includes('delete') && !readonly && (
            <PermissionCheck action="delete" actions={actions}>
              <Button
                color="destructive"
                className="text-white"
                onClick={() => {
                  alert(`Delete ${selectedRowsCount} selected rows`)
                }}
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
                disabled={remainingWeight !== undefined && remainingWeight <= 0}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Objective
              </Button>
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}