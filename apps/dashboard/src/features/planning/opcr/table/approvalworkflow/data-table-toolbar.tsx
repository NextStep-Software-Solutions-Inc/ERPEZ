import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { OPCR } from '../../types'
import DebouncedInput from '@/components/DebouncedInput'

interface DataTableToolbarProps<TData extends OPCR> {
  table: Table<TData>
  onSearch?: (searchValue: string) => void
  onStatusFilter?: (status: string | null) => void
  isLoading?: boolean
}

export function DataTableToolbar<TData extends OPCR>({
  table,
  onSearch,
  onStatusFilter,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const searchValue =
    (table.getColumn('name')?.getFilterValue() as string) ?? ''

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1 max-w-sm">
            <DebouncedInput
              placeholder="Search OPCR name..."
              value={searchValue}
              onChange={(value) => {
                table.getColumn('name')?.setFilterValue(value)
                onSearch?.(String(value))
              }}
              disabled={isLoading}
            />
          </div>

          <Select
            value={
              (table
                .getColumn('commitmentStatus')
                ?.getFilterValue() as string) ?? ''
            }
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('commitmentStatus')?.setFilterValue(undefined)
                onStatusFilter?.(null)
              } else {
                table.getColumn('commitmentStatus')?.setFilterValue(value)
                onStatusFilter?.(value)
              }
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              onSearch?.('')
              onStatusFilter?.(null)
            }}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  )
}
