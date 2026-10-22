import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2, FileText, Globe } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useToast } from '@/components/ui/use-toast'
import { ApplicantList } from '../components/ApplicantList'
import { ReviewWorkspace } from '../components/ReviewWorkspace'
import { useSupplierEvaluation } from '../hooks/useSupplierEvaluation'
import { UnsavedChangesDialog } from '../dialogs/UnsavedChangesDialog'
import { bulkDownloadDocuments } from '../utils/bulkDownload'
import { getBacResolutionRequest } from '@/features/procurement/bac-resolution/handlers/getBacResolutionRequest'
import { getRFQByIdRequest } from '../handlers/getRFQByIdRequest'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'

const useBACProjectDetails = createQueryHookFromTemplate(getBacResolutionRequest)
const useRFQDetails = createQueryHookFromTemplate(getRFQByIdRequest)

const isValidGuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export default function ManageSupplierPortalProjectPage({ projectId }: { projectId: string }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as any
  const source: 'rfq' | 'bac' = search?.source === 'bac' ? 'bac' : 'rfq'

  const { toast } = useToast()
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const isGuid = isValidGuid(projectId)

  // Fetch RFQ details if source is rfq
  const { data: rfqResponse, isLoading: isLoadingRfq } = useRFQDetails({
    pathParams: { id: projectId },
    queryParams: {},
    enabled: Boolean(projectId && isGuid && source === 'rfq'),
  })

  // Fetch BAC project details if source is bac
  const { data: bacProjectResponse, isLoading: isLoadingBac } = useBACProjectDetails({
    pathParams: { id: projectId },
    queryParams: {},
    enabled: Boolean(projectId && isGuid && source === 'bac'),
  })

  const isLoadingDetails = source === 'rfq' ? isLoadingRfq : isLoadingBac

  const projectInfo = useMemo(() => {
    if (source === 'rfq') {
      const rfq = (rfqResponse as any)?.data ?? rfqResponse
      if (!rfq || !rfq.id) return null
      return {
        id: rfq.id,
        title: rfq.description || rfq.rfqNumber || 'Request for Quotation',
        number: rfq.rfqNumber || (rfq.id ? rfq.id.substring(0, 8) : projectId.substring(0, 8)),
        modeOfProcurementName: rfq.modeOfProcurementName || 'SVP',
        abc: rfq.totalAmount || 0,
        deadline: rfq.deadline,
        status: rfq.status,
        source: 'rfq' as const,
      }
    }

    const bac = (bacProjectResponse as any)?.data ?? bacProjectResponse
    if (!bac || !bac.id) return null
    return {
      id: bac.id,
      title: bac.title || 'Procurement Project',
      number: bac.consolidatedPR?.cprNumber || (bac.id ? bac.id.substring(0, 8) : projectId.substring(0, 8)),
      modeOfProcurementName: bac.modeOfProcurementName || 'Public Bidding',
      abc: bac.abc || 0,
      deadline: '',
      status: bac.status,
      source: 'bac' as const,
    }
  }, [source, rfqResponse, bacProjectResponse, projectId])

  const isApproved = useMemo(() => {
    if (source !== 'rfq') return true
    const rfq = (rfqResponse as any)?.data ?? rfqResponse
    if (!rfq) return false
    return (
      rfq.status === 'Approved' ||
      rfq.status === 3 ||
      (typeof rfq.status === 'string' && rfq.status.toLowerCase() === 'approved')
    )
  }, [source, rfqResponse])

  const isCompetitiveBidding = useMemo(() => {
    if (source !== 'bac') return false
    const mode = (projectInfo?.modeOfProcurementName || '').toLowerCase()
    return (mode.includes('competitive') || mode.includes('public') || mode.includes('bidding'))
      && !mode.includes('small value') && !mode.includes('svp')
  }, [source, projectInfo])

  const {
    bids,
    selectedBid,
    selectedBidId,
    evalStatus,
    evalRemarks,
    setEvalStatus,
    setEvalRemarks,
    handleSelectBid,
    handleSaveEvaluation,
    isLoading: isLoadingBids,
    isSaving,
  } = useSupplierEvaluation(projectId, source, isApproved)

  const bidStats = {
    totalApplicants: bids.length,
    pending: bids.filter((bid) => bid.status === 'Pending').length,
    passed: bids.filter((bid) => bid.status === 'Passed').length,
    failed: bids.filter((bid) => bid.status === 'Failed').length,
  }

  const handleBulkDownload = useCallback(async () => {
    if (!selectedBid || selectedBid.documents.length === 0) {
      toast({
        title: 'No Documents',
        description: 'Select an applicant with documents to download.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsDownloading(true)
      await bulkDownloadDocuments(
        selectedBid.documents.map((doc) => ({
          name: doc.name,
          url: doc.url,
        })),
        `${(projectInfo?.title || 'Opportunity').replace(/\s+/g, '_')}_${selectedBid.supplierName.replace(/\s+/g, '_')}`,
      )

      toast({
        title: 'ZIP Download Complete',
        description: `Successfully downloaded ZIP archive containing ${selectedBid.documents.length} documents for ${selectedBid.supplierName}.`,
      })
    } catch (error) {
      console.error('Bulk download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the documents. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [selectedBid, projectInfo?.title, toast])

  const handleAllProjectDocumentsDownload = useCallback(async () => {
    try {
      setIsDownloading(true)
      const allDocuments = bids.flatMap((bid) =>
        bid.documents.map((doc) => ({
          name: `${bid.supplierName}_${doc.name}`,
          url: doc.url,
        })),
      )

      if (allDocuments.length === 0) {
        toast({
          title: 'No Documents',
          description: 'No documents available to download.',
          variant: 'destructive',
        })
        return
      }

      await bulkDownloadDocuments(
        allDocuments,
        `${(projectInfo?.title || 'Opportunity').replace(/\s+/g, '_')}_all_documents`,
      )

      toast({
        title: 'ZIP Download Complete',
        description: `Successfully downloaded ZIP archive containing ${allDocuments.length} documents from all applicants.`,
      })
    } catch (error) {
      console.error('Bulk download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the documents. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [bids, projectInfo?.title, toast])

  if (!isGuid) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-2xl font-bold">Invalid Opportunity ID</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The ID <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{projectId}</code> is not a valid UUID format. Please select an active opportunity from the Manage Supplier Portal list.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          Back to Opportunities List
        </Button>
      </div>
    )
  }

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading opportunity details...</span>
      </div>
    )
  }

  if (!projectInfo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Opportunity not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          Back to Portal
        </Button>
      </div>
    )
  }

  if (source === 'rfq' && !isApproved) {
    const rawStatus = projectInfo.status
    const displayStatus =
      typeof rawStatus === 'number'
        ? rawStatus === 0
          ? 'Draft'
          : rawStatus === 1
            ? 'Submitted / For Approval'
            : rawStatus === 2
              ? 'Returned'
              : 'Pending'
        : rawStatus || 'Draft'

    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-2xl font-bold">RFQ Not Approved</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The RFQ <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{projectInfo.number}</code> is currently in{' '}
          <strong>{displayStatus}</strong> status. The BAC Evaluator can only manage supplier submissions for approved RFQs.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          Back to Manage Supplier Portal
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{projectInfo.title}</h1>
            <Badge variant="outline" className="text-xs">
              {source === 'rfq' ? (
                <>
                  <FileText className="h-3 w-3 mr-1" /> Internal RFQ
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 mr-1" /> Public Portal
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projectInfo.number} • {projectInfo.modeOfProcurementName} • ABC: ₱
            {projectInfo.abc.toLocaleString()}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            onClick={handleAllProjectDocumentsDownload}
            variant="outline"
            className="gap-2 text-xs"
            disabled={isDownloading || bids.length === 0}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Bulk Download All (ZIP)
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Submissions</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{bidStats.totalApplicants}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending</p>
              <p className="mt-3 text-3xl font-bold text-amber-900">{bidStats.pending}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Passed / Responsive</p>
              <p className="mt-3 text-3xl font-bold text-emerald-900">{bidStats.passed}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Failed / Disqualified</p>
              <p className="mt-3 text-3xl font-bold text-red-900">{bidStats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {isLoadingBids ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading supplier submissions...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start min-h-[500px]">
          <ApplicantList
            bids={bids}
            selectedBidId={selectedBidId}
            onSelectBid={handleSelectBid}
          />
          <ReviewWorkspace
            selectedBid={selectedBid}
            projectId={projectId}
            isCompetitiveBidding={isCompetitiveBidding}
            evalStatus={evalStatus}
            evalRemarks={evalRemarks}
            onEvalStatusChange={setEvalStatus}
            onEvalRemarksChange={setEvalRemarks}
            onSaveEvaluation={handleSaveEvaluation}
            onBulkDownload={handleBulkDownload}
            isDownloading={isDownloading || isSaving}
          />
        </div>
      )}

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onDiscard={() => navigate({ to: '/v2/manage-supplier-portal' })}
        title="Unsaved Evaluation"
        description="You have unsaved evaluation changes. Are you sure you want to leave without saving?"
      />
    </div>
  )
}
