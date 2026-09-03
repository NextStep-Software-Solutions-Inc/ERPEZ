import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { useCreateBiddingAwardRecommendation } from '../hooks/useBidEvaluationApi'
import type { BiddingEvaluatedBidResponse } from '../types/bidEvaluationApi.types'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AwardRecommendationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  awardCriterion: string
  winningBid: BiddingEvaluatedBidResponse | null
}

export function AwardRecommendationDialog({
  open,
  onOpenChange,
  projectId,
  awardCriterion,
  winningBid,
}: AwardRecommendationDialogProps) {
  const recommendAwardMutation = useCreateBiddingAwardRecommendation()

  const [justification, setJustification] = useState('')
  const [remarks, setRemarks] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open && winningBid) {
      const criterionLabel = awardCriterion === 'MEARB' ? 'Most Economically Advantageous Responsive Bid (MEARB)' : 'Lowest Calculated Responsive Bid (LCRB)'
      setJustification(
        `Declared as the ${criterionLabel} having complied with all legal, technical, and financial capability post-qualification requirements under RA 12009 / RA 9184.`
      )
      setRemarks('')
      setValidationError(null)
    }
  }, [open, winningBid, awardCriterion])

  if (!winningBid || !winningBid.postQualification) return null

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validate that the bidder is responsive and passed post-qual
    if (!winningBid.isResponsive) {
      setValidationError('Cannot recommend a non-responsive bidder for award.')
      return
    }

    if (winningBid.postQualification?.status !== 'Passed') {
      setValidationError('The candidate must have a verified "Passed" post-qualification status.')
      return
    }

    try {
      await recommendAwardMutation.mutateAsync({
        projectId,
        data: {
          biddingEvaluatedBidId: winningBid.id,
          biddingPostQualificationId: winningBid.postQualification.id,
          awardedAmount: winningBid.evaluatedBidPrice, // Authoritative evaluated amount
          justification: justification.trim() ? justification.trim() : null,
          remarks: remarks.trim() ? remarks.trim() : null,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create Award Recommendation.'
      setValidationError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0 gap-0 overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-gradient-to-r from-emerald-600/10 to-primary/5 border-b border-default-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-extrabold text-default-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-emerald-600" />
                  Official BAC Award Recommendation
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Finalize post-qualification and formally recommend contract award for the responsive winning bidder.
                </DialogDescription>
              </div>
              <Badge color="success" className="font-bold text-xs shadow-sm">
                Rank #{winningBid.rank} ({awardCriterion === 'MEARB' ? 'MEARB' : 'LCRB'})
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Context Note */}
            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
              <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Authoritative Post-Qualification Validation:</p>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  The candidate <strong>{winningBid.supplierName}</strong> has officially passed all post-qualification verifications. 
                  Submitting this recommendation establishes the binding backend award link (`BACResolution.BiddingAwardRecommendationId`).
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

            {/* Winner Profile Grid */}
            <div className="p-4 rounded-lg bg-default-50 border border-default-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Winning Supplier / Bidder
                </span>
                <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  {winningBid.supplierName}
                </span>
                <span className="text-success font-semibold text-[11px] flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Post-Qualification Passed
                </span>
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Authoritative Awarded Amount
                </span>
                <span className="font-mono font-extrabold text-success text-base flex items-center gap-1 mt-0.5">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  {formatCurrency(winningBid.evaluatedBidPrice)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Derived from Evaluated Bid Price
                </span>
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Award Criteria & Standing
                </span>
                <span className="font-bold text-default-900 text-xs flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Rank #{winningBid.rank} ({awardCriterion})
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Responsive: Yes
                </span>
              </div>
            </div>

            {/* Justification Field */}
            <div className="space-y-1.5">
              <Label htmlFor="award-justification" className="text-xs font-bold text-default-900">
                Official Award Recommendation Justification <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="award-justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="text-xs"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                This legal justification is incorporated into the BAC Award Resolution.
              </p>
            </div>

            {/* Optional Remarks */}
            <div className="space-y-1.5">
              <Label htmlFor="award-remarks" className="text-xs font-semibold text-default-800">
                BAC Deliberation / Secretariat Remarks (Optional)
              </Label>
              <Textarea
                id="award-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Unanimously recommended by the BAC members during regular session."
                rows={2}
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
              disabled={recommendAwardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className="gap-1.5 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={recommendAwardMutation.isPending}
            >
              {recommendAwardMutation.isPending ? (
                'Submitting Recommendation...'
              ) : (
                <>
                  <FileCheck2 className="h-4 w-4" />
                  Submit Award Recommendation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
