/**
 * RowCompletionIndicator
 * Displays completion status badge and provides tooltip with missing fields
 */

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItemValidationStatus } from '../hooks/useItemValidationStatus'
import {
  getCompletionBadgeColor,
  getCompletionBadgeVariant,
} from '../hooks/useItemValidationStatus'

interface RowCompletionIndicatorProps {
  status: ItemValidationStatus
  showLabel?: boolean
  className?: string
}

export function RowCompletionIndicator({
  status,
  showLabel = true,
  className,
}: RowCompletionIndicatorProps) {
  const color = getCompletionBadgeColor(status.isComplete)
  const variant = getCompletionBadgeVariant()
  const label = status.isComplete
    ? '✓ Complete'
    : `${status.completionPercentage ?? 0}% Complete`

  const content = (
    <Badge
      color={color}
      variant={variant}
      className={cn('gap-1 text-xs font-medium transition-all', className)}
    >
      {status.isComplete ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {showLabel && <span>{label}</span>}
    </Badge>
  )

  // If complete, no tooltip needed
  if (status.isComplete) {
    return content
  }

  // Show tooltip with missing fields
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Missing Fields:</p>
            <ul className="text-xs space-y-0.5">
              {status.missingFields.map((field) => (
                <li key={field} className="flex items-center gap-1">
                  <span className="text-red-400">•</span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
