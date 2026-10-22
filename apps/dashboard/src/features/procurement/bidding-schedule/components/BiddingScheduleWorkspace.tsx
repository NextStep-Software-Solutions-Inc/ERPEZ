import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarPlus, CalendarRange, Clock, AlertCircle } from 'lucide-react'
import {
  useBiddingSchedule,
  useGenerateSchedule,
  useRegenerateSchedule,
  useConfirmSchedule,
  useLockSchedule,
  useSetMilestoneCompletion,
} from '../handlers/hooks'
import type {
  BiddingMilestone,
  BiddingSchedule,
} from '../types'
import type { BacResolutionListRoutePath } from '../../bac-resolution/types'
import { BiddingScheduleActionBar } from './BiddingScheduleActionBar'
import { BiddingScheduleLockedBanner } from './BiddingScheduleLockedBanner'
import { BiddingScheduleMilestoneTable } from './BiddingScheduleMilestoneTable'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'
import { ProcurementCategoryChip } from './ProcurementCategoryChip'
import { DialogsController } from './DialogsController'
import type { GenerateScheduleFormValues } from '../forms/GenerateScheduleForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface BiddingScheduleWorkspaceProps {
  bacResolutionId: string
  highlightMilestoneKey?: string
  bacListRoutePath?: BacResolutionListRoutePath
}

function formatDateLabel(isoDate: string) {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy')
  } catch {
    return isoDate
  }
}

function formatDateTimeLabel(isoTs: string) {
  try {
    return format(parseISO(isoTs), 'MMM d, yyyy h:mm a')
  } catch {
    return isoTs
  }
}

