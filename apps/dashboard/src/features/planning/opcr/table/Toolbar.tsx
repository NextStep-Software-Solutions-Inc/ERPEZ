import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useAtom, useSetAtom } from 'jotai'
import React from 'react'
import {
  openCreateDialogAtom,
  openDeleteMultipleDialogAtom,
  tableSelectedRowsAtom,
} from '../atoms'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'
import { Input } from '@/components/ui/input'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
}: ToolbarProps<TData>) {
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Debounced search hook
  const { value: searchValue, onChange: handleSearchChange } = useDebouncedSearch(
    table,
    'fiscalYear',
    400,
  )

  // Jotai atoms
  const openCreateDialog = useSetAtom(openCreateDialogAtom)
  const [_selectedRowIds, setSelectedRowIds] = useAtom(tableSelectedRowsAtom)
  const openDeleteMultipleDialog = useSetAtom(openDeleteMultipleDialogAtom)

  // Get selected row IDs for deletion
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => (row.original as any).id)

  // Sync table selection with Jotai state
  React.useEffect(() => {
    setSelectedRowIds(selectedIds)
  }, [selectedIds.join(','), setSelectedRowIds])

  return (
    <>
      <div className="flex flex-row space-x-2 ">
        <Input
          placeholder="Search OPCR..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant={'ghost'}
          onClick={() => {
            handleSearchChange('')
          }}
        >
          Clear
        </Button>
      </div>

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1"></div>
        <div className="flex items-center gap-2">
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown />
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
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions.includes('delete') &&
            !readonly && (
              <>
                <PermissionCheck action="delete" actions={actions}>
                  <Button
                    variant="destructive"
                  className="text-white gap-2"
                    onClick={() => openDeleteMultipleDialog(selectedIds)}
                  >
                  <Trash2 className="w-4 h-4" />
                    Delete Selected{' '}
                    {table.getFilteredSelectedRowModel().rows.length > 1
                      ? `${table.getFilteredSelectedRowModel().rows.length} Rows`
                      : `${table.getFilteredSelectedRowModel().rows.length} Row`}
                  </Button>
                </PermissionCheck>
              </>
            )}
          {!readonly && (
            <>
              <PermissionCheck action="write" actions={actions}>
                <Button
                  variant="default"
                  onClick={() => openCreateDialog()}
                  className="gap-2 bg-(--button-blue)"
                >
                  <Plus className="w-4 h-4" />
                  Create OPCR
                </Button>
              </PermissionCheck>
            </>
          )}
        </div>
      </div>

      {/* Dialogs are now managed globally via Jotai atoms */}
    </>
  )
}
