import { format } from 'date-fns'
import { Clock, Building } from 'lucide-react'
import { useCalendarV2 } from '../contexts/calendar-context'
import { useDndV2 } from '../contexts/dnd-context'
import {
  WORKING_HOURS,
  getPaletteForProject,
  CATEGORY_COLOR_MAP,
  STATUS_COLOR_MAP,
} from '../constants'
import type { BiddingMasterCalendarEvent } from '../types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DayViewV2() {
  const {
    selectedDate,
    filteredEvents,
    colorMode,
    openEventModal,
    use24HourFormat,
  } = useCalendarV2()

  const { startDrag, handleEventDrop } = useDndV2()

  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const dayEvents = filteredEvents.filter((evt) => {
    const s = evt.startDate || evt.eventDate
    return s.split('T')[0] === dateKey
  })

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
      {/* Day Overview Header */}
      <div className="border-b border-border/80 bg-muted/30 px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {dayEvents.length} procurement session{dayEvents.length > 1 ? 's' : ''} scheduled
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dayEvents.some((e) => e.isOverdue) && (
            <Badge color="destructive" className="text-xs">
              Has Overdue Items
            </Badge>
          )}
          {dayEvents.some((e) => e.isDueSoon) && (
            <Badge className="bg-amber-600 text-white text-xs">
              Due Soon
            </Badge>
          )}
        </div>
      </div>

      {/* Hourly Timeline */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/50">
        {WORKING_HOURS.map((hour) => {
          const slotEvents = dayEvents.filter((evt) => {
            if (evt.eventTime) {
              const evtHour = parseInt(evt.eventTime.split(':')[0], 10)
              return evtHour === hour
            }
            return hour === 9
          })

          return (
            <div
              key={hour}
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
                handleEventDrop(selectedDate, hour)
              }}
              className="grid grid-cols-[80px_1fr] min-h-20 transition-colors"
            >
              {/* Hour Gutter */}
              <div className="border-r border-border/60 p-3 text-right text-xs font-semibold text-muted-foreground select-none bg-muted/10">
                {formatHourLabel(hour)}
              </div>

              {/* Slot Area */}
              <div className="p-2 space-y-2">
                {slotEvents.map((evt) => {
                  const palette = getEventPalette(evt)
                  return (
                    <div
                      key={evt.id}
                      draggable
                      onDragStart={() => startDrag(evt)}
                      onClick={() => openEventModal(evt)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border cursor-grab active:cursor-grabbing shadow-xs transition-all hover:scale-[1.005]',
                        palette.bg,
                        palette.border,
                        palette.text,
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn('text-[10px] font-bold px-1.5 py-0', palette.badge)}>
                            {evt.bacResolutionNumber || 'BAC'}
                          </Badge>
                          <span className="text-xs font-bold text-foreground">
                            {evt.milestoneName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{evt.primaryProjectName}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        {evt.eventTime && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{evt.eventTime}</span>
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground block">
                          {evt.officeLabel || 'BAC Office'}
                        </span>
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
