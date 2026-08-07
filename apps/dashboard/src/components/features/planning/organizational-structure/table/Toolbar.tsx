import React from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { tableSelectedRowsAtom } from '@/components/features/planning/organizational-structure/atoms'

interface ToolbarProps<TData> {
  table: Table<TData>
  showColumnVisibility?: boolean
  onCreateClick?: () => void
  onDeleteClick?: (rows: TData[]) => void
  searchPlaceholder?: string
}

/**
 * Organization Settings Table Toolbar
 * Handles search, column visibility toggle, and bulk actions
 */
export default function Toolbar<TData extends { id: string | number }>({
  table,
  showColumnVisibility = true,
  onCreateClick,
  onDeleteClick,
  searchPlaceholder = 'Search...',
}: ToolbarProps<TData>) {
  const readonly = table.options.meta?.readonly

  // Debounced search hook
  const { value: searchValue, onChange: handleSearchChange } = useDebouncedSearch(
    table,
    'name',
    400,
  )

  // Jotai atoms
  const [_selectedRowIds, setSelectedRowIds] = useAtom(tableSelectedRowsAtom)

  // Get selected row data for deletion
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedData = selectedRows.map((row) => row.original)

  // Sync table selection with Jotai state
  React.useEffect(() => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => (row.original as { id: string | number }).id.toString())
    setSelectedRowIds(selectedIds)
  }, [table.getFilteredSelectedRowModel().rows.length])

  const canDeleteMultiple = selectedData.length > 0 && !readonly

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="relative max-w-xs">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-4 pr-4 text-sm w-full"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Create Button */}
        {onCreateClick && (
          <Button
            onClick={onCreateClick}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}

        {/* Delete Multiple Button */}
        {canDeleteMultiple && onDeleteClick && (
          <Button
            onClick={() => onDeleteClick(selectedData)}
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedData.length})
          </Button>
        )}

        {/* Column Visibility Dropdown */}
        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Columns
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
