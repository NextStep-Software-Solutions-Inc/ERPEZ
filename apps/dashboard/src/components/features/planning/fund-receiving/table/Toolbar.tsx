import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import React from 'react'
import { useSetAtom } from 'jotai'
import { createDialogAtom, openDeleteMultipleDialogAtom } from '../atoms'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

interface ToolbarProps<TData> {
  table: Table<TData>
  showColumnVisibility?: boolean
  wfpSearch?: string // Updated from fundSourceSearch
}

export default function Toolbar<TData>({
  table,
  showColumnVisibility,
  wfpSearch,
}: ToolbarProps<TData>) {
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  const setCreateDialogState = useSetAtom(createDialogAtom)
  const openDeleteMultipleDialog = useSetAtom(openDeleteMultipleDialogAtom)

  // Filters the table if a search string is provided (e.g., filtering by WFP name/code)
  React.useEffect(() => {
    // Ensure the ID matches the column key in your WFP Column definition
    table.getColumn('name')?.setFilterValue(wfpSearch || '')
  }, [wfpSearch, table])

  const handleOpenCreateDialog = () => {
    setCreateDialogState({
      isOpen: true,
      mode: 'create',
      showUnsavedWarning: false,
    })
  }

  return (
    <>
      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {/* Left side space for search bars if needed later */}
        </div>
        
        <div className="flex items-center gap-2">
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
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id.replace(/([A-Z])/g, ' $1')} 
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Delete Selected Rows logic */}
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions.includes('delete') &&
            !readonly && (
              <PermissionCheck action="delete" actions={actions}>
                <Button
                  variant="destructive"
                  className="text-white gap-2"
                  onClick={() => {
                    const ids = table.getFilteredSelectedRowModel().rows.map(r => (r.original as any).id)
                    openDeleteMultipleDialog(ids)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </PermissionCheck>
            )}

          {/* Create WFP Button */}
          {!readonly && (
            <PermissionCheck action="write" actions={actions}>
              <Button
                variant="default"
                onClick={handleOpenCreateDialog}
                className="gap-2 bg-(--button-blue)"
              >
                <Plus className="w-4 h-4" />
                Create WFP
              </Button>
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}