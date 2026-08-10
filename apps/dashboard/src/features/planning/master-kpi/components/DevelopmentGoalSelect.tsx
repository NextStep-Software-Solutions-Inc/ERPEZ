/**
 * Development Goal Multi-Select Component
 * Allows selection of multiple SDGs for a KPI
 * Displays as checkboxes in a card container with scrolling
 *
 * @reference See documentations/master-kpi-tagging-system.md for usage patterns
 */

import type { KpiSdgOption } from '../types'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DevelopmentGoalSelectProps {
  value: string[]
  onChange: (goals: string[]) => void
  options: KpiSdgOption[]
  disabled?: boolean
  label?: string
}

export function DevelopmentGoalSelect({
  value,
  onChange,
  options,
  disabled = false,
  label,
}: DevelopmentGoalSelectProps) {
  const handleToggleGoal = (goalId: string, checked: boolean) => {
    const newGoals = checked
      ? [...value, goalId]
      : value.filter((goal) => goal !== goalId)
    onChange(newGoals)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        {value.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {value.length} selected
          </Badge>
        )}
      </div>

      <Card className="p-4">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {options.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-2">
              <Checkbox
                id={`development-goal-${goal.id}`}
                checked={value.includes(goal.id)}
                onCheckedChange={(checked) =>
                  handleToggleGoal(goal.id, checked as boolean)
                }
                disabled={disabled}
                className="cursor-pointer"
              />
              <label
                htmlFor={`development-goal-${goal.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {goal.name}
              </label>
              <Badge variant="outline" className="text-xs">
                SDG
              </Badge>
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No SDG options available.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
