/**
 * Compliance Tag Multi-Select Component
 * Allows selection of multiple attributes for a KPI
 * Displays as checkboxes in a card container with scrolling
 *
 * @reference See documentations/master-kpi-tagging-system.md for usage patterns
 */

import type { KpiAttributeOption } from '../types'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ComplianceTagSelectProps {
  value: string[]
  onChange: (tags: string[]) => void
  options: KpiAttributeOption[]
  disabled?: boolean
  label?: string
}

export function ComplianceTagSelect({
  value,
  onChange,
  options,
  disabled = false,
  label,
}: ComplianceTagSelectProps) {
  const handleToggleTag = (tagId: string, checked: boolean) => {
    const newTags = checked
      ? [...value, tagId]
      : value.filter((tag) => tag !== tagId)
    onChange(newTags)
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
          {options.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`compliance-tag-${tag.id}`}
                checked={value.includes(tag.id)}
                onCheckedChange={(checked) =>
                  handleToggleTag(tag.id, checked as boolean)
                }
                disabled={disabled}
                className="cursor-pointer"
              />
              <label
                htmlFor={`compliance-tag-${tag.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {tag.code} - {tag.name}
              </label>
              <Badge variant="outline" className="text-xs">
                {tag.code}
              </Badge>
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No attribute options available.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
