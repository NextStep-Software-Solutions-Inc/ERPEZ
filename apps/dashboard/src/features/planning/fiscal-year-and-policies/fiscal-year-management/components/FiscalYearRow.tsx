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
      <TableRow className="flex flex-1 justify-between items-center border-b hover:bg-muted/50">
        <TableCell className="flex-1 min-w-0">
          <div className="flex flex-1 gap-4 items-center">
            <div className="min-w-0">
              <div className="font-medium">FY {fiscalYear.year}</div>
              <div className="text-sm text-muted-foreground">
                {fiscalYear.description || '—'}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="shrink-0 w-40">
          <Select
            value={fiscalYear.status}
            onValueChange={(value) =>
              onStatusChange(fiscalYear, value as FiscalYear['status'])
            }
          >
            <SelectTrigger className="w-40">
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
        <TableCell className="shrink-0 w-48 flex items-center gap-2 justify-end">
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
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="flex flex-1 justify-center items-center border-b">
          <TableCell colSpan={3} className="w-full py-4">
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
