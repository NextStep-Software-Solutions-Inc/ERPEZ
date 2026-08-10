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
} from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getDistributionBehaviorLabel } from '../utils/kpiDistributionBehavior.ts'

interface DistributionBehaviorSelectProps {
  value?: TargetDistributionBehavior | null
  onChange: (behavior: TargetDistributionBehavior | null) => void
  disabled?: boolean
  label?: string
  required?: boolean
  showDescription?: boolean
}

export function DistributionBehaviorSelect({
  value,
  onChange,
  disabled = false,
  showDescription = true,
}: DistributionBehaviorSelectProps) {
  return (
    <div className="space-y-2">
      <Select
        value={value || 'none'}
        onValueChange={(v) =>
          onChange(v === 'none' ? null : (v as TargetDistributionBehavior))
        }
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a distribution behavior" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {Object.values(TargetDistributionBehavior).map((behavior) => (
            <SelectItem key={behavior} value={behavior}>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${getDistributionBehaviorColor(behavior)}`}
                >
                  {getDistributionBehaviorLabel(behavior)}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showDescription && value && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-900">
            <strong>What this means:</strong>
          </p>
          <p className="text-xs text-blue-800 mt-1">
            {getDistributionBehaviorDescription(value)}
          </p>
        </div>
      )}
    </div>
  )
}
