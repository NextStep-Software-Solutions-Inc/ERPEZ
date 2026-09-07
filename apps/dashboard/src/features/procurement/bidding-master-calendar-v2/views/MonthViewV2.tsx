import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  differenceInCalendarDays,
  max as maxDate,
  min as minDate,
} from 'date-fns'
import { AlertTriangle, Layers } from 'lucide-react'
import { useCalendarV2 } from '../contexts/calendar-context'
import { useDndV2 } from '../contexts/dnd-context'
import {
  WEEKDAY_LABELS,
  getPaletteForProject,
  CATEGORY_COLOR_MAP,
  STATUS_COLOR_MAP,
} from '../constants'
import type { BiddingMasterCalendarEvent } from '../types'
import { cn } from '@/lib/utils'

interface WeekIntervalSegment {
  id: string
  event: BiddingMasterCalendarEvent
  startCol: number // 1 to 7
  span: number // 1 to 7
  trackIndex: number
  isStartEdge: boolean
  isEndEdge: boolean
}

export function MonthViewV2() {
  const {
    selectedDate,
    dayBuckets,
    filteredEvents,
    colorMode,
    openEventModal,
    openDayEventsModal,
  } = useCalendarV2()

  const { startDrag, handleEventDrop } = useDndV2()

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const weeks = useMemo(() => {
    return eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 0 },
    )
  }, [calendarStart, calendarEnd])

  const bucketMap = useMemo(() => {
    return new Map(dayBuckets.map((b) => [b.date, b]))
  }, [dayBuckets])

  // Get color palette for an event based on selected ColorTaxonomyMode
  const getEventPalette = (event: BiddingMasterCalendarEvent) => {
    if (colorMode === 'category') {
      return (
        CATEGORY_COLOR_MAP[event.procurementCategory.toLowerCase()] ??
        getPaletteForProject(event.bacResolutionId)
      )
    }
    if (colorMode === 'status') {
      return (
        STATUS_COLOR_MAP[event.derivedProjectStatus] ??
        getPaletteForProject(event.bacResolutionId)
      )
    }
    return getPaletteForProject(event.bacResolutionId || event.primaryProjectName)
  }

  // Precompute multi-day spanning bars & point events for each week
  const weekData = useMemo(() => {
    return weeks.map((weekSunday) => {
      const weekDays = eachDayOfInterval({
        start: weekSunday,
        end: endOfWeek(weekSunday, { weekStartsOn: 0 }),
      })
      const weekSaturday = weekDays[6]

      // Separate multi-day events that intersect this week vs single-day point events
      const multiDayEvents: BiddingMasterCalendarEvent[] = []
      const singleDayEventsByDay: Record<number, BiddingMasterCalendarEvent[]> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      }

      for (const event of filteredEvents) {
        const sStr = event.startDate || event.eventDate
        const eStr = event.endDate || event.eventDate

        const sDate = parseISO(sStr.split('T')[0])
        const eDate = parseISO(eStr.split('T')[0])

        const isMultiDay =
          event.startDate &&
          event.endDate &&
          differenceInCalendarDays(eDate, sDate) > 0

        if (isMultiDay) {
          // Check intersection with week
          if (sDate <= weekSaturday && eDate >= weekSunday) {
            multiDayEvents.push(event)
          }
        } else {
          // Single-day point milestone
          const dayIdx = weekDays.findIndex((d) => isSameDay(d, sDate))
          if (dayIdx >= 0) {
            singleDayEventsByDay[dayIdx].push(event)
          }
        }
      }

      // Sort multi-day events by duration (longer first)
      multiDayEvents.sort((a, b) => {
        const aStart = parseISO((a.startDate || a.eventDate).split('T')[0])
        const aEnd = parseISO((a.endDate || a.eventDate).split('T')[0])
        const bStart = parseISO((b.startDate || b.eventDate).split('T')[0])
        const bEnd = parseISO((b.endDate || b.eventDate).split('T')[0])
        return differenceInCalendarDays(bEnd, bStart) - differenceInCalendarDays(aEnd, aStart)
      })

      // Assign tracks (0, 1, 2) to multi-day segments
      const trackAssignments: Array<Array<boolean>> = [[], [], []] // up to 3 tracks, length 7
      for (let t = 0; t < 3; t++) {
        trackAssignments[t] = [false, false, false, false, false, false, false]
      }

      const segments: WeekIntervalSegment[] = []

      for (const event of multiDayEvents) {
        const sDate = parseISO((event.startDate || event.eventDate).split('T')[0])
        const eDate = parseISO((event.endDate || event.eventDate).split('T')[0])

        const clampedStart = maxDate([sDate, weekSunday])
        const clampedEnd = minDate([eDate, weekSaturday])

        const startCol = Math.max(
          0,
          Math.min(6, differenceInCalendarDays(clampedStart, weekSunday)),
        )
        const endCol = Math.max(
          0,
          Math.min(6, differenceInCalendarDays(clampedEnd, weekSunday)),
        )
        const span = endCol - startCol + 1

        // Find available track
        let assignedTrack = -1
        for (let t = 0; t < 3; t++) {
          let conflict = false
          for (let col = startCol; col <= endCol; col++) {
            if (trackAssignments[t][col]) {
              conflict = true
              break
            }
          }
          if (!conflict) {
            assignedTrack = t
            for (let col = startCol; col <= endCol; col++) {
              trackAssignments[t][col] = true
            }
            break
          }
        }

        if (assignedTrack !== -1) {
          segments.push({
            id: `${event.id}-w${format(weekSunday, 'yyyyMMdd')}`,
            event,
            startCol: startCol + 1,
            span,
            trackIndex: assignedTrack,
            isStartEdge: isSameDay(sDate, clampedStart),
            isEndEdge: isSameDay(eDate, clampedEnd),
          })
        }
      }

      return {
        weekDays,
        segments,
        singleDayEventsByDay,
        trackOccupancy: trackAssignments,
      }
    })
  }, [weeks, filteredEvents])

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-hidden select-none">
      {/* 7 Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border/80 bg-muted/40 shrink-0 text-center">
        {WEEKDAY_LABELS.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider',
              idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300',
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Weeks Container */}
      <div className="grid flex-1 min-h-0 grid-rows-5 md:grid-rows-6 divide-y divide-border/60">
        {weekData.map(({ weekDays, segments, singleDayEventsByDay, trackOccupancy }, weekIdx) => {
          return (
            <div
              key={`week-${weekIdx}`}
              className="relative grid grid-cols-7 divide-x divide-border/60 min-h-[110px] overflow-hidden group/week"
            >
              {/* Day Cell Backgrounds & Headers */}
              {weekDays.map((day, dayIdx) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const isCurrentMonth = isSameMonth(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const bucket = bucketMap.get(dateKey)
                const conflictCount = bucket?.hardConflictCount ?? 0
                const dayEvents = bucket?.events ?? []

                const occupiedTracks = trackOccupancy.filter((t) => t[dayIdx]).length
                // Calculate how many items are hidden for "+N more" badge
                const hiddenCount = Math.max(0, dayEvents.length - 3)

                return (
                  <div
                    key={dateKey}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('bg-primary/5')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-primary/5')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('bg-primary/5')
                      handleEventDrop(day)
                    }}
                    className={cn(
                      'relative flex flex-col p-1 transition-colors overflow-hidden',
                      isCurrentMonth
                        ? 'bg-card'
                        : 'bg-muted/15 text-muted-foreground',
                      isToday && 'bg-primary/[0.02]',
                    )}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between px-1 py-0.5 z-20">
                      <span
                        className={cn(
                          'text-xs font-semibold select-none',
                          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60',
                          isToday &&
                            'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-[11px] shadow-xs',
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      <div className="flex items-center gap-1">
                        {conflictCount > 0 && (
                          <span
                            title={`${conflictCount} committee conflict(s)`}
                            className="flex items-center gap-0.5 rounded-full px-1 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 text-[10px] font-bold border border-rose-300 animate-pulse"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {conflictCount}
                          </span>
                        )}

                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            onClick={() => openDayEventsModal(day, dayEvents)}
                            className="text-[10px] font-bold text-primary hover:underline px-1 py-0.2 rounded hover:bg-primary/10 cursor-pointer"
                          >
                            +{hiddenCount} more
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Single-day events stack (rendered in available space below spanning bars) */}
                    <div className="flex-1 min-h-0 space-y-1 mt-1 z-20 overflow-hidden">
                      {singleDayEventsByDay[dayIdx].slice(0, Math.max(1, 3 - occupiedTracks)).map((evt) => {
                        const palette = getEventPalette(evt)
                        return (
                          <div
                            key={evt.id}
                            draggable
                            onDragStart={() => startDrag(evt)}
                            onClick={() => openEventModal(evt)}
                            title={`${evt.milestoneName} - ${evt.primaryProjectName}`}
                            className={cn(
                              'group/evt flex items-center justify-between rounded-md border px-1.5 py-0.5 text-[11px] font-semibold cursor-grab active:cursor-grabbing transition-all hover:shadow-xs truncate',
                              palette.bg,
                              palette.border,
                              palette.text,
                            )}
                          >
                            <div className="flex items-center gap-1 min-w-0 truncate">
                              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', palette.solid)} />
                              <span className="truncate">{evt.milestoneName}</span>
                            </div>

                            {evt.eventTime && (
                              <span className="text-[10px] text-muted-foreground ml-1 shrink-0 font-medium">
                                {evt.eventTime}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Multi-Day Spanning Bars Layer across the week row */}
              <div className="absolute inset-x-0 top-7 bottom-1 pointer-events-none grid grid-cols-7 gap-x-px z-10 px-1">
                {segments.map((segment) => {
                  const palette = getEventPalette(segment.event)
                  const topOffset = segment.trackIndex * 24 + 4

                  return (
                    <div
                      key={segment.id}
                      style={{
                        gridColumnStart: segment.startCol,
                        gridColumnEnd: `span ${segment.span}`,
                        top: `${topOffset}px`,
                      }}
                      className="absolute h-5 pointer-events-auto cursor-grab active:cursor-grabbing"
                    >
                      <div
                        draggable
                        onDragStart={() => startDrag(segment.event)}
                        onClick={() => openEventModal(segment.event)}
                        title={`${segment.event.milestoneName} (${segment.event.primaryProjectName})`}
                        className={cn(
                          'flex h-full w-full items-center justify-between px-2 text-[10px] font-bold border transition-all hover:scale-[1.01] shadow-2xs',
                          palette.bg,
                          palette.border,
                          palette.text,
                          segment.isStartEdge ? 'rounded-l-md border-l-2' : 'border-l-0 rounded-l-none',
                          segment.isEndEdge ? 'rounded-r-md' : 'border-r-0 rounded-r-none',
                        )}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Layers className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate font-semibold">{segment.event.milestoneName}</span>
                          <span className="text-muted-foreground font-normal truncate max-w-28 hidden sm:inline">
                            • {segment.event.primaryProjectName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
