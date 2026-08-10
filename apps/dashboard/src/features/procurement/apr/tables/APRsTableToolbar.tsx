/**
 * APRs Table Toolbar with Filters
 * Search, Status filter, Fiscal Year selector
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
import { Plus } from 'lucide-react'
import type { FC } from 'react'

interface APRsTableToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  status: string
  onStatusChange: (status: string) => void
  fiscalYear: number
  onFiscalYearChange: (year: number) => void
  onCreateClick: () => void
}

export const APRsTableToolbar: FC<APRsTableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  fiscalYear,
  onFiscalYearChange,
  onCreateClick,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search APRs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="FOR_APPROVAL">For Approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={fiscalYear.toString()} onValueChange={(v) => onFiscalYearChange(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i
              return (
                <SelectItem key={year} value={year.toString()}>
                  FY {year}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreateClick} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Create APR
      </Button>
    </div>
  )
}
