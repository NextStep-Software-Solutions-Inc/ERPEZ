import { useState } from 'react'
import { Table as TableType } from '@tanstack/react-table'
import { Settings2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import DebouncedInput from '@/components/DebouncedInput'
import PermissionCheck from '@/components/PermissionCheck'
import { CreateProcurementActivityDialog } from '../dialog/CreateProcurementActivityDialog'
import type { ProcurementActivity } from '../../types'
import type { MetaActions } from '@/types/global'

interface ToolbarProps {
  table: TableType<ProcurementActivity>
  actions: MetaActions
  onAddActivity?: (activity: any) => void
  onBulkDelete?: (ids: string[]) => void
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export function Toolbar({ table, actions, onAddActivity, onBulkDelete, searchTerm = '', onSearchChange }: ToolbarProps) {
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const [columnVisibilityUpdate, setColumnVisibilityUpdate] = useState(0)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleBulkDelete = () => {
    const ids = selectedRows.map(row => row.original.id)
    onBulkDelete?.(ids)
    table.resetRowSelection()
  }

  const handleColumnToggle = (columnId: string) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.toggleVisibility()
      setColumnVisibilityUpdate(prev => prev + 1)
    }
  }

  return (
    <div className="flex items-center w-full gap-4 flex-wrap">
      {/* Bulk Actions - Show when rows are selected */}
      {hasSelectedRows && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          <PermissionCheck action="delete" actions={actions}>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </PermissionCheck>
        </div>
      )}

      {/* Search Bar - Left */}
      <div className="max-w-sm">
        <DebouncedInput
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(value: any) => onSearchChange?.(String(value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-2 ml-auto">
        {/* Add Activity Button */}
        <CreateProcurementActivityDialog actions={actions} onCreateSuccess={onAddActivity} />

        {/* Column Visibility Toggle */}
        <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-semibold">Toggle Columns</div>
            <DropdownMenuSeparator />
            {columnVisibilityUpdate >= 0 && table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const isVisible = column.getIsVisible()
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={isVisible}
                    onCheckedChange={() => handleColumnToggle(column.id)}
                    className="capitalize"
                  >
                    {column.columnDef.header ?
                      (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)
                      : column.id
                    }
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}