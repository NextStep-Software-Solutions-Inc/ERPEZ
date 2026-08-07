/**
 * Master KPI Table Toolbar Component
 * Filter bar with search, faceted filters, and reset functionality
 * Modeled after Dashtail's data-table-toolbar pattern
 */

import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MasterKpiAdvancedFilters } from './MasterKpiAdvancedFilters'
import { MasterKpiTableViewOptions } from './MasterKpiTableViewOptions'
import { Table } from '@tanstack/react-table'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KpiLibrarySearchParams } from '@/routes/v2/kpi-library/constants'
import {
  masterKpiFunctionCategoryOptions,
  masterKpiHierarchyOptions,
  masterKpiStatusOptions,
  normalizeStatusFilter,
} from '../utils/masterKpiListFilters'

interface MasterKpiTableToolbarProps {
  table: Table<any>
}

export function MasterKpiTableToolbar({ table }: MasterKpiTableToolbarProps) {
  const search = useSearch({
    from: '/v2/kpi-library/',
  }) as KpiLibrarySearchParams
  const navigate = useNavigate({ from: '/v2/kpi-library' })

  const searchValue = search.search || ''
  const statusFilter = normalizeStatusFilter(search.statusFilter)
  const functionCategoryFilter = search.functionTypeFilter || 'all'
  const hierarchyFilter = search.hierarchyFilter || 'all'

  const handleSearchChange = useCallback(
    (value: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          search: value || undefined,
          page: 1,
        }),
      })
    },
    [navigate],
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          statusFilter: value === 'all' ? undefined : value,
          page: 1,
        }),
      })
    },
    [navigate],
  )

  const handleFunctionCategoryChange = useCallback(
    (value: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          functionTypeFilter: value === 'all' ? undefined : value,
          page: 1,
        }),
      })
    },
    [navigate],
  )

  const handleHierarchyChange = useCallback(
    (value: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          hierarchyFilter: value === 'all' ? undefined : value,
          page: 1,
        }),
      })
    },
    [navigate],
  )

  const handleReset = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: undefined,
        statusFilter: undefined,
        functionTypeFilter: undefined,
        hierarchyFilter: undefined,
        advancedFilters: undefined,
        page: 1,
      }),
    })
    table.resetColumnFilters()
  }, [navigate, table])

  const isFiltered =
    !!search.search ||
    statusFilter !== 'all' ||
    functionCategoryFilter !== 'all' ||
    hierarchyFilter !== 'all' ||
    !!search.advancedFilters ||
    (table.getState().columnFilters?.length ?? 0) > 0

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 px-1">
      <Input
        placeholder="Search by code or name..."
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="h-8 min-w-[200px] max-w-sm border-primary/20 focus-visible:ring-primary/30"
      />

      <Select
        value={functionCategoryFilter}
        onValueChange={handleFunctionCategoryChange}
      >
        <SelectTrigger className="h-8 w-[140px] border-primary/20">
          <SelectValue placeholder="Function" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Functions</SelectItem>
          {masterKpiFunctionCategoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="h-8 w-[130px] border-primary/20">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {masterKpiStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={hierarchyFilter} onValueChange={handleHierarchyChange}>
        <SelectTrigger className="h-8 w-[140px] border-primary/20">
          <SelectValue placeholder="Hierarchy" />
        </SelectTrigger>
        <SelectContent>
          {masterKpiHierarchyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MasterKpiAdvancedFilters table={table} />

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Reset
          <X className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}

      {hasSelectedRows && (
        <div>
          <Button
            variant="soft"
            onClick={() => {
              // Get selected KPI IDs
              const selectedIds = selectedRows.map((row) => row.original.id)
              // Dispatch custom event or call handler
              const event = new CustomEvent('bulk-delete-kpis', {
                detail: { ids: selectedIds },
              })
              window.dispatchEvent(event)
            }}
            className="h-8 px-2 lg:px-3 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-red-500/10 hover:text-red-600 border-red-500/30 text-red-600"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete ({selectedRows.length})
          </Button>
        </div>
      )}

      <div className="ml-auto">
        <MasterKpiTableViewOptions table={table} />
      </div>
    </div>
  )
}
