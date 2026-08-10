/**
 * SubKPI Table Toolbar Component
 * Renders search, filter, and action buttons for the SubKPI table
 * Follows Single Responsibility: Only handles toolbar UI and interactions
 */
import React from 'react'
import { ArrowLeft, Filter, Plus } from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { openCreateDialogAtom, openDeleteMultipleDialogAtom } from '../atoms'
import type { Table } from '@tanstack/react-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

/** SubKPI status options for filtering */
const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Draft', label: 'Draft' },
]

interface SubKpiToolbarProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>
  /** Current search value from URL */
  subKpiSearch?: string
  /** Current status filter value */
  statusFilter?: string
  /** Callback when status filter changes */
  onStatusFilterChange?: (value: string | undefined) => void
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void
  /** Indicates if the view is for a Delivery Unit */
  isDuView?: boolean
  /** Indicates if the KPI belongs to a Delivery Unit */
  duKpi?: boolean
}

/**
 * SubKpiToolbar Component
 * Provides search, filtering, and navigation controls for the SubKPI table
 */
export default function Toolbar<TData>({
  table,
  subKpiSearch,
  statusFilter,
  onStatusFilterChange,
  onSearchChange, 
  isDuView,
  duKpi,
}: SubKpiToolbarProps<TData>) {
  const navigate = useNavigate()
  const { kpiId } = useParams({ from: isDuView ? '/planning/$deliveryUnitId/opcr/kpi/$kpiId/subkpi/' : duKpi ? '/planning/$deliveryUnitId/opcr/kpi/$kpiId/subkpi/' : '/planning/kpi/$kpiId/subKpi/' }) 
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []
  const openDeleteMultiple = useSetAtom(openDeleteMultipleDialogAtom)

  // Get selected rows count from table state
  const selectedRowsCount = Object.keys(table.getState().rowSelection).length

  /** Handle search input change */
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
  }

  /** Clear search input */
  const handleClearSearch = () => {
    onSearchChange?.('')
  }

  /** Handle status filter change */
  const handleStatusChange = (value: string) => {
    const filterValue = value === 'all' ? undefined : value
    onStatusFilterChange?.(filterValue)
  }

  /** Navigate back to parent KPI */
  const handleBackToKpi = () => {
    navigate({ to: '/planning/kpi/$kpiId', params: { kpiId } })
  }

  // Initialize table filter with search from URL
  React.useEffect(() => {
    table.getColumn('name')?.setFilterValue(subKpiSearch || '')
  }, [subKpiSearch, table])

  return (
    <>
      {/* Back navigation and Search */}
      <div className="flex flex-row space-x-2">
        <Button variant="ghost" onClick={handleBackToKpi}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to KPI
        </Button>
        <Input
          placeholder="Search Sub-KPI..."
          value={subKpiSearch || ''}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="ghost" onClick={handleClearSearch}>
          Clear
        </Button>
      </div>

      {/* Filters and Actions */}
      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {/* Bulk delete for selected rows */}
          {selectedRowsCount > 0 && actions.includes('delete') && !readonly && (
            <PermissionCheck action="delete" actions={actions}>
              <Button
                variant="destructive"
                className="text-white"
                onClick={() => {
                  const selectedRows = table.getFilteredSelectedRowModel().rows
                  const selectedIds = selectedRows.map((row) => (row.original as { id: string }).id)
                  openDeleteMultiple(selectedIds)
                }}
              >
                Delete Selected{' '}
                {table.getFilteredSelectedRowModel().rows.length
                  ? `${table.getFilteredSelectedRowModel().rows.length > 1 ? `${table.getFilteredSelectedRowModel().rows.length} Rows` : `${table.getFilteredSelectedRowModel().rows.length} Row`}`
                  : ''}
              </Button>
            </PermissionCheck>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Create SubKPI Button */}
          {!readonly && (
            <PermissionCheck action="write" actions={actions}>
              <CreateSubKpiButton />
            </PermissionCheck>
          )}

          {/* Status Filter */}
          <Select
            value={statusFilter ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

/**
 * CreateSubKpiButton Component
 * Opens create SubKPI dialog using Jotai atom
 */
function CreateSubKpiButton() {
  const openCreateDialog = useSetAtom(openCreateDialogAtom)

  return (
    <Button
      className="bg-(--button-blue)"
      onClick={() => openCreateDialog()}
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Sub-KPI
    </Button>
  )
}
