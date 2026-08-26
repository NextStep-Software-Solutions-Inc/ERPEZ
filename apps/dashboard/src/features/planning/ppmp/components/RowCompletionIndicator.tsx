/**
 * RowCompletionIndicator
 * Compact icon-only badge showing completion status.
 * States:
 *   ✓ Fully complete       → CheckCircle2 (green)
 *   ✗ Incomplete / Invalid → XCircle (red)
 * Tooltip on hover shows concise breakdown of missing/invalid fields.
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItemValidationStatus } from '../hooks/useItemValidationStatus'

interface RowCompletionIndicatorProps {
  status: ItemValidationStatus
  className?: string
}

export function RowCompletionIndicator({
  status,
  className,
}: RowCompletionIndicatorProps) {
  const icon = status.isComplete ? (
    <CheckCircle2 className={cn('h-4 w-4 text-emerald-500', className)} />
  ) : (
    <XCircle className={cn('h-4 w-4 text-red-500', className)} />
  )

  // Fully complete — no tooltip needed
  if (status.isComplete) {
    return (
      <span className="inline-flex items-center" aria-label="Complete">
        {icon}
      </span>
    )
  }

  const hasDetailsMissing = status.missingFields.length > 0

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center cursor-default"
            aria-label={`${status.completionPercentage}% complete`}
          >
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-55 p-2.5 bg-accent">
          <div className="space-y-1.5">
            {hasDetailsMissing && (
              <div>
                <p className="text-[11px] font-bold text-default-700 uppercase tracking-wide mb-1">
                  Required Fields & Validation
                </p>
                <ul className="space-y-0.5">
                  {status.missingFields.map((field) => (
                    <li
                      key={field}
                      className="flex items-center gap-1.5 text-[11px]"
                    >
                      <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
                      <span className="text-default-600">{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
