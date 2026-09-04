import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileCheck2,
  FileText,
  Link as LinkIcon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { AwardRecommendationDialog } from '../dialogs/AwardRecommendationDialog'
import { useProjectBidEvaluation } from '../hooks/useBidEvaluationApi'
import { BacResolutionModal } from './BacResolutionModal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AwardRecommendationTabProps {
  projectId: string
  projectName?: string
}

export function AwardRecommendationTab({
  projectId,
  projectName,
}: AwardRecommendationTabProps) {
  const navigate = useNavigate()
  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjectBidEvaluation(projectId)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  const evaluatedBids = evaluation?.evaluatedBids ?? []
  const awardRecommendation = evaluation?.awardRecommendation

  // Identify winning post-qualified bidder
  const winningBid = evaluatedBids.find(
    (b) => b.postQualification && b.postQualification.status === 'Passed' && b.isResponsive
  )

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

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading Award Recommendation state...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold">Failed to load Award Recommendation</AlertTitle>
        <AlertDescription className="text-xs mt-1 flex items-center justify-between">
          <span>{error.message || 'An error occurred while fetching award recommendation.'}</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="h-7 text-xs">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER SUMMARY */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="py-4 border-b border-default-100 bg-default-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-default-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Bids and Awards Committee (BAC) Award Recommendation
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Authoritative recommendation of award based on verified Post-Qualification results under RA 12009 / RA 9184.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Recommendation
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* CASE A: AWARD RECOMMENDATION ALREADY CREATED */}
          {awardRecommendation ? (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Award className="h-40 w-40 text-emerald-600" />
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-emerald-200">
                  <div className="space-y-1">
                    <Badge color="success" className="font-bold text-xs shadow-sm mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Award Recommendation Active
                    </Badge>
                    <h3 className="text-xl font-extrabold text-default-900">
                      Recommendation of Award to {awardRecommendation.supplierName}
                    </h3>
                    <p className="text-xs text-emerald-900 font-medium">
                      Formally recommended for contract award following successful post-qualification verification.
                    </p>
                  </div>

                  <Badge variant="outline" className="font-bold text-xs bg-white border-emerald-300 text-emerald-800">
                    Status: {awardRecommendation.status}
                  </Badge>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Winning Supplier / Awardee
                    </span>
                    <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      {awardRecommendation.supplierName}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Authoritative Awarded Amount
                    </span>
                    <span className="font-extrabold text-emerald-700 text-base flex items-center gap-1 mt-0.5">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      {formatCurrency(awardRecommendation.awardedAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Recommendation Date
                    </span>
                    <span className="font-mono font-semibold text-default-900 text-xs flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(awardRecommendation.recommendedAt)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Recommending BAC Officer
                    </span>
                    <span className="font-medium text-default-900 text-xs flex items-center gap-1 mt-1">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      {awardRecommendation.recommendedByName || 'BAC Secretariat'}
                    </span>
                  </div>
                </div>

                {/* Legal Justification */}
                {awardRecommendation.justification && (
                  <div className="mt-4 p-3.5 rounded-lg bg-white border border-emerald-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider block">
                      Official Legal Justification:
                    </span>
                    <p className="text-default-800 leading-relaxed italic">
                      "{awardRecommendation.justification}"
                    </p>
                  </div>
                )}

                {/* Optional Remarks */}
                {awardRecommendation.remarks && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-default-700">Remarks:</span> {awardRecommendation.remarks}
                  </div>
                )}

                {/* Binding BAC Resolution Linkage Indicator & Quick Actions */}
                <div className="mt-6 pt-4 border-t border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-emerald-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <LinkIcon className="h-3.5 w-3.5 text-emerald-600" />
                    BAC Resolution Linkage: <code className="font-mono text-[11px] bg-emerald-100/70 px-1.5 py-0.5 rounded">BACResolution.BiddingAwardRecommendationId = {awardRecommendation.id}</code>
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="h-8 text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 bg-white"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Preview Resolution Draft
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void navigate({ to: '/v2/bac-resolutions-public-bidding' })}
                      className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open BAC Resolutions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : winningBid ? (
            /* CASE B: CANDIDATE PASSED POST-QUAL, READY FOR AWARD RECOMMENDATION */
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge color="success" className="font-bold text-xs">
                        Post-Qualification Passed
                      </Badge>
                      <Badge variant="outline" className="font-bold text-xs text-primary border-primary/30 bg-white">
                        Rank #{winningBid.rank} ({evaluation?.awardCriterion === 'MEARB' ? 'MEARB' : 'LCRB'})
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-default-900 mt-1">
                      {winningBid.supplierName} has Passed Post-Qualification
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      The candidate has satisfied all responsive verification requirements. You can now formally create the BAC Award Recommendation.
                    </p>
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    onClick={() => setIsDialogOpen(true)}
                    className="font-bold gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white animate-in zoom-in-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Award Recommendation
                  </Button>
                </div>

                {/* Candidate Overview Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-white border border-emerald-200 text-xs shadow-sm">
                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Candidate Supplier
                    </span>
                    <span className="font-bold text-default-900 text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      {winningBid.supplierName}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Authoritative Evaluated Price
                    </span>
                    <span className="font-bold text-emerald-700 text-base mt-0.5 block">
                      {formatCurrency(winningBid.evaluatedBidPrice)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold block">
                      Post-Qual Verification Stamp
                    </span>
                    <span className="font-medium text-default-800 text-xs flex items-center gap-1 mt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      Verified on {formatDate(winningBid.postQualification?.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CASE C: NO CANDIDATE PASSED POST-QUAL YET */
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <FileText className="h-10 w-10 mx-auto text-default-300" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-default-800">
                  Award Recommendation Unavailable
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  A candidate must complete Bid Opening, arithmetic Evaluation, and successfully pass Post-Qualification verification before an Award Recommendation can be issued.
                </p>
              </div>
              <div className="pt-2">
                <Badge variant="outline" color="secondary" className="text-xs">
                  Awaiting Post-Qualification Pass in Tab 3
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AWARD RECOMMENDATION MODAL */}
      <AwardRecommendationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        awardCriterion={evaluation?.awardCriterion ?? 'LCRB'}
        winningBid={winningBid ?? null}
      />

      {/* BAC RESOLUTION DOCUMENT PREVIEW MODAL */}
      <BacResolutionModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        projectName={projectName}
        awardRecommendation={awardRecommendation}
      />
    </div>
  )
}
