import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCalendarV2 } from '../contexts/calendar-context'
import { useUpdateMilestone } from '../../bidding-schedule/handlers/hooks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CascadeRescheduleModalV2() {
  const { cascadeModalData, closeCascadeModal } = useCalendarV2()
  const { mutateAsync: updateMilestone, isPending } = useUpdateMilestone()

  const [rescheduleMode, setRescheduleMode] = useState<'cascade' | 'single'>('cascade')
  const [reason, setReason] = useState('')

  if (!cascadeModalData) return null

  const { draggedEvent, originalDate, newDate, dateDeltaDays, affectedMilestones } =
    cascadeModalData

  const origDateObj = parseISO(originalDate.split('T')[0])
  const newDateObj = parseISO(newDate.split('T')[0])

  const deltaText =
    dateDeltaDays > 0 ? `+${dateDeltaDays} days later` : `${dateDeltaDays} days earlier`

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a reason for rescheduling.')
      return
    }

    try {
      await updateMilestone({
        pathParams: {
          scheduleId: draggedEvent.scheduleId,
          milestoneId: draggedEvent.milestoneId,
        },
        payload: {
          bacResolutionId: draggedEvent.bacResolutionId,
          scheduleId: draggedEvent.scheduleId,
          milestoneId: draggedEvent.milestoneId,
          overrideDate: newDate,
          time: draggedEvent.eventTime,
          reason: `[${rescheduleMode.toUpperCase()}] ${reason.trim()}`,
        },
      })

      toast.success(
        rescheduleMode === 'cascade'
          ? `Milestone shifted and ${affectedMilestones.length} downstream activities cascaded!`
          : `Milestone rescheduled to ${format(newDateObj, 'MMM d, yyyy')}`,
      )
      closeCascadeModal()
    } catch {
      toast.error('Failed to reschedule milestone')
    }
  }

  return (
    <Dialog open={Boolean(cascadeModalData)} onOpenChange={(open) => !open && closeCascadeModal()}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold bg-amber-50 text-amber-900 border-amber-300">
              Reschedule Confirmation
            </Badge>
            <Badge variant="secondary" className="text-xs font-bold">
              {deltaText}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Reschedule {draggedEvent.milestoneName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Project: <span className="font-semibold text-foreground">{draggedEvent.primaryProjectName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Date Shift Visualization */}
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-500 font-medium">Original Date</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {format(origDateObj, 'EEE, MMM d, yyyy')}
            </p>
          </div>

          <div className="flex items-center px-3 text-primary">
            <ArrowRight className="h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-slate-500 font-medium">New Target Date</span>
            <p className="font-bold text-primary">
              {format(newDateObj, 'EEE, MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Reschedule Mode Radio */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">Adjustment Policy</Label>
          <RadioGroup
            value={rescheduleMode}
            onValueChange={(val) => setRescheduleMode(val as 'cascade' | 'single')}
            className="grid grid-cols-2 gap-2"
          >
            <div
              onClick={() => setRescheduleMode('cascade')}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors',
                rescheduleMode === 'cascade'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border/70 hover:bg-muted/40',
              )}
            >
              <RadioGroupItem value="cascade" id="mode-cascade" className="mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="mode-cascade" className="text-xs font-bold cursor-pointer">
                  Cascade Future
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Shift all {affectedMilestones.length} downstream milestones to keep RA 9184 gaps.
                </p>
              </div>
            </div>

            <div
              onClick={() => setRescheduleMode('single')}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors',
                rescheduleMode === 'single'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border/70 hover:bg-muted/40',
              )}
            >
              <RadioGroupItem value="single" id="mode-single" className="mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="mode-single" className="text-xs font-bold cursor-pointer">
                  Single Override
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Shift only this milestone without moving subsequent dates.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Cascade Preview List */}
        {rescheduleMode === 'cascade' && affectedMilestones.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Impacted Downstream Milestones ({affectedMilestones.length})</span>
              <span className="text-[10px] text-primary">Auto-shifted by {deltaText}</span>
            </Label>
            <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border bg-background p-2">
              {affectedMilestones.map((m) => (
                <div
                  key={m.milestoneId}
                  className="flex items-center justify-between text-[11px] py-1 px-1.5 rounded hover:bg-muted/50"
                >
                  <span className="font-medium truncate max-w-[200px] text-slate-700 dark:text-slate-300">
                    {m.milestoneName}
                  </span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{format(parseISO(m.originalDate.split('T')[0]), 'MMM d')}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-bold text-foreground">
                      {format(parseISO(m.computedNewDate.split('T')[0]), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reason Input */}
        <div className="space-y-1.5">
          <Label htmlFor="reschedule-reason" className="text-xs font-bold text-foreground flex items-center gap-1">
            <span>Reason for Rescheduling</span>
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reschedule-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Quorum unavailable due to official emergency / Declared local non-working holiday"
            className="text-xs"
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end border-t pt-3">
          <Button variant="outline" size="sm" onClick={closeCascadeModal} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isPending || !reason.trim()}
            onClick={handleConfirm}
            className="text-xs font-semibold"
          >
            {isPending ? 'Applying Changes...' : 'Confirm & Apply Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
