/**
 * MopOverrideDialog
 * Dialog for overriding the system-suggested Mode of Procurement on a line item.
 * Requires a justification text (10–500 chars).
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  MopJustificationForm,
  type MopJustificationFormValues,
} from '../forms'
import {
  mopOverrideDialogOpenAtom,
  targetLineItemIdForMopAtom,
  selectedPpmpForEditAtom,
} from '../atoms'
import { updateLineItemMoPRequest } from '../handlers'

interface MopOverrideDialogProps {
  onSuccess?: () => void
}

export function MopOverrideDialog({ onSuccess }: MopOverrideDialogProps) {
  const [open, setOpen] = useAtom(mopOverrideDialogOpenAtom)
  const targetItemId = useAtomValue(targetLineItemIdForMopAtom)
  const clearTarget = useSetAtom(targetLineItemIdForMopAtom)
  const ppmp = useAtomValue(selectedPpmpForEditAtom)
  const [isLoading, setIsLoading] = useState(false)

  // Find the target line item from the current PPMP
  const lineItem = ppmp?.activityBlocks
    ?.flatMap((a) => a.ioEBlocks)
    ?.flatMap((b) => b.items)
    ?.find((i) => i.id === targetItemId)

  const handleSubmit = async (data: MopJustificationFormValues) => {
    if (!ppmp || !lineItem) return
    setIsLoading(true)
    try {
      await toast.promise(
        updateLineItemMoPRequest.fetcher({
          data: {
            ppmpId: ppmp.id,
            itemId: lineItem.id,
            mopOverride: data.mopOverride,
            mopJustification: data.mopJustification,
          },
        }),
        {
          loading: 'Updating Mode of Procurement...',
          success: () => {
            onSuccess?.()
            handleClose()
            return 'Mode of Procurement updated.'
          },
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to update MoP.',
        },
      )
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    clearTarget(null)
    setOpen(false)
  }

  if (!lineItem) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(v) => { if (!v) handleClose() }}
      title="Override Mode of Procurement"
      description={`Item: ${lineItem.itemName}`}
      size="md"
      showCloseButton
    >
      <MopJustificationForm
        suggestedMoP={lineItem.suggestedMoP}
        currentOverride={lineItem.mopOverride}
        currentJustification={lineItem.mopJustification}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isLoading}
      />
    </ResponsiveDialog>
  )
}
