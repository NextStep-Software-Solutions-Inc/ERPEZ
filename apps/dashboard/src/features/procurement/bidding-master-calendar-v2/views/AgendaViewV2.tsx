import { useMemo } from 'react'
import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'
import { Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { useCalendarV2 } from '../contexts/calendar-context'
import {
  getEventPalette,
  getProcurementModeAbbreviation,
  MODE_COLOR_MAP,
} from '../constants'
import type { BiddingMasterCalendarEvent } from '../types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function AgendaViewV2() {
  const { filteredEvents, colorMode, openEventModal, use24HourFormat } = useCalendarV2()

  const today = startOfDay(new Date())

  // Group events by Date
  const groupedAgenda = useMemo(() => {
    const groups = new Map<string, BiddingMasterCalendarEvent[]>()

    // Sort all events by date
    const sorted = [...filteredEvents].sort((a, b) => {
      const dateA = a.startDate || a.eventDate
      const dateB = b.startDate || b.eventDate
      return dateA.localeCompare(dateB)
    })

    for (const evt of sorted) {
      const dateKey = (evt.startDate || evt.eventDate).split('T')[0]
      const list = groups.get(dateKey) ?? []
      list.push(evt)
      groups.set(dateKey, list)
    }

    return Array.from(groups.entries()).map(([dateKey, events]) => ({
      dateKey,
      dateObj: parseISO(dateKey),
      events,
    }))
  }, [filteredEvents])

  if (groupedAgenda.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-center">
        <div className="space-y-2">
          <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h4 className="text-base font-bold text-foreground">No Procurement Milestones Found</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try clearing or adjusting your active filters in the header to view scheduled bidding milestones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-y-auto p-4 sm:p-6 space-y-6 select-none">
      {groupedAgenda.map(({ dateKey, dateObj, events }) => {
        const isToday = differenceInCalendarDays(dateObj, today) === 0

        return (
          <div key={dateKey} className="space-y-2.5">
            {/* Sticky Date Group Header */}
            <div className="flex items-center gap-2.5 sticky top-0 bg-background/95 backdrop-blur-xs py-1.5 z-10">
              <div
                className={cn(
                  'flex h-7 px-2.5 items-center justify-center rounded-lg text-xs font-bold border',
                  isToday
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/60 text-muted-foreground border-border/60',
                )}
              >
                {format(dateObj, 'EEE, MMM d, yyyy')}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {events.length} milestone{events.length > 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((evt) => {
                const palette = getEventPalette(evt, colorMode)
                const modeAbbr = getProcurementModeAbbreviation(evt)
                const modeColor = MODE_COLOR_MAP[modeAbbr]
                const diffDays = differenceInCalendarDays(dateObj, today)
                const isCompleted = evt.executionStatus === 'completed'

                return (
                  <div
                    key={evt.id}
                    onClick={() => openEventModal(evt)}
                    title={`[${modeAbbr}] ${evt.milestoneName} - ${evt.primaryProjectName}`}
                    className={cn(
                      'flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md space-y-3',
                      palette.bg,
                      palette.border,
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 border',
                              modeColor.badge,
                            )}
                          >
                            {modeAbbr}
                          </span>
                          <Badge variant="outline" className={cn('text-[10px] font-bold px-1.5 py-0', palette.badge)}>
                            {evt.bacResolutionNumber || 'BAC'}
                          </Badge>
                        </div>
                        {isCompleted ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0">
                            Completed
                          </Badge>
                        ) : diffDays < 0 ? (
                          <Badge color="destructive" className="text-[10px] font-bold py-0">
                            Overdue {Math.abs(diffDays)}d
                          </Badge>
                        ) : diffDays <= 3 ? (
                          <Badge className="bg-amber-600 text-white text-[10px] font-bold py-0">
                            {diffDays === 0 ? 'Today' : `Due in ${diffDays}d`}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            In {diffDays}d
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className={cn('text-xs font-bold leading-tight line-clamp-1', palette.text)}>
                          {evt.milestoneName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {evt.primaryProjectName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {evt.eventTime
                            ? use24HourFormat
                              ? evt.eventTime
                              : (() => {
                                  try {
                                    const [h, m] = evt.eventTime.split(':').map(Number)
                                    const d = new Date()
                                    d.setHours(h, m, 0, 0)
                                    return format(d, 'h:mm a')
                                  } catch {
                                    return evt.eventTime
                                  }
                                })()
                            : 'Session'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-28">{evt.officeLabel || 'BAC Office'}</span>
                        <ChevronRight className="h-3 w-3" />
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
  )
}
