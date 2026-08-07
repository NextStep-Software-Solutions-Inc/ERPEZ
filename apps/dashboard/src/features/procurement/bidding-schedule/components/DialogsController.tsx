import { ConfirmScheduleDialog } from '../dialogs/ConfirmScheduleDialog'
import { EditMilestoneDialog } from '../dialogs/EditMilestoneDialog'
import { GenerateScheduleDialog } from '../dialogs/GenerateScheduleDialog'
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
  onGenerate: (values: GenerateScheduleFormValues) => Promise<void> | void
  onRegenerate: (values: GenerateScheduleFormValues) => Promise<void> | void
  onConfirm: () => Promise<void> | void
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
  onGenerate,
  onRegenerate,
  onConfirm,
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
      />

      {schedule && selectedMilestone && (
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
      />
    </>
  )
}
