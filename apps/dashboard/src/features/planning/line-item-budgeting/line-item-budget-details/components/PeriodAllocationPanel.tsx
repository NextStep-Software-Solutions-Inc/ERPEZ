import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  generateQuarterlyPeriodDetails,
  generateMonthlyPeriodDetails,
  generateAllocationSummary,
  validatePeriodBudgetSum,
  QuarterlyAllocation,
  MonthlyAllocation,
} from '../utils/periodAllocationHelpers'

interface QuarterInput {
  name: keyof QuarterlyAllocation
  label: string
}

interface MonthInput {
  name: keyof MonthlyAllocation
  label: string
}

const QUARTER_INPUTS: QuarterInput[] = [
  { name: 'q1', label: 'Q1 (Jan - Mar)' },
  { name: 'q2', label: 'Q2 (Apr - Jun)' },
  { name: 'q3', label: 'Q3 (Jul - Sep)' },
  { name: 'q4', label: 'Q4 (Oct - Dec)' },
]

const MONTH_INPUTS: MonthInput[] = [
  { name: 'january', label: 'January' },
  { name: 'february', label: 'February' },
  { name: 'march', label: 'March' },
  { name: 'april', label: 'April' },
  { name: 'may', label: 'May' },
  { name: 'june', label: 'June' },
  { name: 'july', label: 'July' },
  { name: 'august', label: 'August' },
  { name: 'september', label: 'September' },
  { name: 'october', label: 'October' },
  { name: 'november', label: 'November' },
  { name: 'december', label: 'December' },
]

interface PeriodAllocationPanelProps {
  timelineType: 'quarterly' | 'monthly'
  allocation: QuarterlyAllocation | MonthlyAllocation
  onAllocationChange: (
    allocation: QuarterlyAllocation | MonthlyAllocation,
  ) => void
  activityStartDate: Date
  activityEndDate: Date
  maxBudget?: number
  isDisabled?: boolean
}

export default function PeriodAllocationPanel({
  timelineType,
  allocation,
  onAllocationChange,
  activityStartDate,
  activityEndDate,
  maxBudget = Infinity,
  isDisabled = false,
}: PeriodAllocationPanelProps) {
  // Generate period details and summary
  const { summary, validationError } = useMemo(() => {
    try {
      const periods =
        timelineType === 'quarterly'
          ? generateQuarterlyPeriodDetails(
              allocation as QuarterlyAllocation,
              activityStartDate,
            )
          : generateMonthlyPeriodDetails(
              allocation as MonthlyAllocation,
              activityStartDate,
            )

      const budgetValidation = validatePeriodBudgetSum(periods, maxBudget)
      if (!budgetValidation.valid) {
        return { summary: null, validationError: budgetValidation.message }
      }

      const allocationSummary = generateAllocationSummary(periods)
      return { summary: allocationSummary, validationError: null }
    } catch (error) {
      return {
        summary: null,
        validationError:
          error instanceof Error ? error.message : 'Validation error',
      }
    }
  }, [timelineType, allocation, activityStartDate, activityEndDate, maxBudget])

  const handlePeriodChange = (periodName: string, value: string) => {
    const numValue = parseFloat(value) || 0
    const updatedAllocation = {
      ...allocation,
      [periodName]: numValue,
    } as QuarterlyAllocation | MonthlyAllocation
    onAllocationChange(updatedAllocation)
  }

  const inputs = timelineType === 'quarterly' ? QUARTER_INPUTS : MONTH_INPUTS

  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {timelineType === 'quarterly' ? 'Quarterly' : 'Monthly'} Budget
          Allocation
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Allocate your budget across{' '}
          {timelineType === 'quarterly' ? 'quarters' : 'months'}. Non-zero
          values will create separate budget records.
        </p>
      </div>

      {/* Period Inputs Grid */}
      <div
        className={`grid gap-4 ${
          timelineType === 'quarterly' ? 'grid-cols-2' : 'grid-cols-3'
        }`}
      >
        {inputs.map((input) => {
          const allocationValue = (allocation as any)[input.name] || 0
          return (
            <div key={input.name} className="space-y-2">
              <Label
                htmlFor={`period-${input.name}`}
                className="text-sm font-medium"
              >
                {input.label}
              </Label>
              <Input
                id={`period-${input.name}`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={allocationValue}
                onChange={(e) => handlePeriodChange(input.name, e.target.value)}
                disabled={isDisabled}
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{validationError}</p>
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Allocation Summary</h4>
            <span className="text-lg font-semibold text-slate-900">
              ₱
              {summary.totalBudget.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {summary.periods.map((period) => (
              <div
                key={period.period}
                className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm"
              >
                <div className="flex-1">
                  <span className="font-medium text-slate-700">
                    {period.period}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {period.startDate.toLocaleDateString('en-PH')} →{' '}
                    {period.endDate.toLocaleDateString('en-PH')}
                  </span>
                </div>
                <span className="font-medium text-slate-900">
                  ₱
                  {period.budget.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t pt-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {summary.nonZeroPeriodCount}{' '}
              {summary.nonZeroPeriodCount === 1 ? 'period' : 'periods'} will be
              created
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
