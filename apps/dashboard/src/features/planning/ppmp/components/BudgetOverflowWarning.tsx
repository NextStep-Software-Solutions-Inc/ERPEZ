/**
 * BudgetOverflowWarning
 * Displayed inside the IoE accordion container header when items exceed the budget limit.
 */

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '../lib/ppmpUtils'

interface BudgetOverflowWarningProps {
  overflow: number
  budgetLimit: number
  totalCost: number
}

export function BudgetOverflowWarning({
  overflow,
  budgetLimit,
  totalCost,
}: BudgetOverflowWarningProps) {
  if (overflow <= 0) return null

  return (
    <Alert variant="destructive" className="py-2 mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-xs">
        <span className="font-semibold">Over budget by {formatCurrency(overflow)}</span>
        {' '}— Total: {formatCurrency(totalCost)} vs. Limit: {formatCurrency(budgetLimit)}.
        {' '}Reduce quantities or remove items before submitting.
      </AlertDescription>
    </Alert>
  )
}
