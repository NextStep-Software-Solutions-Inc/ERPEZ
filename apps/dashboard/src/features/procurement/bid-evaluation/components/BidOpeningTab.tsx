import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  FolderOpen,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { RecordBidOpeningDialog } from '../dialogs/RecordBidOpeningDialog'
import { useProjectBiddingSubmissions } from '../hooks/useBidEvaluationApi'
import type { BiddingSubmissionResponse } from '../types/bidEvaluationApi.types'
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

interface BidOpeningTabProps {
  projectId: string
  projectName?: string
  abc?: number
  biddingActivityScheduleId?: string | null
}

export function BidOpeningTab({
  projectId,
  biddingActivityScheduleId,
}: BidOpeningTabProps) {
  const {
    data: submissions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProjectBiddingSubmissions(projectId)

  const [selectedSubmission, setSelectedSubmission] = useState<BiddingSubmissionResponse | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = (submission: BiddingSubmissionResponse) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

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

  // Statistics calculation
  const totalSubmissions = submissions.length
  const env1Passed = submissions.filter((s) => s.openingRecord?.envelope1Result === 'Passed').length
  const env1Failed = submissions.filter((s) => s.openingRecord?.envelope1Result === 'Failed').length
  const pendingOpening = submissions.filter((s) => !s.openingRecord || s.openingRecord.envelope1Result === 'Pending').length

  const isValidGuid = !!projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)

  if (!isValidGuid) {
    return (
      <div className="w-full py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center my-4">
        <FolderOpen className="h-10 w-10 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Select an Active Public Bidding Project</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          Please select a live public bidding project from the dropdown above to load submitted bidding packages and conduct the bid opening session.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading submitted bidding packages...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold">Failed to load submissions</AlertTitle>
        <AlertDescription className="text-xs mt-1 flex items-center justify-between">
          <span>{error.message || 'An error occurred while fetching project submissions.'}</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="h-7 text-xs">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. SUMMARY STATISTICS CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-default-900">{totalSubmissions}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Submitted bid packages</p>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Opening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-600">{pendingOpening}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting session verification</p>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Envelope 1 Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-success">{env1Passed}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Eligible for financial opening</p>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Envelope 1 Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-destructive">{env1Failed}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Disqualified (Sealed Env 2)</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. SUBMISSIONS & OPENING TABLE */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-default-100 bg-default-50/50">
          <div>
            <CardTitle className="text-base font-bold text-default-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Bidding Submissions & Opening Records
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Official records of bidders, submission timestamps, bid security compliance, and Envelope 1/2 opening results.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Records
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto text-default-300" />
              <p className="text-sm font-semibold text-default-700">No Bidding Packages Submitted Yet</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Bidders who submit their bidding packages before the scheduled deadline will appear here for BAC opening.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-default-50/70">
                <TableRow>
                  <TableHead className="font-bold text-default-900">Bidder / Supplier</TableHead>
                  <TableHead className="font-bold text-default-900">Submitted At</TableHead>
                  <TableHead className="font-bold text-default-900">Bid Security</TableHead>
                  <TableHead className="font-bold text-default-900">Submitted Amount</TableHead>
                  <TableHead className="font-bold text-default-900">Envelope 1 (Technical)</TableHead>
                  <TableHead className="font-bold text-default-900">Envelope 2 (Financial / As-Read)</TableHead>
                  <TableHead className="font-bold text-default-900">BAC Opening Audit</TableHead>
                  <TableHead className="text-right font-bold text-default-900">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => {
                  const hasOpening = !!sub.openingRecord
                  const isPass = sub.openingRecord?.envelope1Result === 'Passed'
                  const isFail = sub.openingRecord?.envelope1Result === 'Failed'

                  return (
                    <TableRow
                      key={sub.id}
                      className={`transition-colors ${
                        isFail
                          ? 'bg-destructive/5'
                          : isPass
                          ? 'bg-success/5'
                          : 'hover:bg-default-50/50'
                      }`}
                    >
                      {/* Bidder Info */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-bold text-default-900 flex items-center gap-1.5 text-xs">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            {sub.supplierName}
                          </span>
                          {sub.tinNumber && (
                            <span className="text-[11px] text-muted-foreground block">
                              TIN: {sub.tinNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Submission Timestamp */}
                      <TableCell className="text-xs font-medium">
                        <div className="flex items-center gap-1 text-default-700">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {formatDate(sub.submittedAt)}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                          {sub.submissionType}
                        </span>
                      </TableCell>

                      {/* Bid Security */}
                      <TableCell className="text-xs">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-default-800 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            {sub.bidSecurityType || 'None/Decl.'}
                          </span>
                          {sub.bidSecurityAmount && (
                            <span className="text-[11px] text-muted-foreground block">
                              {formatCurrency(sub.bidSecurityAmount)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Submitted Amount */}
                      <TableCell className="text-xs font-semibold text-default-900">
                        {formatCurrency(sub.originalProposedAmount)}
                      </TableCell>

                      {/* Envelope 1 Result */}
                      <TableCell>
                        <div className="space-y-1">
                          {!hasOpening || sub.openingRecord?.envelope1Result === 'Pending' ? (
                            <Badge color="warning" variant="soft" className="font-semibold text-[10px]">
                              Pending Examination
                            </Badge>
                          ) : isPass ? (
                            <Badge color="success" className="font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Passed
                            </Badge>
                          ) : (
                            <div className="space-y-1">
                              <Badge color="destructive" className="font-bold text-[10px] flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Disqualified
                              </Badge>
                              {sub.openingRecord?.disqualificationReason && (
                                <p className="text-[10px] text-destructive italic max-w-xs truncate">
                                  {sub.openingRecord.disqualificationReason}
                                </p>
                              )}
                            </div>
                          )}
                          {sub.documents && sub.documents.length > 0 && (
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              {sub.documents.filter((d) => (d.envelopeType ?? 1) === 1).length} Envelope 1 docs
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Envelope 2 Status & As-Read Amount */}
                      <TableCell>
                        {!hasOpening || sub.openingRecord?.envelope1Result === 'Pending' ? (
                          <div className="space-y-0.5">
                            <Badge color="secondary" variant="soft" className="font-semibold text-[10px] flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Sealed
                            </Badge>
                            {sub.documents && sub.documents.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {sub.documents.filter((d) => d.envelopeType === 2).length} Envelope 2 docs
                              </span>
                            )}
                          </div>
                        ) : sub.openingRecord?.envelope2Opened ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-success text-xs block">
                              {formatCurrency(sub.openingRecord?.asReadBidAmount)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              (As-Read Bid Amount)
                            </span>
                            {sub.documents && sub.documents.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {sub.documents.filter((d) => d.envelopeType === 2).length} Envelope 2 docs
                              </span>
                            )}
                          </div>
                        ) : isPass ? (
                          <div className="space-y-0.5">
                            <Badge color="info" variant="soft" className="font-semibold text-[10px] flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Sealed (Eligible)
                            </Badge>
                            {sub.documents && sub.documents.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {sub.documents.filter((d) => d.envelopeType === 2).length} Envelope 2 docs
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge color="secondary" variant="soft" className="font-semibold text-[10px] flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Sealed / Disqualified
                            </Badge>
                            {sub.documents && sub.documents.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {sub.documents.filter((d) => d.envelopeType === 2).length} Envelope 2 docs
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* BAC Opening Audit */}
                      <TableCell className="text-xs">
                        {hasOpening ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-default-800 flex items-center gap-1 font-medium">
                              <UserCheck className="h-3 w-3 text-muted-foreground" />
                              {sub.openingRecord?.openedByName || 'BAC Officer'}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {formatDate(sub.openingRecord?.openedAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">-</span>
                        )}
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={hasOpening ? 'outline' : 'default'}
                          color={hasOpening ? 'default' : 'primary'}
                          onClick={() => handleOpenDialog(sub)}
                          className="h-8 text-xs font-semibold"
                        >
                          {hasOpening ? 'Edit Record' : 'Record Opening'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* RECORD BID OPENING DIALOG */}
      <RecordBidOpeningDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        submission={selectedSubmission}
        biddingActivityScheduleId={biddingActivityScheduleId}
      />
    </div>
  )
}
