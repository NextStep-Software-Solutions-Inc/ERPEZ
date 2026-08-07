import { useState } from 'react'
import { ChevronDown, Edit2, Trash2 } from 'lucide-react'
import type { BudgetCall } from '@/lib/fiscal-year-and-policies/types'
import { pascalCaseToWords } from '@/utils/formatters'
import { CountdownCell } from './CountdownCell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BudgetCallCardProps {
  budgetCall: BudgetCall
  onEdit: (budgetCall: BudgetCall) => void
  onDelete: (budgetCall: BudgetCall) => void
  showFiscalYear?: boolean
}

export function BudgetCallCard({
  budgetCall,
  onEdit,
  onDelete,
  showFiscalYear = false,
}: BudgetCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if deadline has passed
  const now = new Date()
  const deadline = new Date(budgetCall.submissionDeadline)
  const isExpired = deadline < now
  const status = isExpired ? 'Expired' : 'Active'

  // Format date for display
  const formatDateForDisplay = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format full date/time for expanded view
  const formatFullDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Card
      className="flex flex-col cursor-pointer transition-all hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header - Click to expand */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base truncate">
                {pascalCaseToWords(budgetCall.type)}
              </CardTitle>
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                  isExpired
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Deadline: {formatDateForDisplay(budgetCall.submissionDeadline)}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </CardHeader>

      {/* Card Content - Collapsed view */}
      {!isExpanded && (
        <CardContent className="flex-1 pb-3">
          <div className="mb-4">
            <CountdownCell
              deadline={budgetCall.submissionDeadline}
              compact={true}
            />
          </div>

          {showFiscalYear && (
            <p className="text-xs text-muted-foreground mb-3">
              Fiscal Year ID: {budgetCall.fiscalYearId}
            </p>
          )}
        </CardContent>
      )}

      {/* Card Content - Expanded view */}
      {isExpanded && (
        <CardContent className="flex-1 space-y-3 pb-3 border-t pt-3">
          {/* Full Deadline Info */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Full Deadline
            </p>
            <p className="text-sm">
              {formatFullDateTime(budgetCall.submissionDeadline)}
            </p>
          </div>

          {/* Full Countdown */}
          <div className="pt-2 border-t">
            <CountdownCell
              deadline={budgetCall.submissionDeadline}
              compact={false}
            />
          </div>

          {/* Fiscal Year (if applicable) */}
          {/* {showFiscalYear && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">Fiscal Year</p>
              <p className="text-sm">{budgetCall.fiscalYearId}</p>
            </div>
          )} */}

          {/* Budget Call Details */}
          {/* <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">Call Details</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>ID: {budgetCall.id}</p>
              <p>Created: {formatDateForDisplay(budgetCall.createdAt)}</p>
              {budgetCall.updatedAt && (
                <p>Updated: {formatDateForDisplay(budgetCall.updatedAt)}</p>
              )}
            </div>
          </div> */}
        </CardContent>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end px-6 py-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(budgetCall)
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(budgetCall)
          }}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
