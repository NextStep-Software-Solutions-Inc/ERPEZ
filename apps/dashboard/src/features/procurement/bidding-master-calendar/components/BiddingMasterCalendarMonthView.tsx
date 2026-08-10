import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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

interface CalendarEvent {
  id: string
  projectId: string
  projectTitle: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  startDate: string
  endDate: string
  venue: string
  status: string
  remarks: string
}

interface BiddingMasterCalendarMonthViewProps {
  currentMonth: Date
  dayBuckets: BiddingMasterCalendarDayBucket[]
  onMonthChange: (nextMonth: Date) => void
  onOpenMilestone: (event: BiddingMasterCalendarEvent) => void
  onPreviewMilestone?: (event: BiddingMasterCalendarEvent | null) => void
  selectedEventId?: string | null
  apiEvents: CalendarEvent[]
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

  return 'bg-background border-default-200'
}

export function BiddingMasterCalendarMonthView({
  currentMonth,
  dayBuckets,
  onMonthChange,
  onOpenMilestone,
  onPreviewMilestone,
  selectedEventId = null,
  apiEvents,
  isLoading = false,
}: BiddingMasterCalendarMonthViewProps) {

  const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.date, bucket]))
  const monthStart = startOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(endOfMonth(currentMonth))
  const days: Date[] = []

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push(cursor)
  }


  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            {format(currentMonth, 'MMMM yyyy')}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cross-project bidding milestones, conflicts, and APP reference cues.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="icon"
            onClick={() => onMonthChange(subMonths(monthStart, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="icon"
            onClick={() => onMonthChange(addMonths(monthStart, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="rounded-md bg-default-50 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
          {days.map((date) => {
            const key = format(date, 'yyyy-MM-dd')
            const bucket = bucketMap.get(key)
            const isCurrentMonth = isSameMonth(date, currentMonth)

            const events = Array.isArray(apiEvents) ? apiEvents : []
            const dayEvents = events.filter((evt) => {
              const start = new Date(evt.startDate)
              const end = new Date(evt.endDate)
              const checkDate = new Date(date)
              checkDate.setHours(0, 0, 0, 0)

              const startDay = new Date(start)
              startDay.setHours(0, 0, 0, 0)

              const endDay = new Date(end)
              endDay.setHours(0, 0, 0, 0)

              return checkDate >= startDay && checkDate <= endDay
            })

            const mappedApiEvents: BiddingMasterCalendarEvent[] = dayEvents.map((evt) => ({
              id: evt.id,
              bacResolutionId: evt.projectId,
              bacResolutionNumber: evt.status || 'Pending',
              scheduleId: evt.projectId,
              scheduleStatus: 'confirmed',
              fiscalYear: '2026',
              procurementCategory: 'goods',
              projectNames: [evt.projectTitle],
              primaryProjectName: evt.projectTitle,
              officeLabel: evt.venue || 'N/A',
              linkedCprCount: 0,
              milestoneId: evt.procurementActivityTypeId,
              milestoneKey: evt.procurementActivityTypeId,
              milestoneName: evt.procurementActivityTypeName,
              milestoneOrder: 0,
              eventDate: evt.startDate,
              eventTime: format(new Date(evt.startDate), 'HH:mm'),
              isEdited: false,
              executionStatus: 'pending',
              sourceType: 'confirmed',
              derivedProjectStatus: 'in-progress',
              appTargetMonth: null,
              isDueSoon: false,
              isOverdue: false,
              isProvisional: false,
            }))

            const combinedEvents = mappedApiEvents
            const visibleEvents = combinedEvents.slice(0, 3)
            const hiddenCount = Math.max(combinedEvents.length - visibleEvents.length, 0)

            // Compute conflict and overload badges based on real events
            const realConflictCount = combinedEvents.length > 1 ? combinedEvents.length : 0
            const realIsOverloaded = combinedEvents.length >= 3

            return (
              <div
                key={key}
                className={[
                  'min-h-40 rounded-xl border p-3 shadow-sm',
                  isCurrentMonth
                    ? getHeatMapClass(combinedEvents.length)
                    : 'border-default-100 bg-default-50/70 text-muted-foreground',
                  realIsOverloaded ? 'ring-1 ring-warning/40' : '',
                ].join(' ')}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">
                      {format(date, 'd')}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {format(date, 'MMM')}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {realConflictCount ? (
                      <BiddingMasterCalendarConflictBadge
                        count={realConflictCount}
                        compact
                      />
                    ) : null}
                    {realIsOverloaded ? (
                      <BiddingMasterCalendarOverloadBadge
                        count={combinedEvents.length}
                        compact
                      />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
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
                    <div className="rounded-md border border-dashed border-default-200 px-2 py-1 text-[11px] text-muted-foreground">
                      +{hiddenCount} more events
                    </div>
                  ) : null}

                  {!combinedEvents.length ? (
                    <div className="pt-6 text-[11px] text-muted-foreground">
                      No milestones scheduled.
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
