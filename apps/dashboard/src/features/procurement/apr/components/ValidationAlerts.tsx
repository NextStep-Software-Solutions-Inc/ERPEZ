/**
 * Validation Alerts Component
 * 
 * Displays SPMS compliance validation and budget ceiling validation alerts
 * Extracted from SelectAPPForm to keep form <200 lines
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import type { UseAPPApprovalValidationResult } from '../hooks/useAPPApprovalValidation'
import type { BudgetCeilingValidationResult } from '../utils/validateBudgetCeiling'

interface ValidationAlertsProps {
  validation: UseAPPApprovalValidationResult
  budgetValidation: BudgetCeilingValidationResult | null
}

export function ValidationAlerts({
  validation,
  budgetValidation,
}: ValidationAlertsProps) {
  return (
    <>
      {/* Blocking Errors */}
      {validation.blockingErrors.length > 0 && (
        <Alert color="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Proceed</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              {validation.blockingErrors.map((err: any, idx: number) => (
                <li key={idx}>• {err.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warningErrors.length > 0 && (
        <Alert color="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              {validation.warningErrors.map((err: any, idx: number) => (
                <li key={idx}>• {err.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Ceiling Blocker */}
      {budgetValidation && budgetValidation.isBlocker && (
        <Alert color="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Budget Exceeds Ceiling</AlertTitle>
          <AlertDescription>{budgetValidation.message}</AlertDescription>
        </Alert>
      )}

      {/* Budget Threshold Warning */}
      {budgetValidation && !budgetValidation.isBlocker && budgetValidation.status === 'AT_THRESHOLD' && (
        <Alert color="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Budget Threshold Warning</AlertTitle>
          <AlertDescription>{budgetValidation.message}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
