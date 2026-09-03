import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  History,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { PostQualResultDialog } from '../dialogs/PostQualResultDialog'
import {
  useLogPostQualificationDocsReceived,
  useProjectBidEvaluation,
  useSendPostQualificationNotice,
} from '../hooks/useBidEvaluationApi'
import { SlaDeadlineBadge } from './SlaDeadlineBadge'
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

interface PostQualificationTabProps {
  projectId: string
  projectName?: string
}

export function PostQualificationTab({
  projectId,
}: PostQualificationTabProps) {
  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjectBidEvaluation(projectId)

  const sendNoticeMutation = useSendPostQualificationNotice()
  const logDocsMutation = useLogPostQualificationDocsReceived()

  const [selectedBidderForResult, setSelectedBidderForResult] =
    useState<BiddingEvaluatedBidResponse | null>(null)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

  const evaluatedBids = evaluation?.evaluatedBids ?? []
  const hasEvaluation = evaluatedBids.length > 0

  // Sort bids by rank ascending
  const sortedBids = [...evaluatedBids].sort((a, b) => a.rank - b.rank)

  // Identify currently active post-qualification bidder
  const activeBidder =
    sortedBids.find(
      (b) =>
        b.postQualification &&
        b.postQualification.status !== 'Passed' &&
        b.postQualification.status !== 'Disqualified'
    ) ||
    sortedBids.find((b) => b.status === 'Passed_PostQual') ||
    sortedBids.find((b) => b.status !== 'Disqualified') ||
    sortedBids[0]

  const activePq = activeBidder.postQualification

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

  const handleSendNotice = async (bid: BiddingEvaluatedBidResponse) => {
    try {
      await sendNoticeMutation.mutateAsync({
        projectId,
        data: {
          biddingEvaluatedBidId: bid.id,
        },
      })
    } catch {
      // Toast handled by API interceptor
    }
  }

  const handleLogDocs = async (bid: BiddingEvaluatedBidResponse) => {
    try {
      await logDocsMutation.mutateAsync({
        projectId,
        data: {
          biddingEvaluatedBidId: bid.id,
        },
      })
    } catch {
      // Toast handled by API interceptor
    }
  }

  const handleOpenResultDialog = (bid: BiddingEvaluatedBidResponse) => {
    setSelectedBidderForResult(bid)
    setIsResultDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading Post-Qualification workspace...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold">Failed to load Post-Qualification data</AlertTitle>
        <AlertDescription className="text-xs mt-1 flex items-center justify-between">
          <span>{error.message || 'An error occurred while loading post-qualification records.'}</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="h-7 text-xs">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasEvaluation) {
    return (
      <Card className="border border-default-200 shadow-sm bg-white p-12 text-center text-muted-foreground space-y-3">
        <FileText className="h-10 w-10 mx-auto text-default-300" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-default-800">
            Post-Qualification Not Available
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Please execute the mathematical Bid Evaluation & Ranking in Tab 2 first. The backend will automatically initialize post-qualification on Rank #1.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE POST-QUALIFICATION FOCUS CARD */}
      <Card
        className={`border shadow-sm bg-white overflow-hidden ${
          activePq?.status === 'Passed'
            ? 'border-success/40 bg-success/5 border-l-4 border-l-success'
            : activePq?.status === 'Disqualified'
            ? 'border-destructive/40 bg-destructive/5 border-l-4 border-l-destructive'
            : 'border-amber-300 bg-amber-50/20 border-l-4 border-l-amber-500'
        }`}
      >
        <CardHeader className="py-4 border-b border-default-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold text-default-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                Active Post-Qualification Verification: Rank #{activeBidder.rank} Bidder
              </CardTitle>
              <Badge
                color={
                  activePq?.status === 'Passed'
                    ? 'success'
                    : activePq?.status === 'Disqualified'
                    ? 'destructive'
                    : activePq?.status === 'UnderEvaluation'
                    ? 'info'
                    : 'warning'
                }
                className="font-bold text-[10px] uppercase px-2 py-0.5"
              >
                Status: {activePq?.status || 'Pending Initialization'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Sequential post-qualification verification. Only the highest-ranked active candidate is verified.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <SlaDeadlineBadge
              targetDeadlineDate={activePq?.targetDeadlineDate}
              isCompleted={activePq?.status === 'Passed'}
              status={activePq?.status}
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Bidder Profile Brief */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-white border border-default-200 text-xs shadow-sm">
            <div>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                Supplier / Candidate
              </span>
              <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                {activeBidder.supplierName}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                Official Rank
              </span>
              <span className="font-extrabold text-primary text-sm mt-0.5 block">
                Rank #{activeBidder.rank} ({evaluation.awardCriterion === 'LCRB' ? 'LCB' : 'MEARB'})
              </span>
            </div>

            <div>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                Evaluated Bid Price
              </span>
              <span className="font-mono font-bold text-default-900 text-sm mt-0.5 block">
                {formatCurrency(activeBidder.evaluatedBidPrice)}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                Backend Target Deadline
              </span>
              <span className="font-mono font-semibold text-default-900 text-xs flex items-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(activePq?.targetDeadlineDate)}
              </span>
            </div>
          </div>

          {/* Step Progression Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Notice Dispatch */}
            <div
              className={`p-4 rounded-lg border transition-all ${
                activePq?.postQualificationNoticeSentAt
                  ? 'border-success/30 bg-success/5'
                  : 'border-amber-300 bg-white shadow-sm ring-2 ring-amber-400/20'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px]">
                    1
                  </span>
                  Notice of Post-Qual
                </span>
                {activePq?.postQualificationNoticeSentAt ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Badge color="warning" variant="soft" className="text-[10px]">
                    Required Action
                  </Badge>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <p>
                  {activePq?.postQualificationNoticeSentAt
                    ? `Dispatched: ${formatDate(activePq.postQualificationNoticeSentAt)}`
                    : 'Dispatch formal post-qualification notice to bidder to start document submission deadline.'}
                </p>
              </div>

              {!activePq?.postQualificationNoticeSentAt && activePq?.status !== 'Disqualified' && (
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => void handleSendNotice(activeBidder)}
                  disabled={sendNoticeMutation.isPending}
                  className="w-full mt-3 h-8 text-xs font-bold gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendNoticeMutation.isPending ? 'Sending Notice...' : 'Send Notice to Bidder'}
                </Button>
              )}
            </div>

            {/* Step 2: Documents Received */}
            <div
              className={`p-4 rounded-lg border transition-all ${
                activePq?.docsReceivedDate
                  ? 'border-success/30 bg-success/5'
                  : activePq?.postQualificationNoticeSentAt
                  ? 'border-amber-300 bg-white shadow-sm ring-2 ring-amber-400/20'
                  : 'border-default-200 bg-default-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px]">
                    2
                  </span>
                  Original Documents Log
                </span>
                {activePq?.docsReceivedDate ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : activePq?.postQualificationNoticeSentAt ? (
                  <Badge color="info" variant="soft" className="text-[10px]">
                    Awaiting Docs
                  </Badge>
                ) : (
                  <Badge color="secondary" variant="soft" className="text-[10px]">
                    Pending Step 1
                  </Badge>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <p>
                  {activePq?.docsReceivedDate
                    ? `Received: ${formatDate(activePq.docsReceivedDate)}`
                    : 'Log physical or authenticated original documents when delivered by the bidder.'}
                </p>
              </div>

              {activePq?.postQualificationNoticeSentAt &&
                !activePq.docsReceivedDate &&
                activePq.status !== 'Disqualified' && (
                  <Button
                    size="sm"
                    color="warning"
                    onClick={() => void handleLogDocs(activeBidder)}
                    disabled={logDocsMutation.isPending}
                    className="w-full mt-3 h-8 text-xs font-bold gap-1.5 text-amber-950"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {logDocsMutation.isPending ? 'Logging Docs...' : 'Log Documents Received'}
                  </Button>
                )}
            </div>

            {/* Step 3: TWG Verification Result */}
            <div
              className={`p-4 rounded-lg border transition-all ${
                activePq?.status === 'Passed'
                  ? 'border-success bg-success/10 shadow-sm'
                  : activePq?.status === 'Disqualified'
                  ? 'border-destructive bg-destructive/10 shadow-sm'
                  : activePq?.docsReceivedDate
                  ? 'border-amber-300 bg-white shadow-sm ring-2 ring-amber-400/20'
                  : 'border-default-200 bg-default-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-default-900 flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px]">
                    3
                  </span>
                  Verification Decision
                </span>
                {activePq?.status === 'Passed' ? (
                  <Badge color="success" className="text-[10px] font-bold">
                    Passed (LCRB)
                  </Badge>
                ) : activePq?.status === 'Disqualified' ? (
                  <Badge color="destructive" className="text-[10px] font-bold">
                    Disqualified
                  </Badge>
                ) : (
                  <Badge color="secondary" variant="soft" className="text-[10px]">
                    Evaluation Pending
                  </Badge>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                {activePq?.status === 'Passed' ? (
                  <p className="text-success-900 font-semibold">
                    Candidate verified as Lowest Calculated Responsive Bidder. Ready for award recommendation.
                  </p>
                ) : activePq?.status === 'Disqualified' ? (
                  <p className="text-destructive font-semibold">
                    Bidder post-disqualified. Next ranked candidate automatically initialized.
                  </p>
                ) : (
                  <p>
                    Execute BAC TWG examination of licenses, SLCC, financial capability, and technical compliance.
                  </p>
                )}
              </div>

              {activePq?.docsReceivedDate &&
                activePq.status !== 'Passed' &&
                activePq.status !== 'Disqualified' && (
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleOpenResultDialog(activeBidder)}
                    className="w-full mt-3 h-8 text-xs font-bold gap-1.5"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    Record Verification Decision
                  </Button>
                )}
            </div>
          </div>

          {/* Findings Display if present */}
          {activePq?.findings && (
            <div className="p-3.5 rounded-lg bg-white border border-default-200 space-y-1 text-xs shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Official Verification Findings / Notes:
              </span>
              <p className="text-default-800 leading-relaxed italic">{activePq.findings}</p>
              {activePq.verifiedByName && (
                <span className="text-[10px] text-muted-foreground block pt-1">
                  Recorded by: <strong>{activePq.verifiedByName}</strong> on {formatDate(activePq.completedAt)}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. HISTORICAL POST-QUALIFICATION PROGRESSION TABLE */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="py-4 border-b border-default-100 bg-default-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-default-900 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Post-Qualification Candidates Progression & Audit Trail
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Historical record of post-qualification notices, document logs, SLA timers, and verification findings per rank.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Trail
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-default-50/70">
              <TableRow>
                <TableHead className="w-[80px] font-bold text-default-900">Rank</TableHead>
                <TableHead className="font-bold text-default-900">Bidder / Supplier</TableHead>
                <TableHead className="font-bold text-default-900">Evaluated Price</TableHead>
                <TableHead className="font-bold text-default-900">Notice Sent</TableHead>
                <TableHead className="font-bold text-default-900">Docs Received</TableHead>
                <TableHead className="font-bold text-default-900">Backend Deadline</TableHead>
                <TableHead className="font-bold text-default-900">Post-Qual Status</TableHead>
                <TableHead className="font-bold text-default-900">Findings / Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBids.map((bid) => {
                const pq = bid.postQualification
                const isPassed = pq?.status === 'Passed'
                const isDisqualified = pq?.status === 'Disqualified'
                const isUnderEval = pq?.status === 'UnderEvaluation'
                const isPendingDocs = pq?.status === 'PendingDocs'

                return (
                  <TableRow
                    key={bid.id}
                    className={`transition-colors ${
                      isDisqualified
                        ? 'bg-destructive/5'
                        : isPassed
                        ? 'bg-success/5 border-l-4 border-l-success'
                        : isUnderEval
                        ? 'bg-info/5'
                        : isPendingDocs
                        ? 'bg-amber-50/30'
                        : 'opacity-50'
                    }`}
                  >
                    {/* Rank */}
                    <TableCell className="font-bold text-xs">
                      {isDisqualified ? (
                        <span className="text-gray-400 italic">Rank #{bid.rank}</span>
                      ) : (
                        <Badge
                          color={bid.rank === 1 ? 'success' : 'secondary'}
                          className="font-bold px-2 py-0.5 text-xs"
                        >
                          Rank #{bid.rank}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Supplier */}
                    <TableCell>
                      <span className="font-bold text-default-900 flex items-center gap-1.5 text-xs">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        {bid.supplierName}
                      </span>
                    </TableCell>

                    {/* Evaluated Price */}
                    <TableCell className="text-xs font-mono font-semibold text-default-900">
                      {formatCurrency(bid.evaluatedBidPrice)}
                    </TableCell>

                    {/* Notice Sent Date */}
                    <TableCell className="text-xs">
                      {pq?.postQualificationNoticeSentAt ? (
                        <span className="font-mono text-default-800">
                          {formatDate(pq.postQualificationNoticeSentAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </TableCell>

                    {/* Docs Received Date */}
                    <TableCell className="text-xs">
                      {pq?.docsReceivedDate ? (
                        <span className="font-mono text-default-800">
                          {formatDate(pq.docsReceivedDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </TableCell>

                    {/* Target Deadline */}
                    <TableCell className="text-xs">
                      {pq?.targetDeadlineDate ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-default-800 block">
                            {formatDate(pq.targetDeadlineDate)}
                          </span>
                          <SlaDeadlineBadge
                            targetDeadlineDate={pq.targetDeadlineDate}
                            isCompleted={isPassed}
                            status={pq.status}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </TableCell>

                    {/* Post-Qual Status */}
                    <TableCell>
                      {!pq ? (
                        <Badge color="secondary" variant="soft" className="text-[10px]">
                          Not Queued
                        </Badge>
                      ) : isPassed ? (
                        <Badge color="success" className="font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Passed
                        </Badge>
                      ) : isDisqualified ? (
                        <Badge color="destructive" className="font-bold text-[10px] flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Disqualified
                        </Badge>
                      ) : isUnderEval ? (
                        <Badge color="info" className="font-bold text-[10px]">
                          Under Evaluation
                        </Badge>
                      ) : (
                        <Badge color="warning" className="font-bold text-[10px]">
                          Pending Docs
                        </Badge>
                      )}
                    </TableCell>

                    {/* Findings & Audit */}
                    <TableCell className="text-xs">
                      {pq ? (
                        <div className="space-y-0.5 max-w-xs">
                          {pq.findings && (
                            <p className="text-[11px] text-default-800 truncate" title={pq.findings}>
                              {pq.findings}
                            </p>
                          )}
                          {pq.verifiedByName && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {pq.verifiedByName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* POST QUALIFICATION RESULT MODAL */}
      <PostQualResultDialog
        open={isResultDialogOpen}
        onOpenChange={setIsResultDialogOpen}
        projectId={projectId}
        evaluatedBid={selectedBidderForResult}
      />
    </div>
  )
}
