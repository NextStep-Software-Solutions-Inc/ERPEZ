/**
 * Target Distribution Behavior Single-Select Component
 * Allows selection of how KPI targets should be distributed and aggregated
 * Displays as a dropdown with descriptions for each behavior type
 *
 * @reference See documentations/master-kpi-tagging-system.md for usage patterns
 */

import {
  TargetDistributionBehavior,
  getDistributionBehaviorColor,
  getDistributionBehaviorDescription,
  getDistributionBehaviorRule,
} from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  getDistributionBehaviorLabel,
  SELECTABLE_DISTRIBUTION_BEHAVIORS,
} from '../utils/kpiDistributionBehavior'
import { Info, CheckCircle2 } from 'lucide-react'

interface DistributionBehaviorSelectProps {
  value?: TargetDistributionBehavior | null
  onChange: (behavior: TargetDistributionBehavior | null) => void
  disabled?: boolean
  label?: string
  required?: boolean
  showDescription?: boolean
}

// Short subtitle summaries for each behavior inside the dropdown list
const BEHAVIOR_SUBTITLES: Record<TargetDistributionBehavior, string> = {
  [TargetDistributionBehavior.SUMMATION]:
    'Sum of quarters = annual total (counts, budgets, quantities)',
  [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]:
    'Sum of quarters = annual total (counts, budgets, quantities)',
  [TargetDistributionBehavior.UNIFORM_AVERAGE]:
    'Each quarter = annual target (percentages, rates, standards)',
  [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]:
    'Milestone markers (pass/fail, completion, non-divisible)',
  [TargetDistributionBehavior.MAXIMUM]:
    'Quarterly targets cannot exceed the annual ceiling',
  [TargetDistributionBehavior.MINIMUM]:
    'Quarterly targets must meet or exceed the annual floor',
}

export function DistributionBehaviorSelect({
  value,
  onChange,
  disabled = false,
  showDescription = true,
}: DistributionBehaviorSelectProps) {
  // Normalize legacy 'Divisible' to 'Summation' for consistent UI state
  const normalizedValue =
    value === TargetDistributionBehavior.DIVISIBLE_SUMMATIVE ||
    (value as string) === 'Divisible'
      ? TargetDistributionBehavior.SUMMATION
      : value

  return (
    <div className="space-y-2">
      <Select
        value={normalizedValue || 'none'}
        onValueChange={(v) =>
          onChange(v === 'none' ? null : (v as TargetDistributionBehavior))
        }
        disabled={disabled}
      >
        <SelectTrigger className="h-auto py-2">
          <SelectValue placeholder="Select a distribution behavior" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">None (Unassigned)</span>
          </SelectItem>
          {SELECTABLE_DISTRIBUTION_BEHAVIORS.map((behavior) => (
            <SelectItem key={behavior} value={behavior} className="py-2.5">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 font-medium ${getDistributionBehaviorColor(behavior)}`}
                  >
                    {getDistributionBehaviorLabel(behavior)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  {BEHAVIOR_SUBTITLES[behavior]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showDescription && normalizedValue && (
        <div className="mt-2.5 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-semibold text-xs">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Target Distribution Guidance</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[11px] py-0 px-2 ${getDistributionBehaviorColor(normalizedValue)}`}
            >
              {getDistributionBehaviorLabel(normalizedValue)}
            </Badge>
          </div>

          <p className="text-xs text-blue-900/90 dark:text-blue-300 leading-relaxed">
            {getDistributionBehaviorDescription(normalizedValue)}
          </p>

          <div className="pt-1 border-t border-blue-200/60 dark:border-blue-900/60 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-blue-950 dark:text-blue-200">
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Validation Rule:{' '}
              </span>
              <span>{getDistributionBehaviorRule(normalizedValue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
