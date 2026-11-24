import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCalendarV2 } from '../contexts/calendar-context'
import { getPaletteForProject } from '../constants'
import { cn } from '@/lib/utils'

export function DayEventListModalV2() {
  const {
    dayEventsModalData,
    closeDayEventsModal,
    openEventModal,
    use24HourFormat,
  } = useCalendarV2()

  if (!dayEventsModalData) return null

  const { date, events } = dayEventsModalData
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy')

  const handleSelectEvent = (event: typeof events[0]) => {
    closeDayEventsModal()
    openEventModal(event)
  }

  return (
    <Dialog
      open={Boolean(dayEventsModalData)}
      onOpenChange={(open) => !open && closeDayEventsModal()}
    >
      <DialogContent className="sm:max-w-md rounded-2xl p-5 shadow-2xl space-y-3">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">
              {formattedDate}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {events.length} scheduled procurement activit{events.length > 1 ? 'ies' : 'y'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {events.map((evt) => {
            const palette = getPaletteForProject(evt.bacResolutionId || evt.primaryProjectName)

            let timeLabel = ''
            if (evt.eventTime) {
              try {
                const [h, m] = evt.eventTime.split(':').map(Number)
                const d = new Date()
                d.setHours(h, m, 0, 0)
                timeLabel = format(d, use24HourFormat ? 'HH:mm' : 'h:mm a')
              } catch {
                timeLabel = evt.eventTime
              }
            }

            return (
              <div
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs',
                  palette.bg,
                  palette.border,
                )}
              >
                <div className="space-y-1 min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn('text-[10px] font-bold px-1.5 py-0', palette.badge)}>
                      {evt.bacResolutionNumber || 'BAC'}
                    </Badge>
                    {timeLabel && (
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeLabel}
                      </span>
                    )}
                  </div>
                  <p className={cn('text-xs font-bold truncate', palette.text)}>
                    {evt.milestoneName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {evt.primaryProjectName}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
