import { useEffect, useState, type FormEvent } from 'react'
import { format, parseISO, isBefore, isWeekend } from 'date-fns'
import { CalendarIcon, History } from 'lucide-react'
import { z } from 'zod'
import type {
  BiddingMilestone,
  BiddingSchedule,
  UpdateMilestonePayload,
} from '../types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// ─── Validation schema ────────────────────────────────────────────────────────

export const editMilestoneSchema = z.object({
  overrideDate: z.string().min(1, 'A date is required.'),
  time: z.string().nullable(),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters.')
    .max(500, 'Reason must be 500 characters or fewer.'),
})

export type EditMilestoneFormValues = z.infer<typeof editMilestoneSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditMilestoneFormProps {
  formId: string
  schedule: BiddingSchedule
  milestone: BiddingMilestone
  currentUser: string
  onSubmit: (payload: UpdateMilestonePayload) => Promise<void> | void
  onDirtyChange?: (isDirty: boolean) => void
  isLoading?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditMilestoneForm({
  formId,
  schedule,
  milestone,
  currentUser,
  onSubmit,
  onDirtyChange,
  isLoading = false,
}: EditMilestoneFormProps) {
  // Derive initial values
  const initialDate = milestone.overrideDate ?? milestone.computedDate
  const initialTime = milestone.time ?? ''

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    try {
      return parseISO(initialDate)
    } catch {
      return undefined
    }
  })
  const [timeValue, setTimeValue] = useState(initialTime)
  const [reason, setReason] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Validation error state
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditMilestoneFormValues, string>>
  >({})
  const [submitted, setSubmitted] = useState(false)

  // Compute dirty state
  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const isDirty =
    dateString !== initialDate ||
    timeValue !== initialTime ||
    reason.trim().length > 0

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Determine minimum allowable date from previous milestone if available
  const previousMilestone =
    milestone.order > 0 ? schedule.milestones[milestone.order - 1] : undefined
  const minDate = previousMilestone
    ? parseISO(previousMilestone.overrideDate ?? previousMilestone.computedDate)
    : undefined

  const isDateDisabled = (date: Date) => {
    if (isWeekend(date)) return true
    if (minDate && isBefore(date, minDate)) return true
    return false
  }

  // Validate and collect errors
  function validate(): boolean {
    const result = editMilestoneSchema.safeParse({
      overrideDate: dateString,
      time: timeValue || null,
      reason,
    })

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof EditMilestoneFormValues, string>
      > = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof EditMilestoneFormValues
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()

    setSubmitted(true)
    if (!validate()) return

    const payload: UpdateMilestonePayload = {
      bacResolutionId: schedule.bacResolutionId,
      scheduleId: schedule.id,
      milestoneId: milestone.id,
      overrideDate: dateString,
      time: timeValue || null,
      reason,
      editedBy: currentUser,
    }

    void onSubmit(payload)
  }

  // Re-validate on change after first submit attempt
  useEffect(() => {
    if (submitted) validate()
  }, [dateString, timeValue, reason, submitted])

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Milestone info */}
      <div className="rounded-md border border-default-200 bg-default-50 px-4 py-3 text-sm">
        <p className="font-medium text-default-800">{milestone.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Suggested date:{' '}
          <span className="font-mono">
            {format(parseISO(milestone.computedDate), 'MMM d, yyyy')}
          </span>
          {milestone.overrideDate && (
            <>
              {' '}
              · Current override:{' '}
              <span className="font-mono">
                {format(parseISO(milestone.overrideDate), 'MMM d, yyyy')}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Override date — Calendar picker */}
      <div className="grid gap-2">
        <Label htmlFor={`${formId}-date`}>
          Override Date <span className="text-destructive">*</span>
        </Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${formId}-date`}
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
                errors.overrideDate && 'border-destructive',
              )}
              disabled={isLoading}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selectedDate ? (
                format(selectedDate, 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setCalendarOpen(false)
              }}
              disabled={isDateDisabled}
              defaultMonth={selectedDate ?? minDate ?? new Date()}
            />
          </PopoverContent>
        </Popover>
        {errors.overrideDate && (
          <p className="text-xs text-destructive">{errors.overrideDate}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Dates on weekends are disabled. Downstream milestones will cascade automatically.
        </p>
      </div>

      {/* Time */}
      <div className="grid gap-2">
        <Label htmlFor={`${formId}-time`}>Time (optional)</Label>
        <Input
          id={`${formId}-time`}
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          disabled={isLoading}
          className="w-48"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to keep no specific time.
        </p>
      </div>

      {/* Reason */}
      <div className="grid gap-2">
        <Label htmlFor={`${formId}-reason`}>
          Reason for Change <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`${formId}-reason`}
          placeholder="Describe why this date is being overridden (minimum 5 characters)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={isLoading}
          className={cn(errors.reason && 'border-destructive')}
        />
        <div className="flex justify-between">
          {errors.reason ? (
            <p className="text-xs text-destructive">{errors.reason}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground">{reason.length}/500</p>
        </div>
      </div>

      {/* Edit History (Audit Log) */}
      {milestone.editHistory.length > 0 && (
        <div className="rounded-md border border-default-200 bg-muted/30 p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-medium text-default-700">
            <History className="h-3.5 w-3.5" />
            <span>Edit History ({milestone.editHistory.length})</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {milestone.editHistory.map((entry, idx) => (
              <div key={idx} className="border-b border-default-100 pb-1 last:border-0">
                <span className="font-semibold">{entry.editedBy || 'User'}</span> changed from{' '}
                <span className="font-mono">{entry.originalDate}</span> to{' '}
                <span className="font-mono">{entry.newDate}</span>: &ldquo;{entry.reason}&rdquo;
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
