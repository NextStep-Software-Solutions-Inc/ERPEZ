import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { createDialogAtom } from '../atoms'
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
  wfpSearch?: string
  navigate?: ReturnType<typeof useNavigate>
  search?: unknown
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

  // Used to force UI refresh when column visibility changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const [localSearch, setLocalSearch] = React.useState('')

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

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

  // Apply search filter to the 'Project Title' column
  React.useEffect(() => {
    table.getColumn('projectTitle')?.setFilterValue(currentSearch || '')
  }, [currentSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search"
          value={currentSearch || ''}
          onChange={(event) => updateWFPSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grow flex items-center justify-end gap-2">
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

        {!readonly && actions.includes('write') && (
          <PermissionCheck action="write" actions={actions}>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() =>
                setCreateDialog({ isOpen: true, showUnsavedWarning: false })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create WFP
            </Button>
          </PermissionCheck>
        )}
      </div>
    </>
  )
}