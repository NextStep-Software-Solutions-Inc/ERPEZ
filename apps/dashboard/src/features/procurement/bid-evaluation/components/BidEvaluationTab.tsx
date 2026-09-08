import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  Calculator,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { EvaluateBidsDialog } from '../dialogs/EvaluateBidsDialog'
import {
  useProjectBidEvaluation,
  useProjectBiddingSubmissions,
} from '../hooks/useBidEvaluationApi'
import type { BiddingEvaluatedBidResponse } from '../types/bidEvaluationApi.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BidEvaluationTabProps {
  projectId: string
  projectName?: string
  abc?: number
  awardCriterion?: 'LCRB' | 'MEARB' | string
  technicalWeight?: number | null
  financialWeight?: number | null
}

export function BidEvaluationTab({
  projectId,
  awardCriterion = '',
  technicalWeight,
  financialWeight,
}: BidEvaluationTabProps) {
  const {
    data: evaluation,
    isLoading: isEvalLoading,
    isError: isEvalError,
    error: evalError,
    refetch: refetchEval,
  } = useProjectBidEvaluation(projectId)

  const { data: submissions = [] } = useProjectBiddingSubmissions(projectId)

  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false)

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val)
  }

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const admittedSubmissions = submissions.filter(
    (s) => s.openingRecord && s.openingRecord.envelope1Result === 'Passed' && s.openingRecord.envelope2Opened
  )

  const evaluatedBids = evaluation?.evaluatedBids ?? []
  const hasEvaluation = evaluatedBids.length > 0
  const activeCriterion = evaluation?.awardCriterion ?? awardCriterion
  const activeTechWeight = evaluation?.technicalWeight ?? technicalWeight ?? 70
  const activeFinWeight = evaluation?.financialWeight ?? financialWeight ?? 30

  if (isEvalLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading authoritative bid evaluation data...</p>
      </div>
    )
  }

  if (isEvalError) {
    return (
      <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold">Failed to load bid evaluation</AlertTitle>
        <AlertDescription className="text-xs mt-1 flex items-center justify-between">
          <span>{evalError.message || 'An error occurred while fetching the evaluation matrix.'}</span>
          <Button variant="outline" size="sm" onClick={() => void refetchEval()} className="h-7 text-xs">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Missing Criterion Warning Banner */}
      {!activeCriterion && !hasEvaluation && (
        <Alert variant="outline" className="border-amber-300 bg-amber-50/50 text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-xs font-bold">Authoritative Evaluation Criterion Required</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            No bid evaluation criterion has been established for this project. Under RA 12009 (NGPA) / RA 9184, an authoritative criterion (such as LCRB for Goods/Civil Works or MEARB) must be selected before bid evaluation can proceed.
          </AlertDescription>
        </Alert>
      )}

      {/* 1. TOP ACTION & CRITERION SUMMARY */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-default-50/50 border-b border-default-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-default-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Authoritative Bid Evaluation & Ranking Matrix
              </CardTitle>
              {activeCriterion ? (
                <Badge
                  variant="outline"
                  className="font-bold border-purple-200 bg-purple-50 text-purple-700 text-xs shadow-sm"
                >
                  {activeCriterion === 'MEARB'
                    ? `MEARB (${activeTechWeight}% Tech / ${activeFinWeight}% Fin)`
                    : activeCriterion === 'LCRB'
                    ? 'LCRB (Lowest Price)'
                    : activeCriterion}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="font-bold border-amber-300 bg-amber-50 text-amber-800 text-xs shadow-sm"
                >
                  Criterion Required
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {activeCriterion === 'MEARB'
                ? 'Mathematical ranking by weighted quality-price formula calculated authoritatively on the backend.'
                : activeCriterion === 'LCRB'
                ? 'Mathematical ranking by lowest evaluated price after arithmetic corrections calculated by the backend.'
                : 'An authoritative bid evaluation criterion must be established before executing bid evaluation.'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchEval()}
              className="h-9 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Rankings
            </Button>

            <Button
              color="primary"
              size="sm"
              onClick={() => setIsEvaluateModalOpen(true)}
              disabled={admittedSubmissions.length === 0}
              className="h-9 text-xs font-bold gap-1.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              {hasEvaluation ? 'Re-evaluate Bids' : 'Execute Bid Evaluation'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!hasEvaluation ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <Calculator className="h-10 w-10 mx-auto text-default-300" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-default-800">
                  Bid Evaluation Not Yet Executed
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {admittedSubmissions.length > 0
                    ? `There are ${admittedSubmissions.length} admitted bidders from Bid Opening ready for arithmetic evaluation. Click 'Execute Bid Evaluation' to run the ranking algorithm.`
                    : 'No eligible bidders with completed Envelope 1 & 2 openings found. Record bid openings in Tab 1 first.'}
                </p>
              </div>
              {admittedSubmissions.length > 0 && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setIsEvaluateModalOpen(true)}
                  className="font-bold gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Bid Evaluation
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-default-50/70">
                <TableRow>
                  <TableHead className="w-[90px] font-bold text-default-900">Rank</TableHead>
                  <TableHead className="font-bold text-default-900">Supplier / Bidder</TableHead>
                  <TableHead className="font-bold text-default-900">Submitted Amount</TableHead>
                  <TableHead className="font-bold text-default-900">As-Read Amount</TableHead>
                  <TableHead className="font-bold text-default-900 bg-primary/5">Evaluated Bid Price</TableHead>
                  {activeCriterion === 'MEARB' && (
                    <>
                      <TableHead className="font-bold text-default-900">Technical Score</TableHead>
                      <TableHead className="font-bold text-default-900">Financial Score (Norm.)</TableHead>
                      <TableHead className="font-bold text-default-900 bg-purple-50">Weighted Total</TableHead>
                    </>
                  )}
                  <TableHead className="font-bold text-default-900">Responsiveness</TableHead>
                  <TableHead className="font-bold text-default-900">Workflow Status</TableHead>
                  <TableHead className="font-bold text-default-900 text-right">Evaluation Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluatedBids.map((bid: BiddingEvaluatedBidResponse) => {
                  const isRank1 = bid.rank === 1
                  const isDisqualified = bid.status === 'Disqualified' || !bid.isResponsive
                  const isPassedPostQual = bid.status === 'Passed_PostQual'

                  return (
                    <TableRow
                      key={bid.id}
                      className={`transition-colors ${
                        isDisqualified
                          ? 'opacity-50 bg-default-50/50 line-through'
                          : isPassedPostQual
                          ? 'bg-success/5 border-l-4 border-l-success'
                          : isRank1
                          ? 'bg-primary/5 border-l-4 border-l-primary font-medium'
                          : 'hover:bg-default-50/50'
                      }`}
                    >
                      {/* Rank Badge */}
                      <TableCell className="font-bold">
                        {isDisqualified ? (
                          <span className="text-gray-400 font-medium italic text-xs">Disqualified</span>
                        ) : isRank1 ? (
                          <Badge color="success" className="font-bold px-2 py-0.5 text-xs shadow-sm">
                            1st ({activeCriterion === 'LCRB' ? 'LCB' : 'MEARB'})
                          </Badge>
                        ) : bid.rank === 2 ? (
                          <Badge color="info" className="font-bold px-2 py-0.5 text-xs">
                            2nd
                          </Badge>
                        ) : (
                          <Badge color="secondary" className="font-bold px-2 py-0.5 text-xs">
                            {bid.rank}th
                          </Badge>
                        )}
                      </TableCell>

                      {/* Supplier Name */}
                      <TableCell>
                        <span className="font-bold text-default-900 flex items-center gap-1.5 text-xs">
                          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          {bid.supplierName}
                        </span>
                      </TableCell>

                      {/* Original Submitted Amount */}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatCurrency(bid.originalProposedAmount)}
                      </TableCell>

                      {/* As-Read Amount */}
                      <TableCell className="text-xs text-default-800">
                        {formatCurrency(bid.asReadBidAmount)}
                      </TableCell>

                      {/* Evaluated Bid Price */}
                      <TableCell className="text-xs font-bold text-primary bg-primary/5">
                        {formatCurrency(bid.evaluatedBidPrice)}
                      </TableCell>

                      {/* MEARB columns */}
                      {activeCriterion === 'MEARB' && (
                        <>
                          <TableCell className="text-xs font-mono text-default-800">
                            {bid.technicalScore !== null && bid.technicalScore !== undefined
                              ? `${bid.technicalScore.toFixed(2)} pts`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-default-800">
                            {bid.normalizedFinancialScore !== null && bid.normalizedFinancialScore !== undefined
                              ? `${bid.normalizedFinancialScore.toFixed(2)} pts`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-extrabold text-purple-700 bg-purple-50">
                            {bid.totalScore !== null && bid.totalScore !== undefined
                              ? `${bid.totalScore.toFixed(2)}%`
                              : '-'}
                          </TableCell>
                        </>
                      )}

                      {/* Responsiveness */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                color={bid.isResponsive ? 'success' : 'destructive'}
                                variant="soft"
                                className="font-bold text-[10px] cursor-help flex items-center gap-1 w-fit"
                              >
                                {bid.isResponsive ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" /> Responsive
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" /> Non-Responsive
                                  </>
                                )}
                              </Badge>
                            </TooltipTrigger>
                            {!bid.isResponsive && bid.nonResponsiveReason && (
                              <TooltipContent color="destructive" className="text-xs p-2 max-w-xs">
                                <p className="font-semibold">Non-Responsive Reason:</p>
                                <p>{bid.nonResponsiveReason}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Workflow Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          color={
                            isDisqualified
                              ? 'destructive'
                              : isPassedPostQual
                              ? 'success'
                              : bid.status === 'Under_PostQual'
                              ? 'info'
                              : 'secondary'
                          }
                          className="font-bold text-[10px] capitalize px-2 py-0.5"
                        >
                          {bid.status === 'Passed_PostQual'
                            ? 'Post-Qual Passed'
                            : bid.status === 'Under_PostQual'
                            ? 'Under Post-Qual'
                            : bid.status}
                        </Badge>
                      </TableCell>

                      {/* Evaluation Audit */}
                      <TableCell className="text-right text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-default-800 flex items-center justify-end gap-1 font-medium">
                            <UserCheck className="h-3 w-3 text-muted-foreground" />
                            {evaluation?.evaluatedByName || 'TWG Evaluator'}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {formatDate(evaluation?.evaluatedAt)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 2. EVALUATION DIALOG */}
      <EvaluateBidsDialog
        open={isEvaluateModalOpen}
        onOpenChange={setIsEvaluateModalOpen}
        projectId={projectId}
        awardCriterion={activeCriterion}
        technicalWeight={activeTechWeight}
        financialWeight={activeFinWeight}
        admittedSubmissions={admittedSubmissions}
      />
    </div>
  )
}