export function BiddingScheduleWorkspace({
  bacResolutionId,
  highlightMilestoneKey,
  bacListRoutePath = '/v2/bac-resolutions',
}: BiddingScheduleWorkspaceProps) {
  const {
    data: scheduleResponse,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useBiddingSchedule({
    pathParams: { resolutionId: bacResolutionId },
  })

  const schedule: BiddingSchedule | null = scheduleResponse?.data ?? null

  const { mutateAsync: generateSchedule, isPending: isGenerating } =
    useGenerateSchedule()
  const { mutateAsync: regenerateSchedule, isPending: isRegenerating } =
    useRegenerateSchedule()
  const { mutateAsync: confirmSchedule, isPending: isConfirming } =
    useConfirmSchedule()
  const { mutateAsync: lockSchedule, isPending: isLocking } =
    useLockSchedule()
  const { mutateAsync: setMilestoneCompletion, isPending: isCompleting } =
    useSetMilestoneCompletion()

  // Dialog States
  const [generateOpen, setGenerateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)

  const [selectedMilestone, setSelectedMilestone] =
    useState<BiddingMilestone | null>(null)
  const [targetCompletionStatus, setTargetCompletionStatus] =
    useState<boolean>(true)

  const isSubmitting =
    isGenerating ||
    isRegenerating ||
    isConfirming ||
    isLocking ||
    isCompleting

  // Handlers
  const handleOpenEdit = (milestone: BiddingMilestone) => {
    setSelectedMilestone(milestone)
    setEditOpen(true)
  }

  const handleOpenToggleCompletion = (
    milestone: BiddingMilestone,
    completed: boolean,
  ) => {
    setSelectedMilestone(milestone)
    setTargetCompletionStatus(completed)
    setCompleteOpen(true)
  }

  const handleCreateSchedule = async (values: GenerateScheduleFormValues) => {
    await generateSchedule({
      pathParams: { resolutionId: bacResolutionId },
      payload: {
        bacResolutionId,
        ibPostingDate: values.ibPostingDate,
        procurementCategory: values.procurementCategory,
      },
    })
    setGenerateOpen(false)
  }

  const handleRegenerateSchedule = async (
    values: GenerateScheduleFormValues,
  ) => {
    await regenerateSchedule({
      pathParams: { resolutionId: bacResolutionId },
      payload: {
        bacResolutionId,
        ibPostingDate: values.ibPostingDate,
        procurementCategory: values.procurementCategory,
      },
    })
    setGenerateOpen(false)
  }

  const handleConfirmSchedule = async () => {
    if (!schedule) return
    await confirmSchedule({
      pathParams: { scheduleId: schedule.id },
      payload: {
        bacResolutionId,
        scheduleId: schedule.id,
      },
    })
    setConfirmOpen(false)
  }

  const handleLockSchedule = async () => {
    if (!schedule) return
    await lockSchedule({
      pathParams: { scheduleId: schedule.id },
      payload: {
        bacResolutionId,
        scheduleId: schedule.id,
      },
    })
    setLockOpen(false)
  }

  const handleToggleComplete = async () => {
    if (!schedule || !selectedMilestone) return
    await setMilestoneCompletion({
      pathParams: {
        scheduleId: schedule.id,
        milestoneId: selectedMilestone.id,
      },
      payload: {
        bacResolutionId,
        scheduleId: schedule.id,
        milestoneId: selectedMilestone.id,
        completed: targetCompletionStatus,
      },
    })
    setCompleteOpen(false)
  }

  if (isScheduleLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (scheduleError) {
    return (
      <Alert variant="outline" color="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load bidding schedule</AlertTitle>
        <AlertDescription>
          {scheduleError instanceof Error
            ? scheduleError.message
            : 'An unexpected error occurred while retrieving schedule information.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Schedule locked banner */}
      {schedule?.status === 'locked' &&
        schedule.lockedAt &&
        schedule.lockedBy && (
          <BiddingScheduleLockedBanner
            lockedAt={schedule.lockedAt}
            lockedBy={schedule.lockedBy}
          />
        )}

      {!schedule ? (
        /* Empty State when no schedule exists yet */
        <Card className="border border-dashed border-default-300 bg-default-50/50 shadow-none">
          <CardHeader className="text-center py-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <CalendarRange className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              No Bidding Schedule Generated Yet
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-sm text-muted-foreground mt-1">
              Generate a legally compliant RA 9184 bidding calendar by specifying the intended Invitation to Bid (IB) posting date.
            </CardDescription>
            <div className="pt-4">
              <Button
                onClick={() => setGenerateOpen(true)}
                className="gap-2"
                disabled={isSubmitting}
              >
                <CalendarPlus className="h-4 w-4" />
                Generate Schedule
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        /* Schedule Workspace Card */
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between border-b border-default-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Bidding Activity Timeline
                </CardTitle>
                <ScheduleStatusBadge status={schedule.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <ProcurementCategoryChip
                  category={schedule.procurementCategory}
                />
                <Badge variant="outline" className="font-mono text-xs">
                  <Clock className="mr-1 h-3 w-3 inline" />
                  IB Posting: {formatDateLabel(schedule.ibPostingDate)}
                </Badge>
                {schedule.confirmedAt && (
                  <span>
                    Confirmed on {formatDateTimeLabel(schedule.confirmedAt)}
                  </span>
                )}
              </div>
            </div>

            <BiddingScheduleActionBar
              schedule={schedule}
              onConfirm={() => setConfirmOpen(true)}
              onLock={() => setLockOpen(true)}
              onRegenerate={() => setGenerateOpen(true)}
              isLoading={isSubmitting}
              bacListRoutePath={bacListRoutePath}
            />
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <BiddingScheduleMilestoneTable
              schedule={schedule}
              onEditMilestone={handleOpenEdit}
              onToggleMilestoneCompletion={handleOpenToggleCompletion}
              highlightMilestoneKey={highlightMilestoneKey}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs Controller */}
      <DialogsController
        schedule={schedule}
        selectedMilestone={selectedMilestone}
        currentUser="Procurement Officer"
        generateOpen={generateOpen}
        setGenerateOpen={setGenerateOpen}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        lockOpen={lockOpen}
        setLockOpen={setLockOpen}
        completeOpen={completeOpen}
        setCompleteOpen={setCompleteOpen}
        targetCompletionStatus={targetCompletionStatus}
        onGenerate={handleCreateSchedule}
        onRegenerate={handleRegenerateSchedule}
        onConfirm={handleConfirmSchedule}
        onLock={handleLockSchedule}
        onToggleComplete={handleToggleComplete}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
