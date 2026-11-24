import { ConfirmScheduleDialog } from '../dialogs/ConfirmScheduleDialog'
import { EditMilestoneDialog } from '../dialogs/EditMilestoneDialog'
import { GenerateScheduleDialog } from '../dialogs/GenerateScheduleDialog'
import { LockScheduleDialog } from '../dialogs/LockScheduleDialog'
import { MilestoneCompletionConfirmDialog } from '../dialogs/MilestoneCompletionConfirmDialog'
import type { GenerateScheduleFormValues } from '../forms/GenerateScheduleForm'
import type { BiddingMilestone, BiddingSchedule } from '../types'

interface DialogsControllerProps {
  schedule: BiddingSchedule | null
  selectedMilestone: BiddingMilestone | null
  currentUser: string
  generateOpen: boolean
  setGenerateOpen: (open: boolean) => void
  editOpen: boolean
  setEditOpen: (open: boolean) => void
  confirmOpen: boolean
  setConfirmOpen: (open: boolean) => void
  lockOpen: boolean
  setLockOpen: (open: boolean) => void
  completeOpen: boolean
  setCompleteOpen: (open: boolean) => void
  targetCompletionStatus: boolean
  onGenerate: (values: GenerateScheduleFormValues) => Promise<void> | void
  onRegenerate: (values: GenerateScheduleFormValues) => Promise<void> | void
  onConfirm: () => Promise<void> | void
  onLock: () => Promise<void> | void
  onToggleComplete: () => Promise<void> | void
  isSubmitting?: boolean
}

export function DialogsController({
  schedule,
  selectedMilestone,
  currentUser,
  generateOpen,
  setGenerateOpen,
  editOpen,
  setEditOpen,
  confirmOpen,
  setConfirmOpen,
  lockOpen,
  setLockOpen,
  completeOpen,
  setCompleteOpen,
  targetCompletionStatus,
  onGenerate,
  onRegenerate,
  onConfirm,
  onLock,
  onToggleComplete,
  isSubmitting = false,
}: DialogsControllerProps) {
  const mode = schedule?.status === 'draft' ? 'regenerate' : 'generate'
  const scheduleModeHandler = mode === 'regenerate' ? onRegenerate : onGenerate

  return (
    <>
      <GenerateScheduleDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        mode={mode}
        onSubmit={scheduleModeHandler}
        isSubmitting={isSubmitting}
      />

      {schedule && selectedMilestone && schedule.status === 'draft' && (
        <EditMilestoneDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          schedule={schedule}
          milestone={selectedMilestone}
          currentUser={currentUser}
        />
      )}

      <ConfirmScheduleDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={onConfirm}
        isLoading={isSubmitting}
      />

      <LockScheduleDialog
        open={lockOpen}
        onOpenChange={setLockOpen}
        onConfirm={onLock}
        isLoading={isSubmitting}
      />

      <MilestoneCompletionConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        milestone={selectedMilestone}
        completed={targetCompletionStatus}
        onConfirm={onToggleComplete}
        isLoading={isSubmitting}
      />
    </>
  )
}
