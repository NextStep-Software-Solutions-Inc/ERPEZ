'use client'

import { useAtom } from 'jotai'
import { Search, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  filterFiscalYearAtom,
  filterOrganizationAtom,
  searchQueryAtom,
  createSignatoryDialogOpenAtom,
  currentPageAtom,
} from '../atoms/signatoryMatrixAtoms'
import { FiscalYear } from '../../fiscal-year-management/types/types'

interface SignatoryMatrixToolbarProps {
  fiscalYears?: FiscalYear[]
}

export function SignatoryMatrixToolbar({
  fiscalYears = [],
}: SignatoryMatrixToolbarProps) {
  const [filterFiscalYear, setFilterFiscalYear] = useAtom(filterFiscalYearAtom)
  const [filterOrganization, setFilterOrganization] = useAtom(
    filterOrganizationAtom,
  )
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const [, setCreateDialogOpen] = useAtom(createSignatoryDialogOpenAtom)
  const [, setCurrentPage] = useAtom(currentPageAtom)

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleFiscalYearChange = (value: string) => {
    setFilterFiscalYear(value === 'all' ? null : value)
    handleFilterChange()
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    handleFilterChange()
  }

  const handleReset = () => {
    setFilterFiscalYear(null)
    setFilterOrganization(null)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasFilters =
    filterFiscalYear !== null ||
    filterOrganization !== null ||
    searchQuery !== ''

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        {/* Search and Create Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full sm:w-auto relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search departments, approvers..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Signatory
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Fiscal Year Filter */}
          <div className="w-full sm:w-auto">
            <Select
              value={filterFiscalYear || 'all'}
              onValueChange={handleFiscalYearChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fiscal Years</SelectItem>
                {fiscalYears && fiscalYears.length > 0 ? (
                  fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      FY {fy.year}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="2024">FY 2024</SelectItem>
                    <SelectItem value="2025">FY 2025</SelectItem>
                    <SelectItem value="2026">FY 2026</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Indicators */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-gray-600">Active filters:</span>
            {filterFiscalYear && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                FY: {filterFiscalYear}
              </span>
            )}
            {filterOrganization && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                Org: {filterOrganization}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                Search: "{searchQuery}"
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
