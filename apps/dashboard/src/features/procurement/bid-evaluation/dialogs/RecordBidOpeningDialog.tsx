import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { previewDocument } from '@/features/procurement/manage-supplier-portal/utils'
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
}

export function RecordBidOpeningDialog({
  open,
  onOpenChange,
  projectId,
  submission,
  biddingActivityScheduleId,
}: RecordBidOpeningDialogProps) {
  const recordOpeningMutation = useRecordBidOpening()

  const [envelope1Result, setEnvelope1Result] = useState<'Passed' | 'Failed'>('Passed')
  const [disqualificationReason, setDisqualificationReason] = useState('')
  const [asReadBidAmount, setAsReadBidAmount] = useState<string>('')
  const [remarks, setRemarks] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [previewingDocId, setPreviewingDocId] = useState<string | null>(null)

  const handlePreview = async (doc: { id: string; name: string; url: string; type?: string }) => {
    if (!doc.url) return
    setPreviewingDocId(doc.id)
    try {
      await previewDocument(doc.url, doc.name, doc.type)
    } catch (err) {
      console.error('Failed to preview document:', err)
    } finally {
      setPreviewingDocId(null)
    }
  }

  useEffect(() => {
    if (submission) {
      if (submission.openingRecord) {
        setEnvelope1Result(
          submission.openingRecord.envelope1Result === 'Failed' ? 'Failed' : 'Passed'
        )
        setDisqualificationReason(submission.openingRecord.disqualificationReason ?? '')
        setAsReadBidAmount(
          submission.openingRecord.asReadBidAmount
            ? String(submission.openingRecord.asReadBidAmount)
            : ''
        )
        setRemarks(submission.openingRecord.remarks ?? '')
      } else {
        setEnvelope1Result('Passed')
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
    setEnvelope1Result(val)
    setValidationError(null)
    if (val === 'Failed') {
      setAsReadBidAmount('')
    } else {
      setDisqualificationReason('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (envelope1Result === 'Failed') {
      if (!disqualificationReason.trim()) {
        setValidationError('A reason for Envelope 1 disqualification is mandatory.')
        return
      }
    } else {
      const parsedAmount = parseFloat(asReadBidAmount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setValidationError('Please enter a valid As-Read Bid Amount for Envelope 2.')
        return
      }
    }

    try {
      await recordOpeningMutation.mutateAsync({
        projectId,
        data: {
          biddingSubmissionId: submission.id,
          biddingActivityScheduleId: biddingActivityScheduleId ?? undefined,
          envelope1Result,
          envelope2Opened: envelope1Result === 'Passed',
          asReadBidAmount: envelope1Result === 'Passed' ? parseFloat(asReadBidAmount) : null,
          disqualificationReason: envelope1Result === 'Failed' ? disqualificationReason.trim() : null,
          remarks: remarks.trim() ? remarks.trim() : null,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to record bid opening.'
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
                  Record BAC verification for Envelope 1 (Eligibility/Technical) and unseal Envelope 2 (Financial).
                </DialogDescription>
              </div>
              <Badge variant="outline" className="font-semibold bg-white shadow-sm border-primary/20 text-primary">
                Session Recording
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
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
                <span className="font-bold text-default-900 text-sm flex items-center gap-1 mt-0.5">
                  <DollarSign className="h-4 w-4 text-success shrink-0" />
                  ₱ {submission.originalProposedAmount.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
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

            {/* STEP 1: ENVELOPE 1 VERIFICATION */}
            <div className="space-y-3 p-4 rounded-lg border border-default-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold text-default-900 flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs">
                      1
                    </span>
                    Envelope 1: Eligibility & Technical Checklist
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Non-discretionary Pass/Fail criterion under RA 12009 / RA 9184 IRR.
                  </p>
                </div>
                <Badge
                  color={envelope1Result === 'Passed' ? 'success' : 'destructive'}
                  variant="soft"
                  className="font-bold uppercase text-[10px]"
                >
                  {envelope1Result}
                </Badge>
              </div>

              <RadioGroup
                value={envelope1Result}
                onValueChange={(val) => handleEnvelope1Change(val as 'Passed' | 'Failed')}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                <label
                  htmlFor="env1-pass"
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    envelope1Result === 'Passed'
                      ? 'border-success bg-success/5 shadow-sm'
                      : 'border-default-200 hover:bg-default-50'
                  }`}
                >
                  <RadioGroupItem value="Passed" id="env1-pass" />
                  <div>
                    <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Passed (Compliant)
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      All required eligibility & technical documents are complete.
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="env1-fail"
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    envelope1Result === 'Failed'
                      ? 'border-destructive bg-destructive/5 shadow-sm'
                      : 'border-default-200 hover:bg-default-50'
                  }`}
                >
                  <RadioGroupItem value="Failed" id="env1-fail" />
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
                            disabled={previewingDocId === doc.id}
                            className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 shrink-0 font-semibold"
                            onClick={() => handlePreview(doc)}
                          >
                            {previewingDocId === doc.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Preview'
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {envelope1Result === 'Failed' && (
                <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-1">
                  <Label htmlFor="disqual-reason" className="text-xs font-bold text-destructive">
                    Disqualification Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="disqual-reason"
                    value={disqualificationReason}
                    onChange={(e) => setDisqualificationReason(e.target.value)}
                    placeholder="Specify missing eligibility requirements, defective bid security, expired licenses, etc."
                    className="text-xs border-destructive/40 focus:border-destructive"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {/* STEP 2: ENVELOPE 2 OPENING */}
            <div
              className={`space-y-3 p-4 rounded-lg border transition-all ${
                envelope1Result === 'Passed'
                  ? 'border-default-200 bg-white'
                  : 'border-default-100 bg-default-50/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold text-default-900 flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center h-5 w-5 rounded-full text-white text-xs ${
                        envelope1Result === 'Passed' ? 'bg-primary' : 'bg-default-400'
                      }`}
                    >
                      2
                    </span>
                    Envelope 2: Financial Bid Envelope (As-Read Amount)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {envelope1Result === 'Passed'
                      ? 'Unsealed and read publicly during the Opening of Bids session.'
                      : 'Locked & Sealed because Envelope 1 resulted in Disqualification.'}
                  </p>
                </div>
                {envelope1Result === 'Passed' ? (
                  <Badge color="success" variant="soft" className="font-bold text-[10px]">
                    Unsealed
                  </Badge>
                ) : (
                  <Badge color="secondary" variant="soft" className="font-bold text-[10px] flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Sealed
                  </Badge>
                )}
              </div>

              {envelope1Result === 'Passed' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="as-read-amount" className="text-xs font-bold text-default-900">
                      As-Read Bid Amount (₱) <span className="text-destructive">*</span>
                    </Label>
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
                        placeholder="0.00"
                        className="pl-7 text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Original Submitted: ₱{' '}
                      {submission.originalProposedAmount.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="remarks" className="text-xs font-semibold text-default-800">
                      BAC Opening Remarks (Optional)
                    </Label>
                    <Input
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. As-read matches financial bid letter."
                      className="text-xs"
                    />
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
                                disabled={previewingDocId === doc.id}
                                className="h-6 text-[11px] px-2 text-purple-700 hover:text-purple-800 hover:bg-purple-100 gap-1 shrink-0 font-semibold"
                                onClick={() => handlePreview(doc)}
                              >
                                {previewingDocId === doc.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Preview'
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-default-100 rounded text-xs text-muted-foreground flex items-center gap-2 italic">
                  <Lock className="h-4 w-4 text-default-400 shrink-0" />
                  In accordance with statutory bidding procedures, Envelope 2 cannot be unsealed for non-compliant bidders.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-default-50 border-t border-default-200 flex items-center justify-end gap-2">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
