/**
 * StalePriceIndicator
 * Displays an amber warning icon with tooltip when item price is >180 days old.
 * Non-disruptive: icon only, tooltip on hover shows full age.
 */

import { AlertTriangle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useStalePriceDetection } from '../hooks/useStalePriceDetection'
import { formatDaysAgo } from '../utils/catalogFormatters'

interface StalePriceIndicatorProps {
  lastSurveyDate: string
  className?: string
}

export function StalePriceIndicator({
  lastSurveyDate,
  className,
}: StalePriceIndicatorProps) {
  const { isStale, daysAgo } = useStalePriceDetection(lastSurveyDate)

  if (!isStale) return null

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center', className)}>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 cursor-help" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium text-amber-700">Stale Price</p>
          <p className="text-muted-foreground">
            Last surveyed {formatDaysAgo(daysAgo)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
