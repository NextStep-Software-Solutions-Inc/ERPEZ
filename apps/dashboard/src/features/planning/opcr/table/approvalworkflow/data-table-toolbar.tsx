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
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'

interface DataTableToolbarProps<TData extends OPCR> {
  table: Table<TData>
  onSearch?: (searchValue: string) => void
  fiscalYearId?: string
  onFiscalYearChange?: (fyId: string | null) => void
  onResetFilters?: () => void
  isLoading?: boolean
}

export function DataTableToolbar<TData extends OPCR>({
  table,
  onSearch,
  fiscalYearId,
  onFiscalYearChange,
  onResetFilters,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const { fiscalYears } = useFiscalYearQueries()
  const searchValue =
    (table.getColumn('name')?.getFilterValue() as string) ?? ''
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(fiscalYearId) ||
    Boolean(searchValue)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap flex-1 items-center gap-2">
          <div className="flex-1 min-w-[200px] max-w-sm">
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

          {/* Fiscal Year Filter */}
          <Select
            value={fiscalYearId || 'all'}
            onValueChange={(value) => {
              onFiscalYearChange?.(value === 'all' ? null : value)
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fiscal Years</SelectItem>
              {fiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  FY {fy.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              onSearch?.('')
              onFiscalYearChange?.(null)
              onResetFilters?.()
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
