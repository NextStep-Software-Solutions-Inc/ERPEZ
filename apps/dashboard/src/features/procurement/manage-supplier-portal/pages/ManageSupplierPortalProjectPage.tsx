import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { mockProjects } from '../mocks/mockData'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/components/ui/use-toast'
import { ApplicantList } from '../components/ApplicantList'
import { ReviewWorkspace } from '../components/ReviewWorkspace'
import { useSupplierEvaluation } from '../hooks/useSupplierEvaluation'
import { UnsavedChangesDialog } from '../dialogs/UnsavedChangesDialog'
import { bulkDownloadDocuments } from '../utils/bulkDownload'

export default function ManageSupplierPortalProjectPage({ projectId }: { projectId: string }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const project = mockProjects.find(p => p.id === projectId)
  
  const {
    bids,
    selectedBid,
    selectedBidId,
    evalStatus,
    evalRemarks,
    setEvalStatus,
    setEvalRemarks,
    handleSelectBid,
    handleSaveEvaluation
  } = useSupplierEvaluation(projectId)

    const bidStats = {
    totalApplicants: bids.length,
    pending: bids.filter((bid) => bid.status === 'Pending').length,
    passed: bids.filter((bid) => bid.status === 'Passed').length,
    failed: bids.filter((bid) => bid.status === 'Failed').length,
  }
  
  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          Back to Portal
        </Button>
      </div>
    )
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
        selectedBid.documents.map(doc => ({
          name: doc.name,
          url: doc.url,
        })),
        `${project.title.replace(/\s+/g, '_')}_${selectedBid.supplierName.replace(/\s+/g, '_')}`
      )
      
      toast({
        title: 'Download Started',
        description: `Downloading ${selectedBid.documents.length} documents for ${selectedBid.supplierName}.`,
      })
    } catch (error) {
      console.error('Bulk download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the documents. Please try again.',
        color: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [selectedBid, project.title, toast])

  const handleAllProjectDocumentsDownload = useCallback(async () => {
    try {
      setIsDownloading(true)
      const allDocuments = bids.flatMap(bid => 
        bid.documents.map(doc => ({
          name: `${bid.supplierName}_${doc.name}`,
          url: doc.url,
        }))
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
        `${project.title.replace(/\s+/g, '_')}_all_documents`
      )
      
      toast({
        title: 'Download Started',
        description: `Downloading ${allDocuments.length} total documents from all applicants.`,
      })
    } catch (error) {
      console.error('Bulk download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the documents. Please try again.',
        color: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [bids, project.title, toast])

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/v2/manage-supplier-portal' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">{project.id} • {project.type} • ABC: ₱{project.abc.toLocaleString()}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button 
            onClick={handleAllProjectDocumentsDownload} 
            variant="outline" 
            className="gap-2"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Bulk Download All
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Applicants</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{bidStats.totalApplicants}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending</p>
              <p className="mt-3 text-3xl font-bold text-amber-900">{bidStats.pending}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Passed</p>
              <p className="mt-3 text-3xl font-bold text-emerald-900">{bidStats.passed}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Failed</p>
              <p className="mt-3 text-3xl font-bold text-red-900">{bidStats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start h-[calc(100vh-220px)]">
        <ApplicantList 
          bids={bids} 
          selectedBidId={selectedBidId} 
          onSelectBid={handleSelectBid} 
        />
        <ReviewWorkspace 
          selectedBid={selectedBid} 
          evalStatus={evalStatus}
          evalRemarks={evalRemarks}
          onEvalStatusChange={setEvalStatus}
          onEvalRemarksChange={setEvalRemarks}
          onSaveEvaluation={handleSaveEvaluation}
          onBulkDownload={handleBulkDownload}
          isDownloading={isDownloading}
        />
      </div>

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
