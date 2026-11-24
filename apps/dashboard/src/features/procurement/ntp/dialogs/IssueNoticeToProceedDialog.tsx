/**
 * Issue Notice to Proceed Dialog
 * Approves and issues an NTP under RA 12009 Section 66, freezing contractual snapshots.
 */

import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { NoticeToProceedDetail } from '../types/ntpTypes'

export interface IssueNoticeToProceedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NoticeToProceedDetail
  onConfirm: (payload: { issuedDate?: string; remarks?: string }) => Promise<void>
  isSubmitting?: boolean
}

export function IssueNoticeToProceedDialog({
  open,
  onOpenChange,
  ntp,
  onConfirm,
  isSubmitting = false,
}: IssueNoticeToProceedDialogProps) {
  const [issuedDate, setIssuedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [remarks, setRemarks] = useState('')

  const handleIssue = async () => {
    await onConfirm({
      issuedDate: issuedDate || undefined,
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
        onClick={handleIssue}
        disabled={isSubmitting || !issuedDate}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
      >
        {isSubmitting ? 'Issuing NTP...' : 'Confirm & Issue NTP'}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Issue Notice to Proceed"
      description="Issuing this NTP officially authorizes the supplier to commence work under the contract."
      size="md"
      footer={footer}
    >
      <div className="space-y-4 py-2 text-xs">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Freezing Contractual Snapshots</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Upon issuance, Contract Number, Supplier Name, Supplier Address, Awarded Amount, and Project Title will be frozen as historical snapshots.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue-date" className="text-xs font-semibold">
            Date of Issuance
          </Label>
          <Input
            id="issue-date"
            type="date"
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
            disabled={isSubmitting}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue-remarks" className="text-xs font-semibold">
            Issuance Remarks (Optional)
          </Label>
          <Textarea
            id="issue-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter any specific transmittal or dispatch remarks..."
            className="text-xs"
          />
        </div>
      </div>
    </ResponsiveDialog>
  )
}
