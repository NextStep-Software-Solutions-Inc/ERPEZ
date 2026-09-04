import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Calculator,
  Info,
  Sparkles,
} from 'lucide-react'
import { useEvaluateProjectBids } from '../hooks/useBidEvaluationApi'
import { extractErrorMessage } from '@/services/utils/messages'
import type {
  BidderEvaluationInputPayload,
  BiddingSubmissionResponse,
} from '../types/bidEvaluationApi.types'
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
import { Switch } from '@/components/ui/switch'

interface EvaluateBidsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  awardCriterion: 'LCRB' | 'MEARB' | string
  technicalWeight?: number | null
  financialWeight?: number | null
  admittedSubmissions: Array<BiddingSubmissionResponse>
}

interface BidderInputState {
  bidOpeningRecordId: string
  supplierName: string
  asReadBidAmount: number
  evaluatedBidPrice: string
  technicalScore: string
  isResponsive: boolean
  nonResponsiveReason: string
}

export function EvaluateBidsDialog({
  open,
  onOpenChange,
  projectId,
  awardCriterion,
  technicalWeight,
  financialWeight,
  admittedSubmissions,
}: EvaluateBidsDialogProps) {
  const evaluateBidsMutation = useEvaluateProjectBids()

  const [bidderInputs, setBidderInputs] = useState<Array<BidderInputState>>([])
  const [remarks, setRemarks] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open && admittedSubmissions.length > 0) {
      const initialStates: Array<BidderInputState> = admittedSubmissions
        .filter((s) => s.openingRecord && s.openingRecord.envelope1Result === 'Passed' && s.openingRecord.envelope2Opened)
        .map((s) => ({
          bidOpeningRecordId: s.openingRecord!.id,
          supplierName: s.supplierName,
          asReadBidAmount: s.openingRecord!.asReadBidAmount ?? s.originalProposedAmount,
          evaluatedBidPrice: String(s.openingRecord!.asReadBidAmount ?? s.originalProposedAmount),
          technicalScore: '90',
          isResponsive: true,
          nonResponsiveReason: '',
        }))
      setBidderInputs(initialStates)
      setRemarks('')
      setValidationError(null)
    }
  }, [open, admittedSubmissions])

  const handlePriceChange = (index: number, val: string) => {
    setBidderInputs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], evaluatedBidPrice: val }
      return next
    })
  }

  const handleTechScoreChange = (index: number, val: string) => {
    setBidderInputs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], technicalScore: val }
      return next
    })
  }

  const handleResponsiveToggle = (index: number, checked: boolean) => {
    setBidderInputs((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        isResponsive: checked,
        nonResponsiveReason: checked ? '' : next[index].nonResponsiveReason,
      }
      return next
    })
  }

  const handleNonResponsiveReasonChange = (index: number, val: string) => {
    setBidderInputs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], nonResponsiveReason: val }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (bidderInputs.length === 0) {
      setValidationError('No eligible bidders available to evaluate.')
      return
    }

    const payloadBidders: Array<BidderEvaluationInputPayload> = []

    for (const b of bidderInputs) {
      const price = parseFloat(b.evaluatedBidPrice)
      if (isNaN(price) || price <= 0) {
        setValidationError(`Invalid evaluated bid price for ${b.supplierName}.`)
        return
      }

      let techScore: number | null = null
      if (awardCriterion === 'MEARB') {
        techScore = parseFloat(b.technicalScore)
        if (isNaN(techScore) || techScore < 0 || techScore > 100) {
          setValidationError(`Technical score for ${b.supplierName} must be between 0 and 100.`)
          return
        }
      }

      if (!b.isResponsive && !b.nonResponsiveReason.trim()) {
        setValidationError(`Please specify a non-responsive reason for ${b.supplierName}.`)
        return
      }

      payloadBidders.push({
        bidOpeningRecordId: b.bidOpeningRecordId,
        evaluatedBidPrice: price,
        technicalScore: techScore,
        isResponsive: b.isResponsive,
        nonResponsiveReason: !b.isResponsive ? b.nonResponsiveReason.trim() : null,
      })
    }

    try {
      await evaluateBidsMutation.mutateAsync({
        projectId,
        data: {
          awardCriterion,
          technicalWeight: technicalWeight ?? undefined,
          financialWeight: financialWeight ?? undefined,
          remarks: remarks.trim() ? remarks.trim() : null,
          bidders: payloadBidders,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err as any)
      setValidationError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="p-0 gap-0 overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-gradient-to-r from-purple-500/10 to-primary/5 border-b border-default-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-extrabold text-default-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  Execute Arithmetic Bid Evaluation & Ranking
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record arithmetic corrections, evaluate quality-price criteria, and dispatch to backend for authoritative ranking.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="font-bold bg-white shadow-sm border-purple-200 text-purple-700">
                Criterion: {awardCriterion === 'MEARB' ? 'MEARB (Weighted)' : 'LCRB (Lowest Price)'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Criterion context banner */}
            <div className="p-3.5 rounded-lg bg-default-50 border border-default-200 flex items-start gap-3 text-xs">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-default-700">
                <p className="font-semibold text-default-900">
                  Authoritative Evaluation Protocol ({awardCriterion}):
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {awardCriterion === 'MEARB'
                    ? `Under RA 12009 / RA 9184 MEARB, the backend applies the project's configured weights (${technicalWeight ?? 70}% Technical / ${financialWeight ?? 30}% Financial) and calculates normalized financial scores against the lowest evaluated bid.`
                    : 'Under LCRB, the backend mathematically ranks all responsive bids strictly by lowest evaluated price after arithmetic corrections.'}
                </p>
              </div>
            </div>

            {validationError && (
              <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">Validation Error</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Bidders Evaluation Inputs List */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-default-700">
                Admitted Bidders for Arithmetic Evaluation ({bidderInputs.length})
              </Label>

              {bidderInputs.map((bidder, idx) => (
                <div
                  key={bidder.bidOpeningRecordId}
                  className="p-4 rounded-lg border border-default-200 bg-white space-y-3 shadow-sm hover:border-default-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-default-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-default-200 font-bold text-[10px] text-default-800">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-default-900 text-sm flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        {bidder.supplierName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        As-Read Opening Amount: <strong className="text-default-900">₱ {bidder.asReadBidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`resp-${idx}`} className="text-xs font-semibold cursor-pointer">
                          {bidder.isResponsive ? 'Responsive' : 'Non-Responsive'}
                        </Label>
                        <Switch
                          id={`resp-${idx}`}
                          checked={bidder.isResponsive}
                          onCheckedChange={(checked) => handleResponsiveToggle(idx, checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* Evaluated Bid Price */}
                    <div className="space-y-1">
                      <Label htmlFor={`eval-price-${idx}`} className="text-xs font-bold text-default-900">
                        Evaluated Bid Price (₱) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                          ₱
                        </span>
                        <Input
                          id={`eval-price-${idx}`}
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={bidder.evaluatedBidPrice}
                          onChange={(e) => handlePriceChange(idx, e.target.value)}
                          placeholder="0.00"
                          className="pl-7 text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Corrected for arithmetic errors, discounts & taxes.
                      </p>
                    </div>

                    {/* Technical Score (for MEARB) */}
                    {awardCriterion === 'MEARB' ? (
                      <div className="space-y-1">
                        <Label htmlFor={`tech-score-${idx}`} className="text-xs font-bold text-default-900">
                          Technical / Quality Score (0–100) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`tech-score-${idx}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={bidder.technicalScore}
                          onChange={(e) => handleTechScoreChange(idx, e.target.value)}
                          placeholder="90.0"
                          className="text-xs font-mono font-bold"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground">
                          TWG rating score based on technical criteria.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-60">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Criterion Rule
                        </Label>
                        <div className="h-9 flex items-center px-3 rounded-md bg-default-50 border text-xs text-muted-foreground">
                          Lowest Price Evaluation (LCRB)
                        </div>
                      </div>
                    )}

                    {/* Non-Responsive reason if toggled off */}
                    {!bidder.isResponsive && (
                      <div className="space-y-1 animate-in fade-in">
                        <Label htmlFor={`non-resp-reason-${idx}`} className="text-xs font-bold text-destructive">
                          Non-Responsive Reason <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`non-resp-reason-${idx}`}
                          value={bidder.nonResponsiveReason}
                          onChange={(e) => handleNonResponsiveReasonChange(idx, e.target.value)}
                          placeholder="e.g. Major arithmetic variance exceeds 15%."
                          className="text-xs border-destructive/40"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* General Remarks */}
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="eval-remarks" className="text-xs font-semibold text-default-800">
                Evaluation Notes / TWG Recommendation Remarks (Optional)
              </Label>
              <Input
                id="eval-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Arithmetic verification completed with 0 variances."
                className="text-xs"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-default-50 border-t border-default-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={evaluateBidsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className="gap-1.5 font-bold shadow-sm"
              disabled={evaluateBidsMutation.isPending}
            >
              {evaluateBidsMutation.isPending ? (
                'Evaluating...'
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Run Authoritative Evaluation & Rank
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
