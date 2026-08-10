/**
 * BAC Milestones Display Component
 * 
 * Shows procurement milestones (BAC dates) for APR items
 * Displays: Advertisement Date, Submission Date, Notice of Award, Contract Signing Date
 */

import { Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { APRMilestones } from '../types'

interface BACMilestonesDisplayProps {
  milestones?: APRMilestones
  itemCode: string
  compact?: boolean
}

/**
 * Format date string to readable format
 */
function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Check if milestone is in the past
 */
function isPastDate(dateStr?: string): boolean {
  if (!dateStr) return false
  try {
    return new Date(dateStr) < new Date()
  } catch {
    return false
  }
}

export function BACMilestonesDisplay({
  milestones,
  itemCode,
  compact = false,
}: BACMilestonesDisplayProps) {
  if (!milestones) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 py-2">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700 text-xs">
          No BAC milestones defined for {itemCode}
        </AlertDescription>
      </Alert>
    )
  }

  const milestoneList = [
    {
      label: 'Advertisement Date',
      value: milestones.advertisementDate,
      icon: '📢',
    },
    {
      label: 'Submission Date',
      value: milestones.submissionDate,
      icon: '📝',
    },
    {
      label: 'Notice of Award',
      value: milestones.noticeOfAwardDate,
      icon: '✅',
    },
    {
      label: 'Contract Signing',
      value: milestones.contractSigningDate,
      icon: '🤝',
    },
  ]

  if (compact) {
    return (
      <div className="space-y-1">
        {milestoneList
          .filter((m) => m.value)
          .map((m) => (
            <div key={m.label} className="flex items-center gap-2 text-xs">
              <span className="text-lg">{m.icon}</span>
              <span className="text-muted-foreground">{m.label}:</span>
              <span className="font-medium">{formatDate(m.value)}</span>
              {isPastDate(m.value) && (
                <Badge variant="secondary" className="text-xs">
                  Past
                </Badge>
              )}
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-blue-600" />
        <h4 className="font-semibold text-sm text-blue-900">BAC Procurement Milestones</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {milestoneList.map((milestone) => (
          <div key={milestone.label} className="space-y-1">
            <p className="text-xs text-blue-700 font-medium">{milestone.label}</p>
            {milestone.value ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-blue-900">
                  {formatDate(milestone.value)}
                </p>
                {isPastDate(milestone.value) && (
                  <Badge variant="outline" className="text-xs">
                    Past
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Not set</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Inline BAC Milestones Display
 * For compact display in tables or lists
 */
export function BACMilestonesInline({ milestones, compact }: { milestones?: APRMilestones; compact?: boolean }) {
  if (!milestones) return <span className="text-xs text-muted-foreground">No milestones</span>

  const count = [
    milestones.advertisementDate,
    milestones.submissionDate,
    milestones.noticeOfAwardDate,
    milestones.contractSigningDate,
  ].filter(Boolean).length

  return (
    <Badge variant="outline" className="text-xs">
      {count} milestone{count !== 1 ? 's' : ''} set
    </Badge>
  )
}
