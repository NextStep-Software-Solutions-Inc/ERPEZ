import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  canDeleteMultipleAtom,
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  fundSourceSearch?: string
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  fundSourceSearch,
}: ToolbarProps<TData>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/fund/' })
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Jotai atoms
  const openCreateDialog = useSetAtom(openCreateDialogAtom)
  const openDeleteMultipleDialog = useSetAtom(openDeleteMultipleDialogAtom)
  const [_selectedRowIds, setSelectedRowIds] = useAtom(tableSelectedRowsAtom)

  // Get selected row IDs for deletion
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map(
    (row) => (row.original as any).id || (row.original as any).fundSourceId,
  )

  // Sync table selection with Jotai state
  React.useEffect(() => {
    setSelectedRowIds(selectedIds)
  }, [selectedIds.join(','), setSelectedRowIds])

  // Update URL search params when search changes
  const updateFiscalYearSearch = (value: string) => {
    navigate({
      to: '/planning/fund',
      search: { ...search, fundSourceSearch: value || undefined },
      replace: true,
    })
  }
  // Initialize table filter with fundSourceSearch from URL
  React.useEffect(() => {
    table.getColumn('name')?.setFilterValue(fundSourceSearch || '')
  }, [fundSourceSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2 ">
        <Input
          placeholder="Search Fund Source..."
          value={fundSourceSearch || ''}
          onChange={(event) => updateFiscalYearSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant={'ghost'} onClick={() => updateFiscalYearSearch('')}>
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
                  Create Fund Source
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
