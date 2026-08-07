/**
 * Budget Ceiling Status Component
 * 
 * Displays APR budget vs APP ceiling with visual feedback
 * Shows validation status, remaining budget, utilization %
 */

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getBudgetStatusColor,
} from '../utils/validateBudgetCeiling'
import type { BudgetCeilingValidationResult } from '../utils/validateBudgetCeiling'

interface BudgetCeilingStatusProps {
  validation: BudgetCeilingValidationResult
  compact?: boolean
  showRecommendation?: boolean
}

export function BudgetCeilingStatus({
  validation,
  compact = false,
  showRecommendation = true,
}: BudgetCeilingStatusProps) {
  const statusColor = getBudgetStatusColor(validation.status)
  const hasValidAppBudget =
    typeof validation.appBudget === 'number' &&
    Number.isFinite(validation.appBudget) &&
    validation.appBudget > 0
  const utilizationPercent = hasValidAppBudget
    ? (validation.aprBudget / validation.appBudget) * 100
    : 0
  const remainingBudget = hasValidAppBudget
    ? validation.appBudget - validation.aprBudget
    : 0

  // Status icon mapping
  const iconMap = {
    WITHIN_BUDGET: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    AT_THRESHOLD: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    EXCEEDS_BUDGET: <AlertCircle className="h-5 w-5 text-red-600" />,
    NOT_CALCULATED: <Info className="h-5 w-5 text-gray-600" />,
  }

  const alertVariantMap = {
    WITHIN_BUDGET: 'default' as const,
    AT_THRESHOLD: 'default' as const,
    EXCEEDS_BUDGET: 'destructive' as const,
    NOT_CALCULATED: 'default' as const,
  }

  if (compact) {
    return (
      <Alert color={validation.status === 'EXCEEDS_BUDGET' ? 'destructive' : 'default'}>
        <div className="flex items-center gap-2">
          {iconMap[validation.status]}
          <div>
            <AlertTitle className="text-sm">
              {validation.status === 'WITHIN_BUDGET' && 'Budget: Within Ceiling'}
              {validation.status === 'AT_THRESHOLD' && 'Budget: At Threshold'}
              {validation.status === 'EXCEEDS_BUDGET' && 'Budget: Exceeds Ceiling'}
              {validation.status === 'NOT_CALCULATED' && 'Budget: Not Calculated'}
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {validation.message}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {iconMap[validation.status]}
            Budget Ceiling Validation
          </CardTitle>
          <Badge color={statusColor.color} variant={statusColor.variant}>
            {validation.status === 'WITHIN_BUDGET' && '✅ Valid'}
            {validation.status === 'AT_THRESHOLD' && '⚠️ Warning'}
            {validation.status === 'EXCEEDS_BUDGET' && '❌ Exceeds'}
            {validation.status === 'NOT_CALCULATED' && '❓ Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Alert */}
        <Alert color={alertVariantMap[validation.status]}>
          <AlertTitle>{validation.message}</AlertTitle>
          {validation.recommendation && showRecommendation && (
            <AlertDescription className="mt-2 text-sm">
              💡 {validation.recommendation}
            </AlertDescription>
          )}
        </Alert>

        {/* Budget Details Grid */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">APP Approved Budget</p>
            <p className="font-semibold">₱{validation.appBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">APR Total Budget</p>
            <p className={`font-semibold ${
              validation.aprBudget > validation.appBudget ? 'text-red-600' : 'text-green-600'
            }`}>
              ₱{validation.aprBudget.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining Budget</p>
            <p className={`font-semibold ${
              remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₱{remainingBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Budget Utilization Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className={`font-semibold ${
              utilizationPercent > 100 ? 'text-red-600' : 'text-green-600'
            }`}>
              {Math.round(utilizationPercent)}%
            </span>
          </div>
          <Progress
            value={Math.min(utilizationPercent, 100)}
            className="h-2"
          />
          {utilizationPercent > 100 && (
            <p className="text-xs text-red-600">
              Over budget by {(utilizationPercent - 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* Variance Details */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Variance</span>
              <span className={`font-semibold ${
                validation.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {validation.budgetVariance > 0 ? '+' : ''}₱{validation.budgetVariance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Variance %</span>
              <span className={`font-semibold ${
                validation.variancePercent > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {validation.variancePercent > 0 ? '+' : ''}{validation.variancePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
