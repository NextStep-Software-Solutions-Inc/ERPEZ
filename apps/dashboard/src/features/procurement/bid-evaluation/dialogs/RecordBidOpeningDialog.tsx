import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  Building2,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  FileText,
  FolderOpen,
  Lock,
  Package,
  ShieldCheck,
  Unlock,
  XCircle,
} from 'lucide-react'
import { DocumentPreviewDialog, type PreviewableDocument } from './DocumentPreviewDialog'
import { useRecordBidOpening } from '../hooks/useBidEvaluationApi'
import type { BiddingSubmissionResponse } from '../types/bidEvaluationApi.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

interface RecordBidOpeningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  submission: BiddingSubmissionResponse | null
  biddingActivityScheduleId?: string | null
  isReadOnly?: boolean
}

export function RecordBidOpeningDialog({
  open,
  onOpenChange,
  projectId,
  submission,
  biddingActivityScheduleId,
  isReadOnly = false,
}: RecordBidOpeningDialogProps) {
  const recordOpeningMutation = useRecordBidOpening()

  // Envelope 1 defaults to Pending / Not Yet Examined. NEVER default to Passed for unexamined bids.
  const [envelope1Result, setEnvelope1Result] = useState<'Pending' | 'Passed' | 'Failed'>('Pending')
  // Envelope 2 defaults to Sealed (false)
  const [envelope2Opened, setEnvelope2Opened] = useState<boolean>(false)
  const [disqualificationReason, setDisqualificationReason] = useState('')
  const [asReadBidAmount, setAsReadBidAmount] = useState<string>('')
  const [remarks, setRemarks] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Historical state preservation: once Envelope 2 was opened, lock reversal
  const isAlreadyOpened = submission?.openingRecord?.envelope2Opened === true

  const handlePreview = (doc: { id: string; name: string; url: string; type?: string }) => {
    if (!doc.url) return
    setPreviewDoc(doc)
    setIsPreviewOpen(true)
  }

  useEffect(() => {
    if (submission && open) {
      if (submission.openingRecord) {
        const rawRes = submission.openingRecord.envelope1Result
        if (rawRes === 'Passed') {
          setEnvelope1Result('Passed')
        } else if (rawRes === 'Failed') {
          setEnvelope1Result('Failed')
        } else {
          setEnvelope1Result('Pending')
        }
        setEnvelope2Opened(Boolean(submission.openingRecord.envelope2Opened))
        setDisqualificationReason(submission.openingRecord.disqualificationReason ?? '')
        setAsReadBidAmount(
          submission.openingRecord.asReadBidAmount
            ? String(submission.openingRecord.asReadBidAmount)
            : ''
        )
        setRemarks(submission.openingRecord.remarks ?? '')
      } else {
        // Defaults when opening a new unrecorded submission
        setEnvelope1Result('Pending')
        setEnvelope2Opened(false)
        setDisqualificationReason('')
        setAsReadBidAmount('')
        setRemarks('')
      }
      setValidationError(null)
    }
  }, [submission, open])

  if (!submission) return null

  const firstEnvelopeDocs = (submission.documents || []).filter((d) => (d.envelopeType ?? 1) === 1)
  const secondEnvelopeDocs = (submission.documents || []).filter((d) => d.envelopeType === 2)

  const handleEnvelope1Change = (val: 'Passed' | 'Failed') => {
    if (isAlreadyOpened || isReadOnly) {
      return
    }
    setEnvelope1Result(val)
    setValidationError(null)
    if (val === 'Failed') {
      // If Failed, Envelope 2 must remain sealed and cannot have as-read amount
      setEnvelope2Opened(false)
      setAsReadBidAmount('')
    } else {
      // If Passed, clear disqualification reason
      setDisqualificationReason('')
    }
  }

  const handleOpenSecondEnvelope = () => {
    if (envelope1Result !== 'Passed' || isReadOnly) return
    setEnvelope2Opened(true)
    setValidationError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) {
      onOpenChange(false)
      return
    }
    setValidationError(null)

    if (envelope1Result === 'Pending') {
      setValidationError('Please record the First Envelope examination result by selecting Passed or Failed.')
      return
    }

    if (envelope1Result === 'Failed') {
      if (!disqualificationReason.trim()) {
        setValidationError('A reason for Envelope 1 disqualification is mandatory.')
        return
      }
    } else if (envelope1Result === 'Passed') {
      if (!envelope2Opened) {
        setValidationError(
          'Envelope 2 is eligible to be opened. Please click "Open Second Envelope" to unseal Envelope 2 and record the As-Read Bid Amount.'
        )
        return
      }

      const parsedAmount = parseFloat(asReadBidAmount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setValidationError('Please enter a valid positive As-Read Bid Amount for Envelope 2.')
        return
      }

      if (
        submission.originalProposedAmount !== null &&
        submission.originalProposedAmount !== undefined &&
        submission.originalProposedAmount > 0 &&
        Math.abs(submission.originalProposedAmount - parsedAmount) > 0.009
      ) {
        if (!remarks.trim()) {
          setValidationError(
            `A variance exists between the supplier-submitted amount (₱${submission.originalProposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}) and the recorded As-Read amount (₱${parsedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}). Explanatory BAC remarks are required.`
          )
          return
        }
      }
    }

    try {
      await recordOpeningMutation.mutateAsync({
        projectId,
        data: {
          biddingSubmissionId: submission.id,
          biddingActivityScheduleId: biddingActivityScheduleId ?? undefined,
          envelope1Result,
          envelope2Opened: envelope1Result === 'Passed' && envelope2Opened,
          asReadBidAmount:
            envelope1Result === 'Passed' && envelope2Opened
              ? parseFloat(asReadBidAmount)
              : null,
          disqualificationReason:
            envelope1Result === 'Failed' ? disqualificationReason.trim() : null,
          remarks: remarks.trim() ? remarks.trim() : null,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to record bid opening.')
      setValidationError(errorMsg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0 gap-0 overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-default-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-extrabold text-default-900 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  Official Bid Opening Session
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Sequential Pass/Fail examination for Envelope 1 (Eligibility & Technical) and unsealing of Envelope 2 (Financial).
                </DialogDescription>
              </div>
              {isReadOnly ? (
                <Badge variant="outline" className="font-semibold bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Record Locked (View Only)
                </Badge>
              ) : (
                <Badge variant="outline" className="font-semibold bg-white shadow-sm border-primary/20 text-primary">
                  Session Recording
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {isReadOnly && (
              <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-xs font-bold">Record Locked (View Only)</AlertTitle>
                <AlertDescription className="text-xs">
                  An award recommendation has already been established for this project. In compliance with Philippine Procurement Law (RA 9184 / RA 12009), bid opening records are preserved for audit trail integrity and cannot be modified.
                </AlertDescription>
              </Alert>
            )}

            {/* Bidder Summary Header Card */}
            <div className="p-4 rounded-lg bg-default-50 border border-default-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Supplier / Bidder
                </span>
                <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  {submission.supplierName}
                </span>
                {submission.tinNumber && (
                  <span className="text-muted-foreground block text-[11px] mt-0.5">
                    TIN: {submission.tinNumber}
                  </span>
                )}
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Supplier Submitted Amount
                </span>
                {(submission.isFinancialOpened || envelope2Opened) && submission.originalProposedAmount !== null && submission.originalProposedAmount !== undefined ? (
                  <span className="font-bold text-default-900 text-sm flex items-center gap-1 mt-0.5">
                    <DollarSign className="h-4 w-4 text-success shrink-0" />
                    ₱ {submission.originalProposedAmount.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span className="font-semibold text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    Sealed in Envelope 2
                  </span>
                )}
                <span className="text-muted-foreground block text-[11px] mt-0.5">
                  Type: {submission.submissionType}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Bid Security Info
                </span>
                <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  {submission.bidSecurityType || 'None/Decl.'}
                </span>
                {submission.bidSecurityAmount && (
                  <span className="text-muted-foreground block text-[11px] mt-0.5">
                    Amount: ₱ {submission.bidSecurityAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {validationError && (
              <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">Validation Error</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{validationError}</AlertDescription>
              </Alert>
            )}

            {/* ── STEP 1: FIRST ENVELOPE (ELIGIBILITY & TECHNICAL) ── */}
            <div className="space-y-3 p-4 rounded-lg border border-default-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold text-default-900 flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs font-bold">
                      1
                    </span>
                    First Envelope: Eligibility & Technical Examination
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Non-discretionary Pass/Fail criterion under RA 12009 IRR.
                  </p>
                </div>
                {envelope1Result === 'Passed' ? (
                  <Badge color="success" variant="soft" className="font-bold uppercase text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Passed
                  </Badge>
                ) : envelope1Result === 'Failed' ? (
                  <Badge color="destructive" variant="soft" className="font-bold uppercase text-[10px] flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Failed
                  </Badge>
                ) : (
                  <Badge color="warning" variant="soft" className="font-bold uppercase text-[10px]">
                    Pending Examination
                  </Badge>
                )}
              </div>

              {isAlreadyOpened && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Envelope 1 passed and Envelope 2 was already unsealed during this official session. Historical decisions cannot be reversed.
                  </span>
                </div>
              )}

              {/* Action Selection */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-default-700 block mb-2">
                  BAC Examination Decision:
                </span>
                <RadioGroup
                  value={envelope1Result}
                  onValueChange={(val) => handleEnvelope1Change(val as 'Passed' | 'Failed')}
                  disabled={isAlreadyOpened || isReadOnly}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="env1-pass"
                    className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      envelope1Result === 'Passed'
                        ? 'border-success bg-success/5 shadow-sm ring-1 ring-success'
                        : 'border-default-200 hover:bg-default-50'
                    } ${isAlreadyOpened || isReadOnly ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <RadioGroupItem value="Passed" id="env1-pass" disabled={isAlreadyOpened || isReadOnly} />
                    <div>
                      <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Passed (Compliant)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        All eligibility, legal, and technical requirements are verified complete and compliant.
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="env1-fail"
                    className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      envelope1Result === 'Failed'
                        ? 'border-destructive bg-destructive/5 shadow-sm ring-1 ring-destructive'
                        : 'border-default-200 hover:bg-default-50'
                    } ${isAlreadyOpened || isReadOnly ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <RadioGroupItem value="Failed" id="env1-fail" disabled={isAlreadyOpened || isReadOnly} />
                    <div>
                      <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Failed (Disqualified)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Missing or non-compliant document. Envelope 2 remains sealed.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Envelope 1 Documents List */}
              {firstEnvelopeDocs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-default-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-default-700 uppercase tracking-wider">
                      Submitted Eligibility & Technical Documents ({firstEnvelopeDocs.length})
                    </span>
                    <span className="text-[11px] text-muted-foreground">Envelope 1 Requirements</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {firstEnvelopeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-md border border-default-200 bg-default-50/50 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-medium truncate text-default-800" title={doc.name}>
                            {doc.name}
                          </span>
                        </div>
                        {doc.url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 shrink-0 font-semibold"
                            onClick={() => handlePreview(doc)}
                          >
                            Preview
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {envelope1Result === 'Failed' && (
                <div className="space-y-1.5 pt-2 border-t border-destructive/20 animate-in fade-in slide-in-from-top-1">
                  <Label htmlFor="disqual-reason" className="text-xs font-bold text-destructive">
                    Disqualification Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="disqual-reason"
                    value={disqualificationReason}
                    onChange={(e) => setDisqualificationReason(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Specify missing eligibility requirements, defective bid security, expired licenses, etc."
                    className={`text-xs border-destructive/40 focus:border-destructive ${isReadOnly ? 'bg-default-100 cursor-not-allowed' : ''}`}
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {/* Step Sequence Arrow Indicator */}
            <div className="flex items-center justify-center -my-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-default-100 px-3 py-1 rounded-full shadow-xs border border-default-200">
                <ArrowDown className="h-3.5 w-3.5 text-primary" />
                {envelope1Result === 'Passed'
                  ? 'Envelope 1 Passed — Proceed to Second Envelope'
                  : envelope1Result === 'Failed'
                  ? 'Disqualified — Envelope 2 Remains Sealed'
                  : 'Awaiting Envelope 1 Examination'}
              </div>
            </div>

            {/* ── STEP 2: SECOND ENVELOPE (FINANCIAL) ── */}
            <div
              className={`space-y-3 p-4 rounded-lg border transition-all ${
                envelope1Result === 'Passed' && envelope2Opened
                  ? 'border-purple-200 bg-white shadow-xs'
                  : envelope1Result === 'Passed'
                  ? 'border-primary/30 bg-primary/5'
                  : envelope1Result === 'Failed'
                  ? 'border-destructive/20 bg-destructive/5'
                  : 'border-dashed border-default-200 bg-default-50/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold text-default-900 flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center h-5 w-5 rounded-full text-white text-xs font-bold ${
                        envelope2Opened
                          ? 'bg-purple-600'
                          : envelope1Result === 'Passed'
                          ? 'bg-primary'
                          : 'bg-default-400'
                      }`}
                    >
                      2
                    </span>
                    Second Envelope: Financial Bid Envelope
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Financial proposal and bill of quantities. Must be unsealed only after Envelope 1 passes.
                  </p>
                </div>
                {envelope2Opened ? (
                  <Badge color="success" variant="soft" className="font-bold text-[10px] flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" /> Opened (Unsealed)
                  </Badge>
                ) : (
                  <Badge color="secondary" variant="soft" className="font-bold text-[10px] flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Sealed
                  </Badge>
                )}
              </div>

              {/* State A: Envelope 1 is Pending */}
              {envelope1Result === 'Pending' && (
                <div className="p-3 bg-default-100/70 rounded-md text-xs text-muted-foreground flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-default-400 shrink-0" />
                  <span>
                    Envelope 2 remains sealed. Examination of the First Envelope (Eligibility & Technical) must be recorded first.
                  </span>
                </div>
              )}

              {/* State B: Envelope 1 is Failed */}
              {envelope1Result === 'Failed' && (
                <div className="p-3 bg-destructive/10 rounded-md text-xs text-destructive flex items-center gap-2.5 font-medium">
                  <Lock className="h-4 w-4 text-destructive shrink-0" />
                  <span>
                    Envelope 2 remains sealed because the First Envelope did not pass the initial examination. Under statutory bidding procedures (RA 12009), the financial envelope of a disqualified bidder shall not be opened.
                  </span>
                </div>
              )}

              {/* State C: Envelope 1 Passed, but Envelope 2 Not Yet Opened */}
              {envelope1Result === 'Passed' && !envelope2Opened && (
                <div className="p-4 bg-white rounded-md border border-primary/20 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        First Envelope Passed — Eligible for Opening
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        The bidder satisfies all eligibility & technical requirements. Envelope 2 is ready to be unsealed.
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        color="primary"
                        size="sm"
                        onClick={handleOpenSecondEnvelope}
                        className="gap-1.5 text-xs font-bold shrink-0 shadow-sm"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Open Second Envelope
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground italic border-t border-default-100 pt-2">
                    Notice: Envelope 2 remains sealed until you explicitly click &ldquo;Open Second Envelope&rdquo;. The As-Read Bid Amount field will be revealed upon unsealing.
                  </p>
                </div>
              )}

              {/* State D: Envelope 2 is Officially Opened */}
              {envelope1Result === 'Passed' && envelope2Opened && (() => {
                const numAsRead = Math.round(((parseFloat(asReadBidAmount) || 0) + Number.EPSILON) * 100) / 100
                const origAmount =
                  submission.originalProposedAmount !== null && submission.originalProposedAmount !== undefined
                    ? Math.round((submission.originalProposedAmount + Number.EPSILON) * 100) / 100
                    : 0
                const hasDiscrepancy =
                  origAmount > 0 &&
                  numAsRead > 0 &&
                  Math.abs(origAmount - numAsRead) > 0.009

                return (
                  <div className="space-y-4 pt-2">
                    {/* Submitted Item Bids (if Itemized) */}
                    {submission.items && submission.items.length > 0 && (
                      <div className="space-y-2 p-3 rounded-lg border border-default-200 bg-default-50/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-default-900 flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-primary" /> Submitted Item Bids (Price Schedule / BOQ)
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {submission.items.length} {submission.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="overflow-x-auto max-h-48 border border-default-200 rounded bg-white">
                          <table className="w-full text-xs">
                            <thead className="bg-default-50 sticky top-0 border-b border-default-100">
                              <tr className="text-left text-muted-foreground font-semibold">
                                <th className="py-1.5 px-2">#</th>
                                <th className="py-1.5 px-2">Item Description</th>
                                <th className="py-1.5 px-2 text-right">Qty</th>
                                <th className="py-1.5 px-2 text-right">Offered Unit</th>
                                <th className="py-1.5 px-2 text-right">Offered Total</th>
                                <th className="py-1.5 px-2">Brand / Model</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submission.items.map((it, idx) => (
                                <tr key={it.id || idx} className="border-b border-default-50">
                                  <td className="py-1 px-2 text-muted-foreground">{idx + 1}</td>
                                  <td className="py-1 px-2 font-medium">{it.itemName || 'Item'}</td>
                                  <td className="py-1 px-2 text-right">{it.quantity} {it.uom}</td>
                                  <td className="py-1 px-2 text-right">₱{(it.unitPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                  <td className="py-1 px-2 text-right font-semibold">₱{(it.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                  <td className="py-1 px-2 text-muted-foreground">{[it.brand, it.model].filter(Boolean).join(' ') || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Variance Warning Banner */}
                    {hasDiscrepancy && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">Bid Variance Detected</span>
                          <p className="text-[11px] leading-relaxed">
                            The As-Read Bid Amount (₱{numAsRead.toLocaleString('en-PH', { minimumFractionDigits: 2 })}) differs from the supplier-submitted proposal (₱{submission.originalProposedAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}). Explanatory BAC remarks must be documented below.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="as-read-amount" className="text-xs font-bold text-default-900">
                            As-Read Bid Amount (₱) <span className="text-destructive">*</span>
                          </Label>
                          {!isReadOnly && submission.originalProposedAmount !== null && submission.originalProposedAmount !== undefined && (
                            <button
                              type="button"
                              onClick={() => {
                                setAsReadBidAmount(String(submission.originalProposedAmount || ''))
                                setValidationError(null)
                              }}
                              className="text-[10px] text-primary hover:underline font-semibold"
                            >
                              Populate from Submitted Total
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                            ₱
                          </span>
                          <Input
                            id="as-read-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={asReadBidAmount}
                            onChange={(e) => setAsReadBidAmount(e.target.value)}
                            disabled={isReadOnly}
                            placeholder="0.00"
                            className={`pl-7 text-xs font-mono font-bold ${isReadOnly ? 'bg-default-100 cursor-not-allowed text-default-900' : ''}`}
                            required
                            autoFocus={!isReadOnly}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {submission.originalProposedAmount !== null && submission.originalProposedAmount !== undefined
                            ? `Original Submitted: ₱ ${submission.originalProposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}.`
                            : ''}{' '}
                          Enter the actual financial bid read publicly during opening.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="remarks" className="text-xs font-semibold text-default-800">
                          BAC Opening Remarks {hasDiscrepancy ? <span className="text-destructive font-bold">* (Required due to variance)</span> : '(Optional)'}
                        </Label>
                        <Input
                          id="remarks"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          disabled={isReadOnly}
                          placeholder={hasDiscrepancy ? "Explain variance (e.g. As-read from Bid Form Page 1)..." : "e.g. As-read matches financial bid letter."}
                          className={`text-xs ${isReadOnly ? 'bg-default-100 cursor-not-allowed text-default-900' : ''} ${hasDiscrepancy && !remarks.trim() ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Envelope 2 Documents List */}
                    {secondEnvelopeDocs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-default-100 col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                            Submitted Financial Documents ({secondEnvelopeDocs.length})
                          </span>
                          <span className="text-[11px] text-muted-foreground">Envelope 2 Requirements</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {secondEnvelopeDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2 rounded-md border border-purple-200 bg-purple-50/30 hover:border-purple-400 transition-colors"
                            >
                              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                <FileText className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                <span className="text-xs font-medium truncate text-default-800" title={doc.name}>
                                  {doc.name}
                                </span>
                              </div>
                              {doc.url && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[11px] px-2 text-purple-700 hover:text-purple-800 hover:bg-purple-100 gap-1 shrink-0 font-semibold"
                                  onClick={() => handlePreview(doc)}
                                >
                                  Preview
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-default-50 border-t border-default-200 flex items-center justify-end gap-2">
            {isReadOnly ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={recordOpeningMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="gap-1.5 font-semibold"
                  disabled={recordOpeningMutation.isPending}
                >
                  {recordOpeningMutation.isPending ? (
                    'Recording...'
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Save Bid Opening Record
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>

      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        document={previewDoc}
      />
    </Dialog>
  )
}
