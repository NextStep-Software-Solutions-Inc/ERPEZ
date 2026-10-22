/**
 * ReturnPPMPDialog
 * Modal dialog for returning a submitted PPMP to the requesting office with feedback notes.
 */

import { useState } from 'react'
import { AlertCircle, Undo2, Building2, CalendarDays, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { PPMP, PPMPDetails } from '../types'

interface ReturnPPMPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ppmp: PPMP | PPMPDetails | null
  isSubmitting?: boolean
  onConfirm: (remarks: string) => void | Promise<void>
}

export function ReturnPPMPDialog({
  open,
  onOpenChange,
  ppmp,
  isSubmitting = false,
  onConfirm,
}: ReturnPPMPDialogProps) {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!ppmp) return null

  const handleClose = () => {
    if (isSubmitting) return
    setRemarks('')
    setError(null)
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    const trimmed = remarks.trim()
    if (!trimmed) {
      setError('Please provide feedback explaining why this PPMP is being returned.')
      return
    }
    setError(null)
    await onConfirm(trimmed)
    setRemarks('')
  }

  const budget =
    'totalEstimatedBudget' in ppmp && typeof ppmp.totalEstimatedBudget === 'number'
      ? ppmp.totalEstimatedBudget
      : 'totalBudget' in ppmp && typeof ppmp.totalBudget === 'number'
        ? ppmp.totalBudget
        : 0

  const fiscalYearLabel =
    'fiscalYearName' in ppmp && ppmp.fiscalYearName
      ? ppmp.fiscalYearName
      : 'fiscalYear' in ppmp && ppmp.fiscalYear
        ? typeof ppmp.fiscalYear === 'object' && ppmp.fiscalYear !== null && 'year' in ppmp.fiscalYear
          ? `FY ${ppmp.fiscalYear.year}`
          : `FY ${ppmp.fiscalYear}`
        : 'FY -'

  const officeLabel =
    'officeName' in ppmp && ppmp.officeName
      ? ppmp.officeName
      : 'office' in ppmp && ppmp.office && typeof ppmp.office === 'object' && 'name' in ppmp.office
        ? (ppmp.office as { name: string }).name
        : 'Requesting Office'

  const maxChars = 500
  const charCount = remarks.length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <Undo2 className="h-5 w-5" />
            <span>Return PPMP for Revision</span>
          </DialogTitle>
          <DialogDescription>
            Send this PPMP back to the submitting office with your feedback and required adjustments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Warning Banner */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-3 text-xs leading-relaxed text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Action will unlock PPMP for editing
              </p>
              <p className="text-amber-800 mt-0.5">
                The PPMP status will be set to <strong>Returned</strong>. The submitting office will be notified, can revise items and allocations, and resubmit for review.
              </p>
            </div>
          </div>

          {/* PPMP Context Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Document / PPMP:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[220px]">
                {ppmp.documentName || ppmp.ppmpNumber || 'Untitled PPMP'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Office:
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                {officeLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Fiscal Year:
              </span>
              <span className="font-semibold text-slate-800">{fiscalYearLabel}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                Total Budget:
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrencyPHP(budget)}
              </span>
            </div>
          </div>

          {/* Revision Remarks Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Revision Remarks / Feedback <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {charCount}/{maxChars}
              </span>
            </div>
            <Textarea
              placeholder="Detail what needs to be changed (e.g. adjust Q3 IT equipment budget, specify unit of measurement for consumables, attach quotation)..."
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value)
                if (error) setError(null)
              }}
              disabled={isSubmitting}
              maxLength={maxChars}
              rows={4}
              className="resize-none text-xs leading-relaxed focus-visible:ring-amber-500"
            />
            {error && (
              <p className="text-[11px] font-medium text-rose-600">{error}</p>
            )}
            <p className="text-[11px] text-slate-400">
              Be clear and descriptive so the office knows exactly what to adjust before resubmitting.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting || !remarks.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5 shadow-sm shadow-amber-600/20"
          >
            <Undo2 className="h-4 w-4" />
            {isSubmitting ? 'Returning PPMP...' : 'Return PPMP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
