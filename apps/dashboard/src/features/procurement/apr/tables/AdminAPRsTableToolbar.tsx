/**
 * Admin APRs Table Toolbar with Search and Filters
 * 
 * Provides search, status filter, fiscal year selector for admin APRs list
 */

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface AdminAPRsTableToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  status: string
  onStatusChange: (status: string) => void
  fiscalYear: string
  onFiscalYearChange: (year: string) => void
}

export function AdminAPRsTableToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  fiscalYear,
  onFiscalYearChange,
}: AdminAPRsTableToolbarProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4 mb-4">
      {/* Search and Clear Button - First Row */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by APR number, office, or submitted by..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters - Second Row */}
      <div className="flex gap-4">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="FOR_APPROVAL">For Approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="PARTIALLY_AVAILABLE">Partially Available</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select value={fiscalYear} onValueChange={onFiscalYearChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {Array.from({ length: 10 }, (_, i) => {
              const year = currentYear - 5 + i
              return (
                <SelectItem key={year} value={year.toString()}>
                  FY {year}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
