import { useState } from 'react'
import { useUpdateMilestone } from '../handlers/hooks'
import { EditMilestoneForm } from '../forms/EditMilestoneForm'
import type { BiddingMilestone, BiddingSchedule, UpdateMilestonePayload } from '../types'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface EditMilestoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: BiddingSchedule
  milestone: BiddingMilestone
  currentUser: string
  onSuccess?: () => void
}

const FORM_ID = 'edit-milestone-form'

export function EditMilestoneDialog({
  open,
  onOpenChange,
  schedule,
  milestone,
  currentUser,
  onSuccess,
}: EditMilestoneDialogProps) {
  const { mutateAsync: updateMilestone, isPending } = useUpdateMilestone()

  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }
    onOpenChange(nextOpen)
  }

  const handleDiscard = () => {
    setShowDiscardWarning(false)
    setIsDirty(false)
    onOpenChange(false)
  }

  const handleSubmit = async (payload: UpdateMilestonePayload) => {
    await updateMilestone(payload)
    setIsDirty(false)
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Edit Milestone Date"
        description={`Override the computed date for "${milestone.name}". This change will cascade to downstream milestones.`}
        size="lg"
        showCloseButton
        onPointerDownOutside={(e) => {
          if (isDirty) {
            e.preventDefault()
            setShowDiscardWarning(true)
          }
        }}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              form={FORM_ID}
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Saving…' : 'Save Override'}
            </Button>
          </div>
        }
      >
        <EditMilestoneForm
          formId={FORM_ID}
          schedule={schedule}
          milestone={milestone}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onDirtyChange={setIsDirty}
          isLoading={isPending}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this milestone override. Do you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={handleDiscard}
      />
    </>
  )
}
