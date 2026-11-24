/**
 * Edit Notice to Proceed Dialog
 * Allows modifying header details of an NTP while it is in Draft status.
 * Once issued, the record is legally frozen under RA 12009.
 */

import { useState, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Loader2 } from 'lucide-react'
import type { NoticeToProceedDetail, UpdateNoticeToProceedRequest } from '../types/ntpTypes'

export interface EditNTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NoticeToProceedDetail
  onConfirm: (payload: UpdateNoticeToProceedRequest) => Promise<void>
  isSubmitting?: boolean
}

export function EditNTPDialog({
  open,
  onOpenChange,
  ntp,
  onConfirm,
  isSubmitting = false,
}: EditNTPDialogProps) {
  const [ntpNumber, setNtpNumber] = useState(ntp.ntpNumber || '')
  const [ntpDate, setNtpDate] = useState(ntp.ntpDate || '')
  const [effectivityDate, setEffectivityDate] = useState(ntp.effectivityDate || '')
  const [commencementDate, setCommencementDate] = useState(ntp.commencementDate || '')
  const [implementationPeriodDays, setImplementationPeriodDays] = useState<string>(
    ntp.implementationPeriodDays ? String(ntp.implementationPeriodDays) : ''
  )
  const [placeOfDelivery, setPlaceOfDelivery] = useState(ntp.placeOfDelivery || '')
  const [description, setDescription] = useState(ntp.description || '')

  useEffect(() => {
    if (open) {
      setNtpNumber(ntp.ntpNumber || '')
      setNtpDate(ntp.ntpDate || '')
      setEffectivityDate(ntp.effectivityDate || '')
      setCommencementDate(ntp.commencementDate || '')
      setImplementationPeriodDays(
        ntp.implementationPeriodDays ? String(ntp.implementationPeriodDays) : ''
      )
      setPlaceOfDelivery(ntp.placeOfDelivery || '')
      setDescription(ntp.description || '')
    }
  }, [open, ntp])

  const isValid = ntpNumber.trim().length > 0 && ntpDate.trim().length > 0

  const handleSave = async () => {
    if (!isValid) return

    const days = implementationPeriodDays.trim()
      ? parseInt(implementationPeriodDays.trim(), 10)
      : undefined

    await onConfirm({
      ntpNumber: ntpNumber.trim(),
      ntpDate,
      effectivityDate: effectivityDate.trim() || undefined,
      commencementDate: commencementDate.trim() || undefined,
      implementationPeriodDays: Number.isFinite(days) ? days : undefined,
      placeOfDelivery: placeOfDelivery.trim() || undefined,
      description: description.trim() || undefined,
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
        onClick={handleSave}
        disabled={isSubmitting || !isValid}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            Saving Changes...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Draft Notice to Proceed"
      description="Update terms, delivery instructions, or issuance dates before official HoPE issuance."
      size="md"
      footer={footer}
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Linked Contract Info (Read-only) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Contract: {ntp.contractNumberSnapshot || ntp.contractNumber || '—'}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Supplier: {ntp.supplierNameSnapshot || ntp.supplierName || '—'}
            </span>
          </div>
        </div>

        {/* Row 1: NTP Number & NTP Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              NTP Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={ntpNumber}
              onChange={(e) => setNtpNumber(e.target.value)}
              placeholder="e.g. NTP-2026-001"
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              NTP Date <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="date"
              value={ntpDate}
              onChange={(e) => setNtpDate(e.target.value)}
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Row 2: Effectivity & Commencement Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Effectivity Date</Label>
            <Input
              type="date"
              value={effectivityDate}
              onChange={(e) => setEffectivityDate(e.target.value)}
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Commencement Date</Label>
            <Input
              type="date"
              value={commencementDate}
              onChange={(e) => setCommencementDate(e.target.value)}
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Row 3: Period in Days & Place of Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Period (Calendar Days)</Label>
            <Input
              type="number"
              value={implementationPeriodDays}
              onChange={(e) => setImplementationPeriodDays(e.target.value)}
              placeholder="e.g. 30"
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Place of Delivery</Label>
            <Input
              value={placeOfDelivery}
              onChange={(e) => setPlaceOfDelivery(e.target.value)}
              placeholder="e.g. Central Office Warehouse"
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Scope / Terms / Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Scope Description / Directives</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional instructions or contract execution details..."
            rows={3}
            className="text-xs resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </ResponsiveDialog>
  )
}
