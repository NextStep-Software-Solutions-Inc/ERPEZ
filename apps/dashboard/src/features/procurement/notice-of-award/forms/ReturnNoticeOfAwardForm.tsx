import { useState, useEffect } from 'react'
import { RotateCcw, AlertTriangle, Building2, Coins, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ReturnNoticeOfAwardPayload } from '../types'

export type ReturnNoticeOfAwardFormProps = {
  noaId: string
  noaNumber?: string
  supplierName?: string
  totalAmount?: number
  isLoading?: boolean
  onSubmit: (values: ReturnNoticeOfAwardPayload) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

const COMMON_REASONS = [
  'Incomplete supporting attachments',
  'Discrepancy in award amount',
  'Specifications require clarification',
  'Signatory or date correction required',
  'BAC Resolution details mismatch',
]

export function ReturnNoticeOfAwardForm({
  noaId,
  noaNumber,
  supplierName,
  totalAmount,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ReturnNoticeOfAwardFormProps) {
  const [remarks, setRemarks] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    onDirtyChange?.(remarks.trim().length > 0)
  }, [remarks, onDirtyChange])

  const handleChipClick = (reason: string) => {
    setTouched(true)
    setRemarks((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return reason
      if (trimmed.includes(reason)) return prev
      return `${trimmed}\n- ${reason}`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTouched(true)

    const finalRemarks = remarks.trim()
    if (!finalRemarks || isLoading) return

    await onSubmit({
      noaId,
      remarks: finalRemarks,
    })
    onDirtyChange?.(false)
  }

  const isValid = remarks.trim().length > 0
  const showError = touched && !isValid

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* NOA Summary Context */}
      {(noaNumber || supplierName || totalAmount !== undefined) && (
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            <span>Notice of Award: {noaNumber}</span>
            {totalAmount !== undefined && (
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
          {supplierName && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Winning Bidder: <strong className="text-slate-700 dark:text-slate-300">{supplierName}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Quick Reason Suggestion Chips */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Common Return Reasons (click to append)
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => handleChipClick(reason)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs"
            >
              + {reason}
            </button>
          ))}
        </div>
      </div>

      {/* Remarks Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="noa-return-remarks" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Revision Remarks / Instructions <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {remarks.length}/500
          </span>
        </div>
        <Textarea
          id="noa-return-remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Specify the required revisions, missing attachments, or discrepancies for the procurement staff..."
          disabled={isLoading}
          rows={4}
          maxLength={500}
          className={showError ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {showError && (
          <p className="text-xs text-destructive">
            Remarks are required to explain why the NOA is being returned.
          </p>
        )}
      </div>

      {/* Workflow Impact Warning */}
      <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950 dark:text-amber-100">Workflow Impact</p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300 leading-relaxed">
            Returning this Notice of Award changes its status to <strong className="font-semibold">Returned</strong>. The procurement staff will be notified to revise the draft before it can be resubmitted for HoPE approval.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Returning...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Return for Revision
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
