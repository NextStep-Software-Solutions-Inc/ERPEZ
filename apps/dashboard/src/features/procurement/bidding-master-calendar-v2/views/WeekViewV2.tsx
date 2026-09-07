import { useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
} from 'date-fns'
import { useCalendarV2 } from '../contexts/calendar-context'
import { useDndV2 } from '../contexts/dnd-context'
import {
  WORKING_HOURS,
  WEEKDAY_LABELS,
  getPaletteForProject,
  CATEGORY_COLOR_MAP,
  STATUS_COLOR_MAP,
} from '../constants'
import type { BiddingMasterCalendarEvent } from '../types'
import { cn } from '@/lib/utils'

export function WeekViewV2() {
  const {
    selectedDate,
    filteredEvents,
    colorMode,
    openEventModal,
    use24HourFormat,
  } = useCalendarV2()

  const { startDrag, handleEventDrop } = useDndV2()

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
    })
  }, [selectedDate, weekStart])

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

  // Format hour label (e.g. 8 AM or 08:00)
  const formatHourLabel = (hour: number) => {
    if (use24HourFormat) {
      return `${String(hour).padStart(2, '0')}:00`
    }
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour} ${ampm}`
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-hidden select-none">
      {/* 7-Day Header */}
      <div className="grid grid-cols-8 border-b border-border/80 bg-muted/30 shrink-0 text-center">
        {/* Time column header */}
        <div className="w-16 border-r border-border/60 py-2.5 text-[11px] font-bold text-muted-foreground uppercase">
          Time
        </div>

        {/* 7 Weekday Columns */}
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'py-2 border-r last:border-r-0 border-border/60 flex flex-col items-center justify-center gap-0.5',
                isToday && 'bg-primary/[0.04]',
              )}
            >
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {WEEKDAY_LABELS[idx]}
              </span>
              <span
                className={cn(
                  'text-sm font-extrabold',
                  isToday
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-xs'
                    : 'text-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Hourly Time Slots Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/50">
        {WORKING_HOURS.map((hour) => {
          return (
            <div key={hour} className="grid grid-cols-8 min-h-16 relative">
              {/* Hour Label */}
              <div className="w-16 border-r border-border/60 p-2 text-right text-[11px] font-semibold text-muted-foreground select-none shrink-0 bg-muted/10">
                {formatHourLabel(hour)}
              </div>

              {/* 7 Day Slot Cells for this hour */}
              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd')

                // Find events occurring on this date in this hour
                const slotEvents = filteredEvents.filter((evt) => {
                  const evtDate = evt.startDate || evt.eventDate
                  if (evtDate.split('T')[0] !== dateKey) return false

                  if (evt.eventTime) {
                    const evtHour = parseInt(evt.eventTime.split(':')[0], 10)
                    return evtHour === hour
                  }
                  // If no specific time, default to 9 AM slot
                  return hour === 9
                })

                return (
                  <div
                    key={`${dateKey}-${hour}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('bg-primary/10')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-primary/10')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('bg-primary/10')
                      handleEventDrop(day, hour)
                    }}
                    className="border-r last:border-r-0 border-border/50 p-1 flex flex-col gap-1 transition-colors hover:bg-muted/20 relative"
                  >
                    {slotEvents.map((evt) => {
                      const palette = getEventPalette(evt)
                      return (
                        <div
                          key={evt.id}
                          draggable
                          onDragStart={() => startDrag(evt)}
                          onClick={() => openEventModal(evt)}
                          title={`${evt.milestoneName} - ${evt.primaryProjectName}`}
                          className={cn(
                            'group flex flex-col p-1.5 rounded-lg border text-xs font-semibold cursor-grab active:cursor-grabbing transition-all hover:shadow-xs shadow-2xs',
                            palette.bg,
                            palette.border,
                            palette.text,
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate font-bold text-[11px]">
                              {evt.milestoneName}
                            </span>
                            {evt.eventTime && (
                              <span className="text-[10px] opacity-80 shrink-0">
                                {evt.eventTime}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {evt.primaryProjectName}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
