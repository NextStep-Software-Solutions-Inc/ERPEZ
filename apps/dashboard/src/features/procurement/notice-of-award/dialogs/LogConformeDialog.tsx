import { useState, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Upload, FileText, X, AlertCircle } from 'lucide-react'
import { addCalendarDaysToDateOnly } from '../utils/noaContractExecutionSla'

export type LogConformeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  noaId: string
  noaNumber: string
  issuedAt?: string | null
  isLoading?: boolean
  onConfirm: (data: { date: string; file?: File | null; remarks?: string }) => Promise<void> | void
}

export function LogConformeDialog({
  open,
  onOpenChange,
  noaId: _noaId,
  noaNumber,
  issuedAt,
  isLoading = false,
  onConfirm,
}: LogConformeDialogProps) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const issuedDateStr = issuedAt ? (issuedAt.includes('T') ? issuedAt.slice(0, 10) : issuedAt.split(' ')[0]) : null

  const [receiptDate, setReceiptDate] = useState(todayStr)
  const [file, setFile] = useState<File | null>(null)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setReceiptDate(todayStr)
      setFile(null)
      setRemarks('')
      setError(null)
      setIsSubmitting(false)
    }
  }, [open, todayStr])

  const calculatedDeadline = receiptDate ? addCalendarDaysToDateOnly(receiptDate, 10) : null

  const validate = () => {
    if (!receiptDate) {
      return 'Actual receipt date is required.'
    }
    if (receiptDate > todayStr) {
      return 'Receipt date cannot be in the future.'
    }
    if (issuedDateStr && receiptDate < issuedDateStr) {
      return `Receipt date cannot precede NOA issuance date (${issuedDateStr}).`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm({
        date: receiptDate,
        file,
        remarks: remarks.trim() || undefined,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record NOA receipt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next)
      }}
      title="NOA Receipt / Conforme"
      description={`Record the actual date the winning bidder acknowledged and received ${noaNumber}.`}
      size="md"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {error && (
          <div className="flex items-start gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="actualReceiptDate" className="text-xs font-semibold text-default-700 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Actual Date Received by Winning Bidder <span className="text-destructive">*</span>
          </Label>
          <Input
            id="actualReceiptDate"
            type="date"
            required
            value={receiptDate}
            min={issuedDateStr ?? undefined}
            max={todayStr}
            onChange={(e) => {
              setReceiptDate(e.target.value)
              setError(null)
            }}
            className="text-sm"
          />
          <p className="text-[11px] text-default-500">
            {issuedDateStr
              ? `Issued on ${issuedDateStr}. Must be on or after issuance, up to today.`
              : 'Date the bidder formally received or signed the NOA conforme.'}
          </p>
        </div>

        {calculatedDeadline && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary-900">Contract Execution Deadline:</span>
              <span className="font-bold text-primary text-sm">{calculatedDeadline}</span>
            </div>
            <p className="text-[11px] text-default-600">
              Pursuant to RA 12009 Section 37, the winning bidder has 10 calendar days from NOA receipt to post performance security and enter into contract.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-default-700 flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-default-500" />
            Signed Conforme / Proof of Receipt
          </Label>
          {file ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-default-200 bg-default-50 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate font-medium text-default-800">{file.name}</span>
                <span className="text-default-400 shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-default-400 hover:text-destructive"
                onClick={() => setFile(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <input
                id="conforme-file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => {
                  const selected = e.currentTarget.files?.[0]
                  if (selected) {
                    setFile(selected)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <label
                htmlFor="conforme-file-upload"
                className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-default-300 rounded-lg text-xs text-default-600 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-default-50/50"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload signed conforme document or courier proof</span>
              </label>
            </div>
          )}
          <p className="text-[11px] text-default-400">
            Accepts PDF, DOC, DOCX, JPG, or PNG. Optional proof attachment.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="conformeRemarks" className="text-xs font-semibold text-default-700">
            Remarks / Delivery Notes
          </Label>
          <Input
            id="conformeRemarks"
            type="text"
            placeholder="e.g. Received in person by Authorized Rep, courier tracking #12345"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-default-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            size="sm"
            disabled={isSubmitting || isLoading || !receiptDate}
          >
            {isSubmitting || isLoading ? 'Saving...' : 'Record NOA Receipt'}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  )
}
