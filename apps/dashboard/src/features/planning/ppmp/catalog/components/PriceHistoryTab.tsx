/**
 * PriceHistoryTab
 * Displays a 12-month price change timeline using the Timeline UI component.
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
  TimelineOppositeContent,
} from '@/components/ui/timeline'
import { cn } from '@/lib/utils'
import { usePriceHistoryTab } from '../hooks/useDetailPanelTabs'
import { formatPrice, formatDate } from '../utils/catalogFormatters'
import type { PriceHistoryEntry } from '../types'

function PriceTrend({
  current,
  previous,
}: {
  current: number
  previous: number | null
}) {
  if (previous === null) return null
  const diff = current - previous
  if (diff === 0) return <Minus className="h-3 w-3 text-muted-foreground" />
  return diff > 0 ? (
    <TrendingUp className="h-3 w-3 text-rose-500" />
  ) : (
    <TrendingDown className="h-3 w-3 text-emerald-500" />
  )
}

const REASON_LABELS: Record<PriceHistoryEntry['reason'], string> = {
  initial: 'Initial entry',
  survey: 'Price survey',
  adjustment: 'Manual adjustment',
  correction: 'Correction',
}

const REASON_COLORS: Record<
  PriceHistoryEntry['reason'],
  'primary' | 'success' | 'warning' | 'info'
> = {
  initial: 'primary',
  survey: 'info',
  adjustment: 'warning',
  correction: 'success',
}

export function PriceHistoryTab() {
  const { data: entries, isLoading } = usePriceHistoryTab()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-1" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-8">
        No price history available.
      </p>
    )
  }

  // Sort newest first
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
  )

  return (
    <div className="pb-4">
      <Timeline position="right">
        {sorted.map((entry, idx) => {
          const prevEntry = sorted[idx + 1]
          const prevPrice = prevEntry?.price ?? null
          const dotColor = REASON_COLORS[entry.reason]

          return (
            <TimelineItem key={entry.id}>
              <TimelineOppositeContent className="hidden" />
              <TimelineSeparator>
                <TimelineDot color={dotColor} />
                {idx < sorted.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent className="pb-5">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-semibold">
                      {formatPrice(entry.price)}
                    </span>
                    <PriceTrend current={entry.price} previous={prevPrice} />
                    {prevPrice !== null && prevPrice !== entry.price && (
                      <span
                        className={cn(
                          'text-[10px]',
                          entry.price > prevPrice
                            ? 'text-rose-500'
                            : 'text-emerald-500',
                        )}
                      >
                        ({entry.price > prevPrice ? '+' : ''}
                        {formatPrice(entry.price - prevPrice)})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {REASON_LABELS[entry.reason]} ·{' '}
                    {formatDate(entry.effectiveDate)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    by {entry.changedBy}
                  </span>
                </div>
              </TimelineContent>
            </TimelineItem>
          )
        })}
      </Timeline>
    </div>
  )
}
