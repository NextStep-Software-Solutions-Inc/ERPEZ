import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  subMonths,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { BiddingMasterCalendarConflictBadge } from './BiddingMasterCalendarConflictBadge'
import { BiddingMasterCalendarEventChip } from './BiddingMasterCalendarEventChip'
import { BiddingMasterCalendarOverloadBadge } from './BiddingMasterCalendarOverloadBadge'
import type {
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarEvent,
} from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BiddingMasterCalendarMonthViewProps {
  currentMonth: Date
  dayBuckets: BiddingMasterCalendarDayBucket[]
  onMonthChange: (nextMonth: Date) => void
  onOpenMilestone: (event: BiddingMasterCalendarEvent) => void
  onPreviewMilestone?: (event: BiddingMasterCalendarEvent | null) => void
  selectedEventId?: string | null
  isLoading?: boolean
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getHeatMapClass(eventCount: number) {
  if (eventCount >= 5) {
    return 'bg-rose-50 border-rose-200'
  }

  if (eventCount >= 3) {
    return 'bg-amber-50 border-amber-200'
  }

  if (eventCount >= 1) {
    return 'bg-emerald-50/70 border-emerald-200'
  }

  return 'bg-slate-50/40 border-slate-200'
}

export function BiddingMasterCalendarMonthView({
  currentMonth,
  dayBuckets,
  onMonthChange,
  onOpenMilestone,
  onPreviewMilestone,
  selectedEventId = null,
  isLoading = false,
}: BiddingMasterCalendarMonthViewProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.date, bucket]))
  const days: Date[] = []
  let day = startDate

  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold text-slate-900">
          Monthly Overview — {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
            className="h-8 text-xs font-medium"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px rounded-lg bg-slate-200 border border-slate-200 overflow-hidden text-xs">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="bg-slate-50 py-2 text-center font-medium text-slate-600 border-b border-slate-200"
              >
                {label}
              </div>
            ))}
            {days.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const bucket = bucketMap.get(dateKey)
              const isCurrentMonth = isSameMonth(date, currentMonth)

              const events = bucket?.events ?? []
              const visibleEvents = events.slice(0, 3)
              const hiddenCount = Math.max(events.length - visibleEvents.length, 0)
              const conflictCount = bucket?.hardConflictCount ?? 0
              const isOverloaded = bucket?.isOverloaded ?? false

              return (
                <div
                  key={dateKey}
                  className={[
                    'min-h-40 rounded-none bg-background p-2 transition-colors',
                    isCurrentMonth
                      ? getHeatMapClass(events.length)
                      : 'bg-slate-50/50 text-muted-foreground opacity-60',
                    isOverloaded ? 'ring-1 ring-inset ring-amber-400' : '',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <div>
                      <div className="text-xs font-semibold">
                        {format(date, 'd')}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {conflictCount > 0 ? (
                        <BiddingMasterCalendarConflictBadge
                          count={conflictCount}
                          compact
                        />
                      ) : null}
                      {isOverloaded ? (
                        <BiddingMasterCalendarOverloadBadge
                          count={events.length}
                          compact
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {visibleEvents.map((event) => (
                      <BiddingMasterCalendarEventChip
                        key={event.id}
                        event={event}
                        isSelected={selectedEventId === event.id}
                        onMouseEnter={() => onPreviewMilestone?.(event)}
                        onMouseLeave={() => onPreviewMilestone?.(null)}
                        onClick={() => onOpenMilestone(event)}
                      />
                    ))}

                    {hiddenCount > 0 ? (
                      <div className="rounded border border-dashed border-default-200 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        +{hiddenCount} more
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
