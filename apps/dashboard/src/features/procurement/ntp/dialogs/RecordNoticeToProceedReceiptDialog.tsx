/**
 * Record Notice to Proceed Receipt Dialog
 * Captures contractor's receipt (conforme) with name, designation, and date.
 */

import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import type { NoticeToProceedDetail } from '../types/ntpTypes'

export interface RecordNoticeToProceedReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NoticeToProceedDetail
  onConfirm: (payload: {
    receivedAt: string
    receivedByName: string
    receivedDate: string
    conformeName: string
    conformeDesignation: string
    conformeDate: string
    remarks?: string
  }) => Promise<void>
  isSubmitting?: boolean
}

export function RecordNoticeToProceedReceiptDialog({
  open,
  onOpenChange,
  ntp,
  onConfirm,
  isSubmitting = false,
}: RecordNoticeToProceedReceiptDialogProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [receivedDate, setReceivedDate] = useState(todayStr)
  const [conformeDate, setConformeDate] = useState(todayStr)
  const [conformeName, setConformeName] = useState('')
  const [conformeDesignation, setConformeDesignation] = useState('')
  const [remarks, setRemarks] = useState('')

  const isValid =
    receivedDate.trim().length > 0 &&
    conformeDate.trim().length > 0 &&
    conformeName.trim().length > 0 &&
    conformeDesignation.trim().length > 0

  const handleRecord = async () => {
    if (!isValid) return
    const fullName = conformeDesignation.trim()
      ? `${conformeName.trim()} (${conformeDesignation.trim()})`
      : conformeName.trim()

    await onConfirm({
      receivedAt: receivedDate,
      receivedByName: fullName,
      receivedDate,
      conformeDate,
      conformeName: conformeName.trim(),
      conformeDesignation: conformeDesignation.trim(),
      remarks: remarks.trim() || undefined,
    })
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
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleRecord}
        disabled={isSubmitting || !isValid}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
      >
        {isSubmitting ? 'Recording...' : 'Record Conforme'}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record Supplier Conforme / Receipt"
      description="Acknowledge receipt and acceptance of Notice to Proceed by the authorized contractor representative."
      size="md"
      footer={footer}
    >
      <div className="space-y-3.5 py-2 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="received-date" className="text-xs font-semibold">
              Receipt Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="received-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="conforme-date" className="text-xs font-semibold">
              Conforme Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="conforme-date"
              type="date"
              value={conformeDate}
              onChange={(e) => setConformeDate(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="conforme-name" className="text-xs font-semibold">
            Authorized Representative Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="conforme-name"
            placeholder="e.g. Juan dela Cruz"
            value={conformeName}
            onChange={(e) => setConformeName(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="conforme-designation" className="text-xs font-semibold">
            Designation / Position <span className="text-destructive">*</span>
          </Label>
          <Input
            id="conforme-designation"
            placeholder="e.g. Authorized Managing Officer / Project Manager"
            value={conformeDesignation}
            onChange={(e) => setConformeDesignation(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="conforme-remarks" className="text-xs font-semibold">
            Remarks (Optional)
          </Label>
          <Textarea
            id="conforme-remarks"
            placeholder="Additional delivery instructions or notes..."
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="text-xs resize-none"
          />
        </div>
      </div>
    </ResponsiveDialog>
  )
}
