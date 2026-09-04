import { useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FiscalMonth } from '@/lib/fiscal-year-and-policies/types'
import { MonthLockingGrid } from './MonthLockingGrid'
import { MonthLoadingSkeleton } from './MonthLoadingSkeleton'
import { isActiveStatusDisabled, formatStatusText } from '../utils/validation'
import { FiscalYear } from '../types/types'

interface FiscalYearRowProps {
  fiscalYear: FiscalYear
  isExpanded: boolean
  isLoading: boolean
  isLoaded: boolean
  months: FiscalMonth[]
  allFiscalYears: FiscalYear[]
  onStatusChange: (
    fiscalYear: FiscalYear,
    newStatus: FiscalYear['status'],
  ) => void
  onExpandClick: (yearId: string) => void
  onMonthLockToggle: (monthId: string) => void
  rowActions?: React.ReactNode
}

/**
 * Table row component for displaying a single fiscal year with expandable months
 */
export function FiscalYearRow({
  fiscalYear,
  isExpanded,
  isLoading,
  isLoaded,
  months,
  allFiscalYears,
  onStatusChange,
  onExpandClick,
  onMonthLockToggle,
  rowActions,
}: FiscalYearRowProps) {
  useEffect(() => {
    if (isExpanded && !isLoaded && !isLoading) {
      // Simulate loading delay
      const timer = setTimeout(() => {
        onExpandClick(fiscalYear.id)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [isExpanded, isLoaded, isLoading])

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div>
            <div className="font-medium">FY {fiscalYear.year}</div>
            <div className="text-sm text-muted-foreground">
              {fiscalYear.description || '—'}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Select
            value={fiscalYear.status}
            onValueChange={(value) =>
              onStatusChange(fiscalYear, value as FiscalYear['status'])
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setup">Setup</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem
                value="active"
                disabled={isActiveStatusDisabled(fiscalYear, allFiscalYears)}
              >
                Active{' '}
                {isActiveStatusDisabled(fiscalYear, allFiscalYears) &&
                  '(One Active Only)'}
              </SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExpandClick(fiscalYear.id)}
              className="h-8 px-3"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Months
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Manage Months
                </>
              )}
            </Button>
            {rowActions}
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="p-4 bg-muted/20">
            {isLoading ? (
              <MonthLoadingSkeleton />
            ) : isLoaded ? (
              <MonthLockingGrid
                months={months}
                fiscalYearStatus={
                  formatStatusText(fiscalYear.status) as
                    | 'Setup'
                    | 'Planning'
                    | 'Active'
                    | 'Closed'
                }
                onMonthLockToggle={onMonthLockToggle}
              />
            ) : null}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
