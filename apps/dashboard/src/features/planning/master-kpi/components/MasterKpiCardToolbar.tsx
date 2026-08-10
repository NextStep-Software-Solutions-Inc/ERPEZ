/**
 * Master KPI Card Toolbar Component
 * Simple toolbar for card view with search and basic filters
 * Works without TanStack Table dependency
 */

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings2 } from 'lucide-react'
import {
  masterKpiFunctionCategoryOptions,
  masterKpiHierarchyOptions,
  masterKpiStatusOptions,
} from '../utils/masterKpiListFilters'

interface FilterOption {
  value: string
  label: string
}

interface MasterKpiCardToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  functionCategoryFilter: string
  onFunctionCategoryChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  hierarchyFilter: string
  onHierarchyChange: (value: string) => void
  isFiltered: boolean
  onReset: () => void
  gridColumns: 1 | 2 | 3 | 4
  onGridColumnsChange: (columns: 1 | 2 | 3 | 4) => void
  sortBy: 'name' | 'code' | 'category' | 'status' | 'dateAdded'
  onSortByChange: (
    sortBy: 'name' | 'code' | 'category' | 'status' | 'dateAdded',
  ) => void
}

export function MasterKpiCardToolbar({
  searchValue,
  onSearchChange,
  functionCategoryFilter,
  onFunctionCategoryChange,
  statusFilter,
  onStatusChange,
  hierarchyFilter,
  onHierarchyChange,
  isFiltered,
  onReset,
  gridColumns,
  onGridColumnsChange,
  sortBy,
  onSortByChange,
}: MasterKpiCardToolbarProps) {
  const sortOptions: FilterOption[] = [
    { value: 'dateAdded', label: 'Recently Added' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'code', label: 'Code A-Z' },
    { value: 'category', label: 'Category' },
    { value: 'status', label: 'Status' },
  ]

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      {/* Search Input */}
      <Input
        placeholder="Search by code or name..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 min-w-[200px] max-w-sm"
      />

      {/* Function Category Filter */}
      <Select
        value={functionCategoryFilter}
        onValueChange={onFunctionCategoryChange}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Function" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Functions</SelectItem>
          {masterKpiFunctionCategoryOptions.map((option: FilterOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {masterKpiStatusOptions.map((option: FilterOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Hierarchy Filter */}
      <Select value={hierarchyFilter} onValueChange={onHierarchyChange}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Hierarchy" />
        </SelectTrigger>
        <SelectContent>
          {masterKpiHierarchyOptions.map((option: FilterOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Filters Button */}
      {isFiltered && (
        <Button
          variant="outline"
          onClick={onReset}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}

      {/* Card View Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Grid Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {[1, 2, 3, 4].map((cols) => (
            <DropdownMenuCheckboxItem
              key={cols}
              className="capitalize"
              checked={gridColumns === cols}
              onCheckedChange={() => onGridColumnsChange(cols as 1 | 2 | 3 | 4)}
            >
              {cols} Column{cols > 1 ? 's' : ''}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option: FilterOption) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              className="capitalize"
              checked={sortBy === option.value}
              onCheckedChange={() =>
                onSortByChange(
                  option.value as
                    | 'name'
                    | 'code'
                    | 'category'
                    | 'status'
                    | 'dateAdded',
                )
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
