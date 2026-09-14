import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarRange, Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import { computeRemainingDays, getRemainingDaysBadgeClass } from '../utils/remainingDays'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'
import type { CalendarEvent } from '../../bidding-schedule/types'
import { getBacCalendarEventsRequest } from '../handlers/getBacCalendarEventsRequest'

const useBacCalendarEvents = createQueryHookFromTemplate(getBacCalendarEventsRequest)

function formatRemainingDayLabel(remainingInfo: {
  label: string
  daysRemaining: number | null
  isToday?: boolean
}): string {
  if (
    remainingInfo.isToday ||
    remainingInfo.daysRemaining === 0 ||
    remainingInfo.label === 'Due today' ||
    remainingInfo.label === '0 day' ||
    remainingInfo.label === '0 days' ||
    remainingInfo.label === '0d' ||
    remainingInfo.label === '0d left'
  ) {
    return 'Today'
  }
  return remainingInfo.label
}

interface BiddingScheduleGanttStripProps {
  bacResolutionId?: string | null
  bacResolutionNumber?: string | null
  className?: string
  action?: React.ReactNode
  description?: string
}

export function BiddingScheduleGanttStrip({
  bacResolutionId,
  bacResolutionNumber,
  className,
  action,
  description,
}: BiddingScheduleGanttStripProps) {
  // Fetch activity types for maxDays
  const { data: activityTypesData } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })

  const activityTypeMap = useMemo(() => {
    const map = new Map<string, ProcurementActivityType>()
    for (const item of activityTypesData?.data || []) {
      map.set(item.id, item)
    }
    return map
  }, [activityTypesData])

  // Dedicated query hook for calendar events
  const { data: calendarEventsResponse, isPending: isLoading } =
    useBacCalendarEvents({
      pathParams: {},
      queryParams: {},
      enabled: Boolean(bacResolutionId),
    })

  const events = useMemo<CalendarEvent[]>(() => {
    if (!bacResolutionId || !calendarEventsResponse?.data) return []

    const rawData = calendarEventsResponse.data
    const allEvents: CalendarEvent[] = Array.isArray(rawData.events)
      ? rawData.events
      : []

    // Filter events specifically for this BAC project/resolution
    const filtered = allEvents.filter(
      (e) =>
        e.projectId === bacResolutionId ||
        e.bacResolutionId === bacResolutionId ||
        (bacResolutionNumber && e.projectTitle?.includes(bacResolutionNumber)),
    )

    return filtered.length > 0 ? filtered : allEvents.slice(0, 5) // Graceful fallback if no exact project match
  }, [bacResolutionId, bacResolutionNumber, calendarEventsResponse])

  // DO NOT render if no resolution is selected
  if (!bacResolutionId) {
    return null
  }

  // Calculate timeline boundaries
  const timelineData = useMemo(() => {
    if (events.length === 0) return null

    let minTime = Infinity
    let maxTime = -Infinity

    for (const event of events) {
      const s = new Date(event.startDate).getTime()
      const e = new Date(event.endDate).getTime()
      if (!isNaN(s) && s < minTime) minTime = s
      if (!isNaN(e) && e > maxTime) maxTime = e
    }

    if (minTime === Infinity || maxTime === -Infinity || minTime >= maxTime) {
      return null
    }

    // Add 1 day buffer to each side
    const oneDay = 24 * 60 * 60 * 1000
    const startBound = minTime - oneDay
    const endBound = maxTime + oneDay
    const totalDuration = endBound - startBound

    const items = events.map((event) => {
      const s = new Date(event.startDate).getTime()
      const e = new Date(event.endDate).getTime()
      const leftPercent = Math.max(0, Math.min(95, ((s - startBound) / totalDuration) * 100))
      const widthPercent = Math.max(
        6,
        Math.min(100 - leftPercent, ((e - s) / totalDuration) * 100),
      )

      const actType = activityTypeMap.get(event.procurementActivityTypeId)
      const durationDays = Math.max(1, Math.round((e - s) / oneDay))
      const isCompleted =
        event.status === 'Completed' ||
        event.scheduleStatus === 'locked' ||
        event.executionStatus === 'completed'
      const remainingInfo = computeRemainingDays(event.endDate, {
        isCompleted,
        maxDays: actType?.maxDays,
      })

      return {
        ...event,
        durationDays,
        leftPercent,
        widthPercent,
        remainingInfo,
        actType,
      }
    })

    return {
      startBound: new Date(startBound),
      endBound: new Date(endBound),
      totalDays: Math.ceil(totalDuration / oneDay),
      items,
    }
  }, [events, activityTypeMap])

  return (
    <Card className={cn('border border-default-200 shadow-sm overflow-hidden bg-white dark:bg-card', className)}>
      <CardHeader className="py-3 px-4 bg-muted/20 border-b border-default-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Bidding Activity Timeline & Schedule
            </CardTitle>
            <Badge variant="outline" className="text-[10px] py-0 px-2 font-normal">
              Single Resolution View
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {description ||
              'Manage the legally compliant RA 9184 bidding milestones, computed dates, overrides, and calendar tracking for this resolution.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {timelineData && (
            <div className="text-xs text-muted-foreground bg-white dark:bg-card px-2.5 py-1 rounded-md border border-default-200 shadow-2xs whitespace-nowrap">
              Window Span: <strong className="text-foreground font-semibold">{timelineData.totalDays} calendar days</strong>
            </div>
          )}
          {action}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading timeline interval...
          </div>
        ) : !timelineData || timelineData.items.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/5">
            No bidding schedule milestones have been scheduled for this resolution yet.
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {/* Timeline date axis */}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b border-default-200 pb-1 font-mono">
                <span>
                  Start: {timelineData.startBound.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-center text-muted-foreground font-sans text-[11px]">
                  Activities Timeline Overview
                </span>
                <span>
                  End: {timelineData.endBound.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Gantt Track Rows */}
              <div className="space-y-2.5 pt-1">
                {timelineData.items.map((item, idx) => {
                  const barColor =
                    item.remainingInfo.variant === 'destructive'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : item.remainingInfo.variant === 'warning'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'

                  return (
                    <div key={item.id || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-[240px]">
                          {item.procurementActivityTypeName || item.projectTitle}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                            -{' '}
                            {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.2 rounded-full font-semibold border',
                              getRemainingDaysBadgeClass(item.remainingInfo.variant),
                            )}
                          >
                            {formatRemainingDayLabel(item.remainingInfo)}
                          </span>
                        </div>
                      </div>

                      {/* Relative timeline bar track */}
                      <div className="relative w-full h-4 bg-muted/40 rounded-full overflow-hidden border border-default-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              style={{
                                left: `${item.leftPercent}%`,
                                width: `${item.widthPercent}%`,
                              }}
                              className={cn(
                                'absolute top-0 bottom-0 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs',
                                barColor,
                              )}
                            >
                              <span className="text-[9px] font-bold px-1 truncate select-none">
                                {item.remainingInfo.isToday ||
                                item.remainingInfo.daysRemaining === 0 ||
                                item.durationDays === 0
                                  ? 'Today'
                                  : `${item.durationDays}d`}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            color="secondary"
                            className="p-3 text-xs max-w-xs space-y-2 bg-white dark:bg-card border border-default-200 text-default-900 shadow-xl rounded-lg z-50"
                          >
                            <div className="border-b border-default-100 pb-1.5">
                              <p className="font-bold text-xs text-default-900 leading-snug">
                                {item.procurementActivityTypeName || item.projectTitle}
                              </p>
                            </div>
                            <div className="text-[11px] text-default-600 space-y-1.5">
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-default-700 min-w-[75px] shrink-0">
                                  Period:
                                </span>
                                <span className="text-default-900 font-medium">
                                  {new Date(item.startDate).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  –{' '}
                                  {new Date(item.endDate).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {item.venue && (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-semibold text-default-700 min-w-[75px] shrink-0">
                                    Venue:
                                  </span>
                                  <span className="flex items-center gap-1 text-default-800">
                                    <MapPin className="h-3 w-3 inline text-default-400 shrink-0" />
                                    {item.venue}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-default-700 min-w-[75px] shrink-0">
                                  Max Allowed:
                                </span>
                                <span className="text-default-800 font-medium">
                                  {item.actType?.maxDays !== null && item.actType?.maxDays !== undefined
                                    ? `${item.actType.maxDays} calendar days`
                                    : 'No limit defined'}
                                </span>
                              </div>
                              <div className="pt-1.5 border-t border-default-100 flex items-center justify-between">
                                <span className="text-[10px] text-default-500 font-medium">
                                  Status:
                                </span>
                                <span
                                  className={cn(
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getRemainingDaysBadgeClass(item.remainingInfo.variant),
                                  )}
                                >
                                  {formatRemainingDayLabel(item.remainingInfo)}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
