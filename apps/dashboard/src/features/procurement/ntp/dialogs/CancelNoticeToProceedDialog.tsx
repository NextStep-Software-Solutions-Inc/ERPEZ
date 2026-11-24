/**
 * Cancel Notice to Proceed Dialog
 * Cancels an NTP with mandatory justification under RA 12009.
 */

import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { NoticeToProceedDetail } from '../types/ntpTypes'

export interface CancelNoticeToProceedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NoticeToProceedDetail
  onConfirm: (reason: string) => Promise<void>
  isSubmitting?: boolean
}

export function CancelNoticeToProceedDialog({
  open,
  onOpenChange,
  ntp,
  onConfirm,
  isSubmitting = false,
}: CancelNoticeToProceedDialogProps) {
  const [reason, setReason] = useState('')

  const isValid = reason.trim().length >= 5

  const handleCancel = async () => {
    if (!isValid) return
    await onConfirm(reason.trim())
  }

  const footer = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="text-xs"
      >
        Back
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleCancel}
        disabled={isSubmitting || !isValid}
        className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold"
      >
        {isSubmitting ? 'Cancelling NTP...' : 'Confirm Cancellation'}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Notice to Proceed"
      description="Cancelling this NTP will record it as cancelled in the audit log and release the contract for potential re-issuance."
      size="md"
      footer={footer}
    >
      <div className="space-y-3 py-2 text-xs">
        <div className="space-y-1">
          <Label htmlFor="cancel-reason" className="text-xs font-semibold">
            Cancellation Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            placeholder="State the formal legal or procedural justification for cancellation..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Minimum 5 characters required for administrative audit.
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
