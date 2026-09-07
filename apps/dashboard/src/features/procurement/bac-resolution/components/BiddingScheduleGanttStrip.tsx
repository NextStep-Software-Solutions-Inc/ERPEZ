import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarRange, Clock, AlertTriangle, CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import { computeRemainingDays, getRemainingDaysBadgeClass } from '../utils/remainingDays'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'

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
  remarks?: string
}

interface BiddingScheduleGanttStripProps {
  bacResolutionId?: string | null
  bacResolutionNumber?: string | null
  className?: string
}

export function BiddingScheduleGanttStrip({
  bacResolutionId,
  bacResolutionNumber,
  className,
}: BiddingScheduleGanttStripProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  // Fetch events only when a single resolution ID is provided
  useEffect(() => {
    if (!bacResolutionId) {
      setEvents([])
      return
    }

    let isMounted = true
    setIsLoading(true)

    const fetchProjectEvents = async () => {
      try {
        const response = await api.get<any>('/bac/calendar-events')
        const rawData = response.data?.data
        const allEvents: CalendarEvent[] =
          rawData && Array.isArray(rawData.events)
            ? rawData.events
            : Array.isArray(rawData)
              ? rawData
              : []

        // Filter events specifically for this BAC project/resolution
        const filtered = allEvents.filter(
          (e) =>
            e.projectId === bacResolutionId ||
            (bacResolutionNumber && e.projectTitle?.includes(bacResolutionNumber)),
        )

        if (isMounted) {
          setEvents(filtered.length > 0 ? filtered : allEvents.slice(0, 5)) // Graceful fallback if no exact project match
        }
      } catch {
        if (isMounted) {
          setEvents([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchProjectEvents()

    return () => {
      isMounted = false
    }
  }, [bacResolutionId, bacResolutionNumber])

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
      const isCompleted =
        event.status === 'Completed' ||
        (event as any).executionStatus === 'completed'
      const remainingInfo = computeRemainingDays(event.endDate, {
        isCompleted,
        maxDays: actType?.maxDays,
      })

      return {
        ...event,
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
      <CardHeader className="py-3 px-4 bg-muted/20 border-b border-default-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs font-semibold text-foreground">
            Bidding Activity Date Interval & Milestone Window
          </CardTitle>
          <Badge variant="outline" className="text-[10px] py-0 px-2 font-normal">
            Single Resolution View
          </Badge>
        </div>
        {timelineData && (
          <span className="text-[11px] text-muted-foreground">
            Window Span: <strong className="text-foreground">{timelineData.totalDays} calendar days</strong>
          </span>
        )}
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
                            {item.remainingInfo.label}
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
                                {item.remainingInfo.durationDays}d
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs p-2.5 max-w-xs space-y-1.5 shadow-md">
                            <p className="font-bold text-foreground">{item.procurementActivityTypeName || item.projectTitle}</p>
                            <div className="text-[11px] text-muted-foreground space-y-0.5">
                              <p>
                                <strong>Period:</strong>{' '}
                                {new Date(item.startDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}{' '}
                                –{' '}
                                {new Date(item.endDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {item.venue && (
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 inline" /> {item.venue}
                                </p>
                              )}
                              <p>
                                <strong>Max Allowed:</strong>{' '}
                                {item.actType?.maxDays !== null && item.actType?.maxDays !== undefined
                                  ? `${item.actType.maxDays} days`
                                  : 'No limit defined'}
                              </p>
                              <p className={cn('font-semibold', item.remainingInfo.variant === 'destructive' ? 'text-red-600' : item.remainingInfo.variant === 'warning' ? 'text-amber-600' : 'text-emerald-600')}>
                                Status: {item.remainingInfo.label}
                              </p>
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
