import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyPHP } from '@/utils/formatters'

interface BudgetConstraintTrackerProps {
  budgetCeiling: number
  currentExpenditure: number
  labels?: {
    ceiling?: string
    current?: string
  }
}

export function BudgetConstraintTracker({
  budgetCeiling,
  currentExpenditure,
  labels = {},
}: BudgetConstraintTrackerProps) {
  const { ceiling = 'Budget Ceiling', current = 'Current Expenditure' } = labels

  const remainingBudget = budgetCeiling - currentExpenditure
  const isOverBudget = remainingBudget < 0
  const utilizationPercentage = (currentExpenditure / budgetCeiling) * 100
  const clampedPercentage = Math.min(utilizationPercentage, 100)

  const status =
    utilizationPercentage > 100
      ? 'over'
      : utilizationPercentage > 80
        ? 'warning'
        : 'healthy'

  const statusColor = {
    over: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    healthy: 'bg-green-50 border-green-200',
  }

  const statusIcon = {
    over: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    healthy: <CheckCircle className="h-5 w-5 text-green-600" />,
  }

  const statusText = {
    over: 'Over Budget',
    warning: 'Warning: High Utilization',
    healthy: 'Healthy',
  }

  const statusTextColor = {
    over: 'text-red-800',
    warning: 'text-yellow-800',
    healthy: 'text-green-800',
  }

  return (
    <Card className={`shadow-sm border ${statusColor[status]}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          {statusIcon[status]}
          Financial Constraint Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-3 gap-4">
          {/* Budget Ceiling */}
          <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">{ceiling}</p>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrencyPHP(budgetCeiling)}
            </p>
          </div>

          {/* Current Expenditure */}
          <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">{current}</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrencyPHP(currentExpenditure)}
            </p>
          </div>

          {/* Remaining Budget */}
          <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Remaining</p>
            <p
              className={`text-xl font-bold ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrencyPHP(Math.abs(remainingBudget))}
              {isOverBudget && <span className="text-sm ml-1">(Over)</span>}
            </p>
          </div>
        </div>

        {/* Utilization Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Budget Utilization</p>
            <p className={`text-sm font-bold ${statusTextColor[status]}`}>
              {utilizationPercentage > 0 ? utilizationPercentage.toFixed(1) : 0}%
              {utilizationPercentage > 100 && ` (${(utilizationPercentage - 100).toFixed(1)}% over)`}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${
                status === 'over'
                  ? 'bg-red-600'
                  : status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`p-3 rounded-lg border-l-4 ${
            status === 'over'
              ? 'bg-red-50 border-l-red-600'
              : status === 'warning'
                ? 'bg-yellow-50 border-l-yellow-600'
                : 'bg-green-50 border-l-green-600'
          }`}
        >
          <p className={`text-sm font-semibold ${statusTextColor[status]} flex items-center gap-2`}>
            {statusText[status]}
          </p>
          {isOverBudget && (
            <p className="text-xs text-red-700 mt-1">
              ⚠️ This WFP has exceeded the departmental budget ceiling by {formatCurrencyPHP(Math.abs(remainingBudget))}. 
              Please reduce expenditures or contact your department head.
            </p>
          )}
          {status === 'warning' && !isOverBudget && (
            <p className="text-xs text-yellow-700 mt-1">
              📊 Budget utilization is high. Remaining budget: {formatCurrencyPHP(remainingBudget)}
            </p>
          )}
          {status === 'healthy' && (
            <p className="text-xs text-green-700 mt-1">
              ✓ Expenditures are within the departmental budget ceiling.
              Remaining budget: {formatCurrencyPHP(remainingBudget)}
            </p>
          )}
        </div>

        {/* Budget Impact Indicator */}
        {currentExpenditure > 0 && (
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-gray-100">
            <TrendingDown className="h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Impact:</span> {formatCurrencyPHP(remainingBudget)} 
              {' '}
              {remainingBudget < 0 ? 'OVER' : 'available'} of {formatCurrencyPHP(budgetCeiling)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
