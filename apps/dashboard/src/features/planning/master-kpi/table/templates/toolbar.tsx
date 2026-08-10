import React from 'react'
import { Plus } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MasterKpiTableViewOptions } from '../../components/MasterKpiTableViewOptions'
import { Search } from 'lucide-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeholder?: string
  onCreate?: () => void
  onSearchChange?: (value: string) => void
  searchValue?: string
  isLoading?: boolean
}

export function DataTableToolbar<TData>({
  table,
  placeholder = 'Filter data...',
  onCreate,
  onSearchChange,
  searchValue = '',
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 py-4 px-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10 border-b-none rounded-t-lg">
      <div className="flex flex-1 items-center space-x-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="pl-9 h-10 w-full bg-background border-muted-foreground/20 focus-visible:ring-primary/30 transition-shadow transition-all"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <MasterKpiTableViewOptions table={table} />
        {onCreate && (
          <Button
            size="sm"
            onClick={onCreate}
            className="h-10 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">New Entry</span>
          </Button>
        )}
      </div>
    </div>
  )
}
