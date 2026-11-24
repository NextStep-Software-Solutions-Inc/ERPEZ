/**
 * AmendmentDialog
 * Dialog for starting a mid-year amendment on an Approved PPMP.
 * Requires a reason (20–500 chars), then clones PPMP as v2 in Amending state.
 */

import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { AmendmentReasonForm, type AmendmentReasonFormValues } from '../forms'
import { amendmentDialogOpenAtom, selectedPpmpForEditAtom } from '../atoms'
import { createAmendmentRequest } from '../handlers'

interface AmendmentDialogProps {
  onSuccess?: () => void
}

export function AmendmentDialog({ onSuccess }: AmendmentDialogProps) {
  const [open, setOpen] = useAtom(amendmentDialogOpenAtom)
  const ppmp = useAtomValue(selectedPpmpForEditAtom)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setSelected = useSetAtom(selectedPpmpForEditAtom)

  const handleSubmit = async (data: AmendmentReasonFormValues) => {
    if (!ppmp) return
    setIsLoading(true)
    try {
      const amendment = await createAmendmentRequest.fetcher({
        data: {
          ppmpId: ppmp.id,
          reason: data.reason,
        },
      })
      toast.success(
        `Amendment v${amendment.amendmentVersion} created. You can now edit the items.`,
      )
      onSuccess?.()
      setOpen(false)
      // store the created amendment so the workspace can use it immediately
      setSelected(amendment)
      navigate({
        to: '/v2/ppmp/$ppmpId',
        params: { ppmpId: amendment.id },
        search: {},
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create amendment.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => setOpen(false)

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
      title="Create Amendment"
      description={ppmp ? `Creating amendment for: ${ppmp.documentName}` : ''}
      size="md"
      showCloseButton
    >
      <AmendmentReasonForm
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isLoading}
      />
    </ResponsiveDialog>
  )
}
