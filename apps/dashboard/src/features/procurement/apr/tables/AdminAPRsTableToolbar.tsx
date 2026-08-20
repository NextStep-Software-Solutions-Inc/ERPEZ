/**
 * Admin APRs Table Toolbar with Search and Filters
 * 
 * Provides search, status filter, live fiscal year selector for admin APRs list
 */

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useFiscalYears } from '../handlers/hooks'

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
  const { data: fiscalYearsResponse } = useFiscalYears({})

  const fiscalYears = useMemo(() => {
    if (!fiscalYearsResponse) return []
    if (Array.isArray(fiscalYearsResponse)) return fiscalYearsResponse
    if (Array.isArray((fiscalYearsResponse as any).data)) return (fiscalYearsResponse as any).data
    if (Array.isArray((fiscalYearsResponse as any).items)) return (fiscalYearsResponse as any).items
    return []
  }, [fiscalYearsResponse])

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
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {fiscalYears.map((fy: any) => (
              <SelectItem key={fy.id || fy.year} value={fy.year.toString()}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span>FY {fy.year}</span>
                  {fy.status && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] py-0 h-4 capitalize ${
                        fy.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-gray-50 text-gray-600 border-gray-300'
                      }`}
                    >
                      {fy.status}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
