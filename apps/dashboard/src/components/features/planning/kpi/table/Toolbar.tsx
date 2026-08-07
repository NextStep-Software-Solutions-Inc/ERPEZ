import React from 'react'
import { ChevronDown, Filter, Plus, Trash2 } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useAtom, useSetAtom } from 'jotai'
import { getFunctionTypesRequest } from '../../fiscal-year/handlers/getFunctionTypesRequest'
import {
  openCreateDialogAtom,
  openDeleteDialogAtom,
  tableFunctionTypeFilterAtom,
  tableSelectedRowsAtom,
} from '../atoms'
import type { Table } from '@tanstack/react-table'
import type { KPI } from '../types'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { splitPascalCase } from '@/lib/utils'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'

/** Hook for fetching KPI function types */
const useFunctionTypes = createQueryHookFromTemplate(getFunctionTypesRequest)

interface ToolbarProps<TData> {
  table: Table<TData>
  showColumnVisibility?: boolean
}

/**
 * KPI Table Toolbar Component
 * Renders search, filter, and action buttons for the KPI table
 * Follows Single Responsibility: Only handles toolbar UI and interactions
 */
export default function Toolbar<TData>({
  table,
  showColumnVisibility,
}: ToolbarProps<TData>) {
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Debounced search hook
  const { value: searchValue, onChange: handleSearchChange } = useDebouncedSearch(
    table,
    'name',
    400,
  )

  // Jotai atoms
  const openCreateDialog = useSetAtom(openCreateDialogAtom)
  const [_selectedRowIds, setSelectedRowIds] = useAtom(tableSelectedRowsAtom)
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)
  const [functionTypeFilter, setFunctionTypeFilter] = useAtom(tableFunctionTypeFilterAtom)

  // Fetch function types for filter dropdown
  const { data: functionTypes } = useFunctionTypes({
    pathParams: {},
    queryParams: {},
  })

  // Get selected row IDs for deletion
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => {
    const original = row.original as KPI
    return original.id
  })

  // Sync table selection with Jotai state
  React.useEffect(() => {
    setSelectedRowIds(selectedIds)
  }, [selectedIds.join(','), setSelectedRowIds])

  // Handle function type filter change
  const handleFunctionTypeChange = (value: string) => {
    const filterValue = value === 'all' ? undefined : value
    setFunctionTypeFilter(filterValue)

    // Apply filter to table column
    table.getColumn('functionType')?.setFilterValue(filterValue)
  }

  // Initialize function type filter from atom
  React.useEffect(() => {
    if (functionTypeFilter) {
      table.getColumn('functionType')?.setFilterValue(functionTypeFilter)
    }
  }, [functionTypeFilter, table])

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search KPI..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant={'ghost'}
          onClick={() => {
            table.getColumn('name')?.setFilterValue('')
            handleSearchChange('')
          }}
        >
          Clear
        </Button>
      </div>

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
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
        </div>
        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions.includes('delete') &&
            !readonly && (
              <>
                <PermissionCheck action="delete" actions={actions}>
                  <Button
                    variant="destructive"
                    className="text-white gap-2"
                    onClick={() => {
                      // Open delete dialog for selected KPIs
                      const selectedKPIs = selectedRows.map(row => row.original as KPI)
                      openDeleteDialog(selectedKPIs)
                    }}
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
                  Create KPI
                </Button>
              </PermissionCheck>
            </>
          )}
          {/* KPI Function Filter */}
          <Select
            value={functionTypeFilter ?? 'all'}
            onValueChange={handleFunctionTypeChange}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by KPI Function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Functions</SelectItem>
              {functionTypes?.data &&
                Array.isArray(functionTypes.data) &&
                (functionTypes.data as Array<string>).map((functionType: string) => (
                  <SelectItem key={functionType} value={functionType}>
                    {splitPascalCase(functionType)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dialogs are now managed globally via Jotai atoms */}
    </>
  )
}
