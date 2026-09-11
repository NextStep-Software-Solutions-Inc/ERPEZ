import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2, CalendarRange } from 'lucide-react'
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { BiddingMasterCalendarConflictBadge } from './BiddingMasterCalendarConflictBadge'
import { BiddingMasterCalendarEventChip } from './BiddingMasterCalendarEventChip'
import { BiddingMasterCalendarOverloadBadge } from './BiddingMasterCalendarOverloadBadge'
import {
  BiddingMasterCalendarIntervalBar,
  type CalendarWeekInterval,
} from './BiddingMasterCalendarIntervalBar'
import type {
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarEvent,
} from '../types'
import type {
  BiddingSchedule,
  MilestoneExecutionStatus,
} from '../../bidding-schedule/types'
import {
  computeRemainingDays,
  type RemainingDaysResult,
} from '@/features/procurement/bac-resolution'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface BiddingMasterCalendarMonthViewProps {
  currentMonth: Date
  dayBuckets: BiddingMasterCalendarDayBucket[]
  onMonthChange: (nextMonth: Date) => void
  onOpenMilestone: (event: BiddingMasterCalendarEvent) => void
  onPreviewMilestone?: (event: BiddingMasterCalendarEvent | null) => void
  selectedEventId?: string | null
  selectedResolutionId?: string | null
  allEvents?: BiddingMasterCalendarEvent[]
  isLoading?: boolean
  schedule?: BiddingSchedule | null
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DEFAULT_MAX_DAYS_BY_KEY: Record<string, number | null> = {
  'ib-posting': null,
  'bid-documents-issuance': 1,
  'pre-bid-conference': 12,
  'clarification-deadline': 5,
  'bid-submission-opening': 30,
  'bid-evaluation': 15,
  'post-qualification': 30,
  'bac-resolution-award': 7,
  'approval-resolution': 7,
  'notice-of-award': 3,
  'contract-signing': 10,
  'notice-to-proceed': 7,
}

const DEFAULT_MAX_DAYS_BY_NAME: Array<{ pattern: RegExp; maxDays: number | null }> = [
  { pattern: /advertisement|posting of ib/i, maxDays: null },
  { pattern: /issuance|availability of bid doc/i, maxDays: 1 },
  { pattern: /pre-bid/i, maxDays: 12 },
  { pattern: /clarification/i, maxDays: 5 },
  { pattern: /submission.*opening/i, maxDays: 30 },
  { pattern: /bid evaluation/i, maxDays: 15 },
  { pattern: /post-qualification/i, maxDays: 30 },
  { pattern: /resolution of award/i, maxDays: 7 },
  { pattern: /approval of bac resolution/i, maxDays: 7 },
  { pattern: /notice of award/i, maxDays: 3 },
  { pattern: /contract signing/i, maxDays: 10 },
  { pattern: /notice to proceed/i, maxDays: 7 },
]

function resolveFallbackMaxDays(milestoneKey: string, milestoneName: string): number | null | undefined {
  if (milestoneKey && milestoneKey in DEFAULT_MAX_DAYS_BY_KEY) {
    return DEFAULT_MAX_DAYS_BY_KEY[milestoneKey]
  }
  const byName = DEFAULT_MAX_DAYS_BY_NAME.find((d) => d.pattern.test(milestoneName))
  if (byName) {
    return byName.maxDays
  }
  return null
}

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

interface ResolutionTimelineItem {
  id: string
  milestoneKey: string
  milestoneName: string
  startDate: Date
  endDate: Date
  durationDays: number
  eventTime: string | null
  executionStatus: MilestoneExecutionStatus
  isEdited: boolean
  remainingInfo: RemainingDaysResult
  event: BiddingMasterCalendarEvent
}

export function BiddingMasterCalendarMonthView({
  currentMonth,
  dayBuckets,
  onMonthChange,
  onOpenMilestone,
  onPreviewMilestone,
  selectedEventId = null,
  selectedResolutionId = null,
  allEvents = [],
  isLoading = false,
  schedule = null,
}: BiddingMasterCalendarMonthViewProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const bucketMap = useMemo(
    () => new Map(dayBuckets.map((bucket) => [bucket.date, bucket])),
    [dayBuckets],
  )

  // Fetch activity types for statutory maxDays
  const { data: activityTypesData } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })

  const activityTypeMap = useMemo(() => {
    const map = new Map<string, ProcurementActivityType>()
    for (const item of activityTypesData?.data || []) {
      if (item.id) map.set(item.id, item)
      const typedItem = item as ProcurementActivityType & { milestoneKey?: string | null }
      if (typedItem.milestoneKey) {
        map.set(String(typedItem.milestoneKey).toLowerCase(), item)
      }
      if (item.name) {
        map.set(item.name.toLowerCase().trim(), item)
      }
    }
    return map
  }, [activityTypesData])

  // Collect all events from props or buckets
  const combinedEvents = useMemo(() => {
    if (allEvents.length > 0) return allEvents
    return dayBuckets.flatMap((b) => b.events)
  }, [allEvents, dayBuckets])

  // Detect single resolution mode
  const uniqueResolutionIds = useMemo(() => {
    return Array.from(new Set(combinedEvents.map((e) => e.bacResolutionId)))
  }, [combinedEvents])

  const effectiveResolutionId = useMemo(() => {
    if (selectedResolutionId) return selectedResolutionId
    if (uniqueResolutionIds.length === 1) return uniqueResolutionIds[0]
    return null
  }, [selectedResolutionId, uniqueResolutionIds])

  const singleResolutionMode = Boolean(effectiveResolutionId)

  // Filter events belonging to the single active resolution
  const activeResolutionEvents = useMemo(() => {
    if (!effectiveResolutionId) return []
    return combinedEvents
      .filter((e) => e.bacResolutionId === effectiveResolutionId)
      .sort((a, b) => {
        const dateA = a.startDate || a.eventDate
        const dateB = b.startDate || b.eventDate
        return dateA.localeCompare(dateB)
      })
  }, [combinedEvents, effectiveResolutionId])

  const activeResolutionTitle =
    activeResolutionEvents[0]?.bacResolutionNumber ||
    schedule?.bacResolutionNumber ||
    effectiveResolutionId

  // Build sequential multi-day timeline items when 1 BAC Resolution is active
  const timelineItems = useMemo<ResolutionTimelineItem[]>(() => {
    if (!singleResolutionMode || !effectiveResolutionId) return []

    // Option 1: Use official 12 milestones from schedule if present
    if (
      schedule &&
      schedule.bacResolutionId === effectiveResolutionId &&
      schedule.milestones?.length > 0
    ) {
      const sorted = [...schedule.milestones].sort((a, b) => a.order - b.order)
      const items: ResolutionTimelineItem[] = []

      for (let i = 0; i < sorted.length; i++) {
        const m = sorted[i]
        const mDateStr = (m.overrideDate ?? m.computedDate).split('T')[0]
        const eDate = startOfDay(parseISO(mDateStr))

        let sDate: Date
        if (i === 0) {
          if (schedule.ibPostingDate) {
            sDate = startOfDay(parseISO(schedule.ibPostingDate.split('T')[0]))
          } else {
            sDate = eDate
          }
        } else {
          const prevM = sorted[i - 1]
          const prevDateStr = (
            prevM.overrideDate ?? prevM.computedDate
          ).split('T')[0]
          sDate = startOfDay(parseISO(prevDateStr))
        }

        let finalStart = sDate
        let finalEnd = eDate
        if (isNaN(finalStart.getTime())) finalStart = finalEnd
        if (isNaN(finalEnd.getTime())) continue
        if (finalStart > finalEnd) {
          finalStart = finalEnd
        }

        const durationDays = Math.max(
          1,
          differenceInCalendarDays(finalEnd, finalStart) + 1,
        )
        const matchingEvent = activeResolutionEvents.find(
          (e) => e.milestoneKey === m.milestoneKey || e.milestoneId === m.id,
        )

        const actType =
          activityTypeMap.get(m.milestoneKey.toLowerCase()) ||
          activityTypeMap.get(m.name.toLowerCase().trim())
        const maxDays =
          actType?.maxDays !== undefined && actType?.maxDays !== null
            ? actType.maxDays
            : resolveFallbackMaxDays(m.milestoneKey, m.name)

        const isCompleted = Boolean(m.completedAt)
        const remainingInfo = computeRemainingDays(mDateStr, {
          isCompleted,
          maxDays,
        })

        const eventObj: BiddingMasterCalendarEvent = matchingEvent ?? {
          id: m.id || `${schedule.id}-${m.milestoneKey}`,
          bacResolutionId: schedule.bacResolutionId,
          bacResolutionNumber: schedule.bacResolutionNumber,
          scheduleId: schedule.id,
          scheduleStatus: schedule.status,
          fiscalYear: '',
          procurementCategory: schedule.procurementCategory,
          projectNames: [
            activeResolutionEvents[0]?.primaryProjectName ||
              schedule.bacResolutionNumber,
          ],
          primaryProjectName:
            activeResolutionEvents[0]?.primaryProjectName ||
            schedule.bacResolutionNumber,
          officeLabel: activeResolutionEvents[0]?.officeLabel || '',
          linkedCprCount: 0,
          milestoneId: m.id,
          milestoneKey: m.milestoneKey,
          milestoneName: m.name,
          milestoneOrder: m.order,
          eventDate: mDateStr,
          eventTime: m.time ?? null,
          isEdited: m.isEdited,
          executionStatus: isCompleted ? 'completed' : 'pending',
          sourceType: schedule.status === 'confirmed' ? 'confirmed' : 'draft',
          derivedProjectStatus: isCompleted
            ? 'completed-locked'
            : 'in-progress',
          appTargetMonth: null,
          isDueSoon: remainingInfo.variant === 'warning',
          isOverdue: remainingInfo.variant === 'destructive',
          startDate: format(finalStart, 'yyyy-MM-dd'),
          endDate: format(finalEnd, 'yyyy-MM-dd'),
        }

        items.push({
          id: `timeline-${m.id || m.milestoneKey}`,
          milestoneKey: m.milestoneKey,
          milestoneName: m.name,
          startDate: finalStart,
          endDate: finalEnd,
          durationDays,
          eventTime: m.time ?? null,
          executionStatus: isCompleted ? 'completed' : 'pending',
          isEdited: m.isEdited,
          remainingInfo,
          event: eventObj,
        })
      }

      return items
    }

    // Option 2: Fallback to activeResolutionEvents chronologically sequenced
    if (activeResolutionEvents.length > 0) {
      const sorted = [...activeResolutionEvents].sort((a, b) => {
        if (a.milestoneOrder !== b.milestoneOrder) {
          return a.milestoneOrder - b.milestoneOrder
        }
        return a.eventDate.localeCompare(b.eventDate)
      })

      const items: ResolutionTimelineItem[] = []
      for (let i = 0; i < sorted.length; i++) {
        const evt = sorted[i]
        const eDate = startOfDay(parseISO(evt.eventDate.split('T')[0]))

        let sDate: Date
        if (
          evt.startDate &&
          evt.endDate &&
          evt.startDate.split('T')[0] !== evt.endDate.split('T')[0]
        ) {
          sDate = startOfDay(parseISO(evt.startDate.split('T')[0]))
        } else if (i === 0) {
          sDate = eDate
        } else {
          const prevEvt = sorted[i - 1]
          sDate = startOfDay(parseISO(prevEvt.eventDate.split('T')[0]))
        }

        let finalStart = sDate
        let finalEnd = eDate
        if (isNaN(finalStart.getTime())) finalStart = finalEnd
        if (isNaN(finalEnd.getTime())) continue
        if (finalStart > finalEnd) finalStart = finalEnd

        const durationDays = Math.max(
          1,
          differenceInCalendarDays(finalEnd, finalStart) + 1,
        )
        const actType =
          activityTypeMap.get(evt.milestoneKey.toLowerCase()) ||
          activityTypeMap.get(evt.milestoneName.toLowerCase().trim())
        const maxDays =
          actType?.maxDays !== undefined && actType?.maxDays !== null
            ? actType.maxDays
            : resolveFallbackMaxDays(evt.milestoneKey, evt.milestoneName)

        const isCompleted = evt.executionStatus === 'completed'
        const remainingInfo = computeRemainingDays(evt.eventDate, {
          isCompleted,
          maxDays,
        })

        items.push({
          id: `timeline-${evt.id}`,
          milestoneKey: evt.milestoneKey,
          milestoneName: evt.milestoneName,
          startDate: finalStart,
          endDate: finalEnd,
          durationDays,
          eventTime: evt.eventTime ?? null,
          executionStatus: evt.executionStatus,
          isEdited: evt.isEdited,
          remainingInfo,
          event: evt,
        })
      }

      return items
    }

    return []
  }, [
    singleResolutionMode,
    effectiveResolutionId,
    schedule,
    activeResolutionEvents,
    activityTypeMap,
  ])

  // Group days into 7-day weeks
  const weeks = useMemo(() => {
    const allDays: Date[] = []
    let day = startDate
    while (day <= endDate) {
      allDays.push(day)
      day = addDays(day, 1)
    }

    const grouped: Date[][] = []
    for (let i = 0; i < allDays.length; i += 7) {
      grouped.push(allDays.slice(i, i + 7))
    }
    return grouped
  }, [startDate, endDate])

  // Compute multi-day intervals for a given week
  const getWeekIntervals = (weekDays: Date[]): CalendarWeekInterval[] => {
    if (!singleResolutionMode || timelineItems.length === 0) return []

    const weekStart = startOfDay(weekDays[0])
    const weekEnd = startOfDay(weekDays[6])
    const intervals: CalendarWeekInterval[] = []

    for (const item of timelineItems) {
      const sDate = item.startDate
      const eDate = item.endDate

      // Check if event interval overlaps with this week
      if (eDate >= weekStart && sDate <= weekEnd) {
        const sliceStart = sDate < weekStart ? weekStart : sDate
        const sliceEnd = eDate > weekEnd ? weekEnd : eDate

        const startCol = differenceInCalendarDays(sliceStart, weekStart) + 1
        const endCol = differenceInCalendarDays(sliceEnd, weekStart) + 1
        const span = Math.max(1, endCol - startCol + 1)
        const isStartEdge = isSameDay(sliceStart, sDate)
        const isEndEdge = isSameDay(sliceEnd, eDate)

        intervals.push({
          id: `${item.id}-w${format(weekStart, 'yyyyMMdd')}`,
          eventId: item.event.id,
          bacResolutionId: item.event.bacResolutionId,
          milestoneKey: item.milestoneKey,
          milestoneName: item.milestoneName,
          startDate: sDate,
          endDate: eDate,
          durationDays: item.durationDays,
          startCol,
          span,
          isStartEdge,
          isEndEdge,
          remainingInfo: item.remainingInfo,
          event: item.event,
        })
      }
    }

    return intervals.sort((a, b) => a.startCol - b.startCol)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Card
        className="shadow-sm flex-1 min-h-0 flex flex-col border border-slate-200 bg-white"
        style={{ minHeight: `${weeks.length * 115 + 85}px` }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2.5 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Monthly Overview — {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            {singleResolutionMode && (
              <Badge
                variant="outline"
                className="gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300 text-xs py-0.5 px-2.5 font-medium"
              >
                <CalendarRange className="h-3.5 w-3.5 inline text-emerald-600" />
                Timeline: {activeResolutionTitle || '1 Selected'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Inline Legend Pills */}
            <div className="hidden md:flex items-center gap-2.5 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Due Soon</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full ring-2 ring-rose-500 bg-white" />
                <span>Conflict</span>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMonthChange(new Date())}
                className="h-8 px-2.5 text-xs font-semibold"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center flex-1 min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col rounded-lg bg-slate-200 border border-slate-200 overflow-hidden text-xs space-y-px">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-px shrink-0">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="bg-slate-100 py-1.5 text-center font-bold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Weeks Grid: Real CSS Grid with strictly uniform row heights */}
              <div
                className="flex-1 min-h-0 grid grid-cols-1 gap-px bg-slate-200"
                style={{
                  gridTemplateRows: `repeat(${weeks.length}, minmax(115px, 1fr))`,
                }}
              >
                {weeks.map((weekDays, weekIdx) => {
                  const weekIntervals = getWeekIntervals(weekDays)

                  return (
                    <div
                      key={`week-${weekIdx}`}
                      className="relative h-full min-h-[115px] bg-white border-b border-default-200 last:border-b-0 flex flex-col overflow-hidden"
                    >
                      {/* Background 7 Day Cell Boxes: provides day columns, cell backgrounds, heatmaps */}
                      <div className="absolute inset-0 grid grid-cols-7 gap-px pointer-events-none">
                        {weekDays.map((date) => {
                          const dateKey = format(date, 'yyyy-MM-dd')
                          const bucket = bucketMap.get(dateKey)
                          const isCurrentMonth = isSameMonth(date, currentMonth)
                          const bucketEvents = bucket?.events ?? []
                          const isOverloaded = bucket?.isOverloaded ?? false

                          return (
                            <div
                              key={`bg-${dateKey}`}
                              className={cn(
                                'h-full transition-colors',
                                isCurrentMonth
                                  ? getHeatMapClass(bucketEvents.length)
                                  : 'bg-slate-100/70 opacity-60',
                                isOverloaded && 'ring-1 ring-inset ring-amber-400',
                              )}
                            />
                          )
                        })}
                      </div>

                      {/* Foreground Content: Day numbers + In-cell spanning bars + Event stacks */}
                      <div className="relative z-10 flex flex-col h-full min-h-0 p-1 overflow-hidden">
                        {/* Day number header across 7 columns */}
                        <div className="grid grid-cols-7 gap-px shrink-0 mb-1">
                          {weekDays.map((date) => {
                            const dateKey = format(date, 'yyyy-MM-dd')
                            const bucket = bucketMap.get(dateKey)
                            const isCurrentMonth = isSameMonth(date, currentMonth)
                            const conflictCount = bucket?.hardConflictCount ?? 0
                            const isOverloaded = bucket?.isOverloaded ?? false
                            const isToday = isSameDay(date, new Date())

                            return (
                              <div
                                key={`header-${dateKey}`}
                                className="flex items-center justify-between px-1.5 py-0.5"
                              >
                                <span
                                  className={cn(
                                    'text-xs select-none',
                                    isCurrentMonth
                                      ? 'text-slate-900 font-bold'
                                      : 'text-slate-400 font-medium',
                                    isToday &&
                                      'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px] shadow-xs',
                                  )}
                                >
                                  {format(date, 'd')}
                                </span>

                                <div className="flex items-center gap-1">
                                  {conflictCount > 0 && (
                                    <BiddingMasterCalendarConflictBadge
                                      count={conflictCount}
                                      compact
                                    />
                                  )}
                                  {isOverloaded && (
                                    <BiddingMasterCalendarOverloadBadge
                                      count={bucket?.events.length ?? 0}
                                      compact
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Inside-cell Spanning Bars Track (Single Resolution Mode) */}
                        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-1">
                          {singleResolutionMode && weekIntervals.length > 0 ? (
                            <div className="grid grid-cols-7 gap-x-1 gap-y-1">
                              {weekIntervals.map((interval) => (
                                <BiddingMasterCalendarIntervalBar
                                  key={interval.id}
                                  interval={interval}
                                  isSelected={selectedEventId === interval.eventId}
                                  onClick={onOpenMilestone}
                                  onMouseEnter={() =>
                                    onPreviewMilestone?.(interval.event)
                                  }
                                  onMouseLeave={() => onPreviewMilestone?.(null)}
                                />
                              ))}

                              {/* Any events from other resolutions render in their respective day column */}
                              {weekDays.map((date, dayIdx) => {
                                const dateKey = format(date, 'yyyy-MM-dd')
                                const bucket = bucketMap.get(dateKey)
                                const otherEvents = (
                                  bucket?.events ?? []
                                ).filter(
                                  (e) =>
                                    e.bacResolutionId !== effectiveResolutionId,
                                )
                                if (otherEvents.length === 0) return null

                                return (
                                  <div
                                    key={`other-${dateKey}`}
                                    style={{ gridColumnStart: dayIdx + 1 }}
                                    className="space-y-1 mt-0.5"
                                  >
                                    {otherEvents.slice(0, 2).map((event) => (
                                      <BiddingMasterCalendarEventChip
                                        key={event.id}
                                        event={event}
                                        isSelected={selectedEventId === event.id}
                                        onMouseEnter={() =>
                                          onPreviewMilestone?.(event)
                                        }
                                        onMouseLeave={() =>
                                          onPreviewMilestone?.(null)
                                        }
                                        onClick={() => onOpenMilestone(event)}
                                      />
                                    ))}
                                    {otherEvents.length > 2 && (
                                      <div className="rounded border border-dashed border-default-200 px-1 py-0.5 text-[10px] text-muted-foreground">
                                        +{otherEvents.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            /* Multi-resolution mode: Standard column-based event chips inside each day cell */
                            <div className="grid grid-cols-7 gap-px h-full min-h-0">
                              {weekDays.map((date) => {
                                const dateKey = format(date, 'yyyy-MM-dd')
                                const bucket = bucketMap.get(dateKey)
                                const bucketEvents = bucket?.events ?? []
                                const visibleEvents = bucketEvents.slice(0, 3)
                                const hiddenCount = Math.max(
                                  bucketEvents.length - visibleEvents.length,
                                  0,
                                )

                                return (
                                  <div
                                    key={`events-${dateKey}`}
                                    className="px-1 py-0.5 space-y-1 h-full min-h-[75px] overflow-y-auto"
                                  >
                                    {visibleEvents.map((event) => (
                                      <BiddingMasterCalendarEventChip
                                        key={event.id}
                                        event={event}
                                        isSelected={selectedEventId === event.id}
                                        onMouseEnter={() =>
                                          onPreviewMilestone?.(event)
                                        }
                                        onMouseLeave={() =>
                                          onPreviewMilestone?.(null)
                                        }
                                        onClick={() => onOpenMilestone(event)}
                                      />
                                    ))}

                                    {hiddenCount > 0 && (
                                      <div className="rounded border border-dashed border-default-200 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        +{hiddenCount} more
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

