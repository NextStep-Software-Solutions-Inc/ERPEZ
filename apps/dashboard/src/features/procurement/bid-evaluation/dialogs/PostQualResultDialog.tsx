import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck2,
  XCircle,
} from 'lucide-react'
import { useRecordPostQualificationResult } from '../hooks/useBidEvaluationApi'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

interface PostQualResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  evaluatedBid: BiddingEvaluatedBidResponse | null
}

export function PostQualResultDialog({
  open,
  onOpenChange,
  projectId,
  evaluatedBid,
}: PostQualResultDialogProps) {
  const recordResultMutation = useRecordPostQualificationResult()

  const [passed, setPassed] = useState<boolean>(true)
  const [findings, setFindings] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPassed(true)
      setFindings('')
      setValidationError(null)
    }
  }, [open, evaluatedBid])

  if (!evaluatedBid) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!passed && !findings.trim()) {
      setValidationError('Findings/grounds are mandatory when disqualifying a bidder.')
      return
    }

    try {
      await recordResultMutation.mutateAsync({
        projectId,
        data: {
          biddingEvaluatedBidId: evaluatedBid.id,
          passed,
          findings: findings.trim() ? findings.trim() : null,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record post-qualification result.'
      setValidationError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0 gap-0 overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-gradient-to-r from-amber-500/10 to-primary/5 border-b border-default-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-extrabold text-default-900 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-amber-600" />
                  Post-Qualification Verification Decision
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record BAC TWG verification of legal, technical, and financial responsive criteria.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="font-bold bg-white shadow-sm border-amber-300 text-amber-800">
                Rank #{evaluatedBid.rank} Bidder
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Bidder Card */}
            <div className="p-4 rounded-lg bg-default-50 border border-default-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Bidder under Post-Qualification
                </span>
                <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  {evaluatedBid.supplierName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                  Evaluated Bid Price
                </span>
                <span className="font-mono font-bold text-default-900 text-sm mt-0.5 block">
                  ₱ {evaluatedBid.evaluatedBidPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {validationError && (
              <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">Validation Error</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Decision Radio Group */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-default-700">
                Post-Qualification Finding Decision <span className="text-destructive">*</span>
              </Label>

              <RadioGroup
                value={passed ? 'pass' : 'fail'}
                onValueChange={(val) => {
                  setPassed(val === 'pass')
                  setValidationError(null)
                }}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  htmlFor="pq-pass"
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    passed
                      ? 'border-success bg-success/5 shadow-sm'
                      : 'border-default-200 hover:bg-default-50'
                  }`}
                >
                  <RadioGroupItem value="pass" id="pq-pass" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Passed (Responsive)
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Bidder satisfies all legal, technical, and financial capability requirements. Declares bidder as the winning calculated responsive bid.
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="pq-fail"
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    !passed
                      ? 'border-destructive bg-destructive/5 shadow-sm'
                      : 'border-default-200 hover:bg-default-50'
                  }`}
                >
                  <RadioGroupItem value="fail" id="pq-fail" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Disqualify (Post-Disqualification)
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Deficiencies found during post-qualification. Marks bidder as Disqualified and automatically initiates post-qualification on Rank #{evaluatedBid.rank + 1}.
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Findings Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="pq-findings" className="text-xs font-bold text-default-800">
                Post-Qualification Evaluation Findings / Ground Notes{' '}
                {!passed && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="pq-findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder={
                  passed
                    ? 'e.g. Tax clearance, PhilGEPS Platinum, single largest completed contract (SLCC), and ongoing commitments verified and found compliant.'
                    : 'Specify grounds for post-disqualification (e.g. Failure to submit required licenses, non-compliance with technical specifications, negative slippage in ongoing contracts).'
                }
                rows={4}
                className={`text-xs ${!passed ? 'border-destructive/40 focus:border-destructive' : ''}`}
                required={!passed}
              />
              <p className="text-[10px] text-muted-foreground">
                Findings are logged to the official compliance audit log.
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-default-50 border-t border-default-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={recordResultMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color={passed ? 'success' : 'destructive'}
              className="gap-1.5 font-bold shadow-sm text-white"
              disabled={recordResultMutation.isPending}
            >
              {recordResultMutation.isPending ? (
                'Saving Decision...'
              ) : passed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Post-Qualification Pass
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Disqualify & Cascade to Rank #{evaluatedBid.rank + 1}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
