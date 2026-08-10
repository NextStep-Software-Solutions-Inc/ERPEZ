/**
 * Master KPI Filters Bar Component
 * Consolidates search, function category, and KPI type filters in one responsive container
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Archive, ArchiveRestore } from 'lucide-react'
import { FunctionCategory } from '../types'
import { Switch } from '@/components/ui/switch'

export interface MasterKpiFiltersProps {
  searchFilter: string
  onSearchChange: (value: string) => void
  functionCategoryFilter: string
  onFunctionCategoryChange: (value: string) => void
  hierarchyFilter: 'all' | 'parent' | 'sub'
  onHierarchyFilterChange: (value: 'all' | 'parent' | 'sub') => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
  onClearFilters: () => void
  isFiltered: boolean
}

export function MasterKpiFilters({
  searchFilter,
  onSearchChange,
  functionCategoryFilter,
  onFunctionCategoryChange,
  hierarchyFilter,
  onHierarchyFilterChange,
  showArchived,
  onShowArchivedChange,
  onClearFilters,
  isFiltered,
}: MasterKpiFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Main Filters Row - Responsive */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        {/* Search Filter */}
        {/* <div className="flex-1 min-w-[250px] space-y-2"> */}
        <div className=" min-w-sm space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by code or name..."
              value={searchFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              variant="bordered"
            />
          </div>
        </div>

        {/* Function Category Filter */}
        <div className=" min-w-xs space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Function Category
          </Label>
          <Select
            value={functionCategoryFilter || 'all'}
            onValueChange={onFunctionCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.values(FunctionCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Indicator Type Dropdown */}
        <div className="min-w-xs space-y-2">
          <Label htmlFor="kpi-type" className="text-sm font-medium">
            Indicator Type
          </Label>
          <Select
            value={hierarchyFilter}
            onValueChange={onHierarchyFilterChange}
          >
            <SelectTrigger id="kpi-type">
              <SelectValue placeholder="Select indicator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Indicators</SelectItem>
              <SelectItem value="parent">Parent Indicator Only</SelectItem>
              <SelectItem value="sub">Sub-Indicator Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Archive Toggle */}
        <div className="flex items-center gap-2 mb-1 px-3 py-2 border rounded-md">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={onShowArchivedChange}
          />
          <Label
            htmlFor="show-archived"
            className="cursor-pointer text-sm font-normal"
          >
            Show Archived
          </Label>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          disabled={!isFiltered && !showArchived}
          className="flex gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
