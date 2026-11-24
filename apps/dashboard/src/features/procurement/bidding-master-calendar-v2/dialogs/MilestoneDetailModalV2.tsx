import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Building,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCalendarV2 } from '../contexts/calendar-context'
import { useSetMilestoneCompletion } from '../../bidding-schedule/handlers/hooks'
import { getPaletteForProject } from '../constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MilestoneDetailModalV2() {
  const {
    selectedEventForModal,
    closeEventModal,
    openDrawer,
    use24HourFormat,
  } = useCalendarV2()

  const { mutateAsync: setMilestoneCompletion, isPending: isUpdatingStatus } =
    useSetMilestoneCompletion()

  if (!selectedEventForModal) return null

  const event = selectedEventForModal
  const palette = getPaletteForProject(event.bacResolutionId || event.primaryProjectName)

  const eventDateObj = parseISO(event.eventDate)
  const formattedDate = format(eventDateObj, 'EEEE, MMMM d, yyyy')

  // Format time (12h vs 24h)
  let formattedTime = 'No time set'
  if (event.eventTime) {
    try {
      const [h, m] = event.eventTime.split(':').map(Number)
      const dateWithTime = new Date()
      dateWithTime.setHours(h, m, 0, 0)
      formattedTime = format(dateWithTime, use24HourFormat ? 'HH:mm' : 'h:mm a')
    } catch {
      formattedTime = event.eventTime
    }
  }

  // Statutory remaining days calculation
  const today = startOfDay(new Date())
  const diffDays = differenceInCalendarDays(eventDateObj, today)
  const isCompleted = event.executionStatus === 'completed'

  const handleToggleCompletion = async () => {
    try {
      await setMilestoneCompletion({
        pathParams: {
          scheduleId: event.scheduleId,
          milestoneId: event.milestoneId,
        },
        payload: {
          bacResolutionId: event.bacResolutionId,
          scheduleId: event.scheduleId,
          milestoneId: event.milestoneId,
          completed: !isCompleted,
        },
      })
      toast.success(
        isCompleted
          ? 'Milestone marked as pending'
          : 'Milestone marked as completed',
      )
      closeEventModal()
    } catch {
      toast.error('Failed to update milestone status')
    }
  }

  const handleExpandDrawer = () => {
    closeEventModal()
    openDrawer(event)
  }

  return (
    <Dialog open={Boolean(selectedEventForModal)} onOpenChange={(open) => !open && closeEventModal()}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Color accent header strip */}
        <div className={cn('h-3.5 w-full', palette.solid)} />

        <div className="p-5 space-y-4">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('font-bold text-xs', palette.badge)}>
                {event.bacResolutionNumber || 'BAC Project'}
              </Badge>
              <Badge variant="secondary" className="capitalize text-xs font-semibold">
                {event.procurementCategory}
              </Badge>
              {isCompleted ? (
                <Badge className="bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              ) : diffDays < 0 ? (
                <Badge color="destructive" className="font-semibold text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue by {Math.abs(diffDays)}d
                </Badge>
              ) : diffDays <= 3 ? (
                <Badge className="bg-amber-600 text-white font-semibold text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due in {diffDays === 0 ? 'Today' : `${diffDays}d`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  In {diffDays} days
                </Badge>
              )}
            </div>

            <DialogTitle className="text-lg font-bold text-foreground leading-snug pt-1">
              {event.milestoneName}
            </DialogTitle>

            <DialogDescription className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 shrink-0" />
              <span>{event.primaryProjectName}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Key Details Card */}
          <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">Scheduled Date:</span>
              </div>
              <span className="font-bold text-foreground">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">Session Time:</span>
              </div>
              <span className="font-bold text-foreground">{formattedTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">Venue / Office:</span>
              </div>
              <span className="font-semibold text-foreground">{event.officeLabel || 'BAC Secretariat'}</span>
            </div>

            {event.startDate && event.endDate && event.startDate !== event.endDate && (
              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Layers className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Duration Phase:</span>
                </div>
                <span className="font-bold text-foreground">
                  {format(parseISO(event.startDate), 'MMM d')} – {format(parseISO(event.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              size="sm"
              disabled={isUpdatingStatus}
              onClick={handleToggleCompletion}
              className="w-full justify-center text-xs font-semibold h-9"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isCompleted ? 'Mark Milestone as Incomplete' : 'Mark Milestone as Completed'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandDrawer}
              className="w-full justify-between text-xs font-semibold h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Open Comprehensive 7-Tab Project Drawer</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-5 py-3 flex sm:justify-between items-center">
          <span className="text-[11px] text-muted-foreground">
            RA 9184 Statutory Tracking
          </span>
          <Button variant="ghost" size="sm" onClick={closeEventModal} className="text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
