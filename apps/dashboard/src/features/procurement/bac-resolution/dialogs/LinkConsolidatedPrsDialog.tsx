import { useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { LinkConsolidatedPrsPayload } from '../types'
import { LinkConsolidatedPrsForm } from '../forms/LinkConsolidatedPrsForm'
import type { LinkableConsolidatedPr } from '../utils/bacResolutionWorkflow'

interface LinkConsolidatedPrsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bacResolutionId: string
  resolutionNumber: string
  availablePrs: LinkableConsolidatedPr[]
  selectedId: string | null
  onLink: (values: LinkConsolidatedPrsPayload) => Promise<void> | void
  onViewDetails?: (id: string) => void
}

export function LinkConsolidatedPrsDialog({
  open,
  onOpenChange,
  bacResolutionId,
  resolutionNumber,
  availablePrs,
  selectedId,
  onLink,
  onViewDetails,
}: LinkConsolidatedPrsDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const formId = 'link-consolidated-prs-form'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Add Consolidated PR"
        description={`Link exactly one approved Consolidated PR to ${resolutionNumber}.`}
        size="4xl"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button form={formId} type="submit">
              Save linked PR
            </Button>
          </div>
        }
      >
        <LinkConsolidatedPrsForm
          formId={formId}
          bacResolutionId={bacResolutionId}
          availablePrs={availablePrs}
          initialSelectedId={selectedId}
          onSubmit={onLink}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
          onViewDetails={onViewDetails}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard PR selection?"
        description="You have unsaved Consolidated PR selections. Do you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          setIsDirty(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
export default LinkConsolidatedPrsDialog
