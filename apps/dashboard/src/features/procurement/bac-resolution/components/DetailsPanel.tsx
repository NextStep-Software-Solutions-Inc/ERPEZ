import { useState } from 'react'
import {
  FileText,
  ScrollText,
  ShieldCheck,
  Users,
  Send,
  Printer,
  Sparkles,
  Layers,
  FilePlus,
  Loader2,
  Trash2,
  AlertTriangle,
  Calendar,
  History,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Edit,
  Download,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BacResolutionStatusBadge } from './index'
import type {
  BacResolutionRole,
  BacResolutionWhereasClause,
  BacResolutionLogEntry,
  BacProjectDetails,
  ReturnBacResolutionPayload,
} from '../types'
import { createQueryHookFromTemplate, createMutationHookFromTemplate, useQueryClient, type APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import { getBacResolutionRequest } from '../handlers/getBacResolutionRequest'
import { generateBACResolutionDocumentRequest } from '../handlers/generateBacResolutionDocumentRequest'
import { downloadBacResolutionDocumentRequest } from '../handlers/downloadBacResolutionDocumentRequest'
import { useApproveBacResolution, useReturnBacResolution } from '../handlers/hooks'
import { ApproveBacResolutionDialog } from '../dialogs/ApproveBacResolutionDialog'
import { ReturnBacResolutionDialog } from '../dialogs/ReturnBacResolutionDialog'
import type { ApproveBacResolutionFormValues } from '../forms/ApproveBacResolutionForm'

const useBacResolution = createQueryHookFromTemplate(getBacResolutionRequest)
const useGenerateBACResolutionDocument = createMutationHookFromTemplate(
  generateBACResolutionDocumentRequest,
)
const useDownloadBacResolutionDocument = createMutationHookFromTemplate(
  downloadBacResolutionDocumentRequest,
)

interface DetailsPanelProps {
  selectedId: string | null
  role: BacResolutionRole
  isLoading?: boolean
  onEdit?: (project?: BacProjectDetails) => void
  onLinkPrs?: () => void
  onPrint?: () => void | Promise<void>
  onSubmit?: () => void | Promise<void>
  onViewDocument?: () => void
  onCreatePr?: () => void
  onDelete?: () => void
  onGenerateDocument?: () => void | Promise<void>
}


export function DetailsPanel({
  selectedId,
  role,
  isLoading = false,
  onEdit,
  onLinkPrs,
  onPrint,
  onSubmit,
  onCreatePr,
  onDelete
}: DetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const queryClient = useQueryClient()
  const { mutateAsync: approveBacResolution, isPending: isApproving } = useApproveBacResolution()
  const { mutateAsync: returnBacResolution, isPending: isReturning } = useReturnBacResolution()

  const { mutateAsync: generateBACResolutionDocument, isPending: isGenerating } =
    useGenerateBACResolutionDocument()
  const { mutateAsync: downloadBacResolutionDocument, isPending: isDownloading } =
    useDownloadBacResolutionDocument()

  const { data: responseData, isPending: isFetching } = useBacResolution(
    {
      pathParams: { id: selectedId || '' },
      queryParams: {},
      enabled: !!selectedId,
    },
  )

  const handleApprove = async ({ signedDocument }: ApproveBacResolutionFormValues) => {
    if (!selectedId) return

    const approveTask = async () => {
      // 1. Upload signed document file first to obtain attachmentFileId
      const formData = new FormData()
      formData.append('file', signedDocument)

      const uploadResponse = await api.post<APIResponse<string>>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const attachmentFileId = uploadResponse.data?.data
      if (!attachmentFileId) {
        throw new Error('Failed to upload signed document.')
      }

      await approveBacResolution({
        pathParams: { id: selectedId },
        payload: { attachmentFileId },
        queryParams: { id: selectedId }
      })


      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/bac/projects'),
      })
    }

    try {
      await toast.promise(approveTask(), {
        loading: 'Uploading document and approving BAC Resolution...',
        success: 'BAC Resolution approved successfully!',
        error: (err) =>
          err instanceof Error ? err.message : 'Failed to approve BAC Resolution.',
      })
      setApproveOpen(false)
    } catch {
      // handled by toast
    }
  }


  const handleReturn = async (values: ReturnBacResolutionPayload) => {
    try {
      await toast.promise(
        returnBacResolution(
          {
            payload: values,
            pathParams: { id: selectedId || '' }
          },
          {
            onSuccess: async () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/bac/projects'),
              })
            },
          },
        ),
        {
          loading: 'Returning BAC Resolution...',
          success: 'BAC Resolution returned for revision.',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to return BAC Resolution.',
        },
      )
      setReturnOpen(false)
    } catch {
      // handled by toast
    }
  }


  if (!selectedId) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/50 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <ScrollText className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-foreground">No BAC Resolution Selected</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select a BAC resolution from the queue on the left to view its complete
              specifications, WHEREAS clauses, signatories, linked PRs, and audit trail.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isFetching) {
    return (
      <Card className="border border-default-200 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <div className="space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Loading BAC Project details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const resolution = responseData?.data

  const handleGenerateDocument = async () => {
    const bacResolutionId = resolution?.bacResolutions?.[0]?.id
    if (!bacResolutionId) {
      toast.error('No BAC Resolution found for this project')
      return
    }

    const exportPromise = (async () => {
      const genResponse = await generateBACResolutionDocument({
        pathParams: { id: bacResolutionId },
        queryParams: { format: 'Pdf' },
      })

      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation service')
      }

      const downloadResponse = await downloadBacResolutionDocument({
        pathParams: { documentId },
      })

      const blob = downloadResponse.blob
      const resNum = resolution?.bacResolutions?.[0]?.resolutionNumber
      const filename = resNum ? `BAC_Resolution_${resNum}.pdf` : `BAC_Resolution_${bacResolutionId}.pdf`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })()

    toast.promise(exportPromise, {
      loading: 'Generating and downloading BAC Resolution document...',
      success: 'BAC Resolution PDF downloaded successfully!',
      error: (err) => err instanceof Error ? err.message : 'Failed to export BAC Resolution document.',
    })
  }

  const selectedProject = responseData?.data

  if (!selectedProject) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/50 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <p className="text-xs text-muted-foreground">Project details not found.</p>
        </CardContent>
      </Card>
    )
  }

  // Real Data Extraction & Mapping from Backend Response
  const sourceType =
    selectedProject.sourceType ||
    (selectedProject.appItem ? 'APPItem' : 'ConsolidatedPR')
  const isAppItemSource = sourceType === 'APPItem'

  const title =
    selectedProject.title ||
    selectedProject.appItem?.ppmpItemName ||
    selectedProject.consolidatedPR?.description


  const status = selectedProject.status
  const resolutionNumber =
    selectedProject.resolutionNumber
  const abc =
    selectedProject.abc

  const statusLower = (selectedProject.status || 'draft').toLowerCase()
  const isDraft = statusLower === 'draft'
  const isApproved = statusLower === 'approved' || statusLower === 'approve'
  const isReturned = statusLower === 'returned' || statusLower === 'decline'
  const isForApproval = statusLower === 'for-approval' || statusLower === 'submitted' || statusLower === 'submit'


  const officeName =
    selectedProject.appItem?.Office?.name

  const procurementMode =
    selectedProject.appItem?.ProcurementMode?.name
  const fundSource =
    selectedProject.appItem?.FundSource?.name
  // 'General Fund'

  const endUserRep = selectedProject.endUserRepresentative
    ? `${selectedProject.endUserRepresentative.firstName} ${selectedProject.endUserRepresentative.lastName}`
    : selectedProject.appItem?.Office?.name || officeName

  const techRep = selectedProject.techRepresentative
    ? `${selectedProject.techRepresentative.firstName} ${selectedProject.techRepresentative.lastName}`
    : null

  const resolutionType = selectedProject.resolutionType
  const dateResolved = selectedProject.dateResolved
  const resolvedLocation = selectedProject.resolvedLocation
  const createdBy = selectedProject.createdBy
  const createdAt = selectedProject.createdAt
  const approvedBy = selectedProject.approvedBy
  const approvedAt = selectedProject.approvedAt

  const appItemLinks = selectedProject.appItemLinks || []

  const allClauseLinks = selectedProject.bacResolutions?.[0]?.clauseLinks || []
  const whereasClauseLinks = allClauseLinks
    .filter((c) => (c.clauseType || 'Whereas').toLowerCase() === 'whereas')
    .map((c) => ({ id: c.id, name: c.name || 'WHEREAS Clause', body: c.body }))

  const nowThereforeClauseLinks = allClauseLinks
    .filter((c) => (c.clauseType || '').toLowerCase() === 'nowtherefore')
    .map((c) => ({ id: c.id, name: c.name || 'NOW, THEREFORE Clause', body: c.body }))

  const resolvedClauseLinks = allClauseLinks
    .filter((c) => (c.clauseType || '').toLowerCase() === 'resolved')
    .map((c) => ({ id: c.id, name: c.name || 'RESOLVED Clause', body: c.body }))

  const legacyWhereasClauses: BacResolutionWhereasClause[] =
    selectedProject.bacResolutions?.flatMap((item) =>
      Array.isArray(item.whereasClauses)
        ? item.whereasClauses.map((clause) => ({
          id: clause.id,
          name: clause.name || 'Whereas Clause',
          body: clause.body || '',
        }))
        : [],
    ) || []

  const activeWhereasList = whereasClauseLinks.length > 0 ? whereasClauseLinks : legacyWhereasClauses

  const activityLog: BacResolutionLogEntry[] =
    []

  return (
    <div className="space-y-4">
      {/* Sticky Top Header Banner */}
      <Card className="border border-default-200 shadow-sm bg-linear-to-r from-default-50 to-white">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-primary flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {resolutionNumber}
                </span>
                <BacResolutionStatusBadge status={status} />
                {isApproved && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-teal-400 text-teal-600 bg-teal-50/70">
                    Ready for Scheduling
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground line-clamp-2">
                {title}
              </h2>
            </div>

            {/* Quick Actions in Header Banner */}
            <div className="flex flex-wrap items-center gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(selectedProject)}
                  disabled={isLoading}
                  className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              {isApproved && onCreatePr && (
                <Button
                  size="sm"
                  onClick={onCreatePr}
                  disabled={isLoading}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                  Create PR
                </Button>
              )}

              {onPrint && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPrint}
                  disabled={isLoading}
                  className="gap-1.5 text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Printer className="h-3.5 w-3.5 text-purple-600" />
                  Print PDF
                </Button>
              )}

              {selectedId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateDocument}
                  disabled={isLoading || isGenerating || isDownloading}
                  className="gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium"
                >
                  {isGenerating || isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-emerald-700" />
                  )}
                  Generate BAC Resolution (PDF)
                </Button>
              )}

              {(role === 'procurement-staff' || role === 'all') && (isDraft || isReturned) && onSubmit && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Approval
                </Button>
              )}

              {(role === 'bac-chairperson' || role === 'all') && isForApproval && (
                <Button
                  size="sm"
                  onClick={() => setApproveOpen(true)}
                  disabled={isLoading || isApproving || isReturning}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Approve
                </Button>
              )}

              {(role === 'bac-chairperson' || role === 'all') && isForApproval && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReturnOpen(true)}
                  disabled={isLoading || isApproving || isReturning}
                  className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Return
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDelete}
                  disabled={isLoading}
                  className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-default-100 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                APPROVED BUDGET (ABC)
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                IMPLEMENTING UNIT
              </span>
              <span className="font-medium text-foreground truncate block">{officeName}</span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                PROCUREMENT MODE
              </span>
              <span className="font-semibold text-purple-600 truncate block">{procurementMode}</span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                SOURCE OF FUND
              </span>
              <span className="font-medium text-foreground truncate block">{fundSource}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Amber Alert Banner */}
      {isAppItemSource && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-medium">
            Link exactly one Consolidated PR to keep this BAC Resolution in the Public Bidding scheduling flow.
          </span>
        </div>
      )}

      {/* Structured Tabs Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={isAppItemSource ? "grid grid-cols-2 md:grid-cols-4 w-full bg-default-100/80 p-1 rounded-xl h-auto" : "grid grid-cols-2 md:grid-cols-5 w-full bg-default-100/80 p-1 rounded-xl h-auto"}>
          <TabsTrigger value="overview" className="gap-1.5 text-xs py-2">
            <Sparkles className="h-3.5 w-3.5" />
            Overview & Actions
          </TabsTrigger>
          <TabsTrigger value="source" className="gap-1.5 text-xs py-2">
            <Layers className="h-3.5 w-3.5" />
            Procurement Source
          </TabsTrigger>
          <TabsTrigger value="clauses" className="gap-1.5 text-xs py-2">
            <FileText className="h-3.5 w-3.5" />
            WHEREAS Clauses
          </TabsTrigger>
          {!isAppItemSource && (
            <TabsTrigger value="linked" className="gap-1.5 text-xs py-2">
              <Calendar className="h-3.5 w-3.5" />
              Linked PRs & Sched
            </TabsTrigger>
          )}
          <TabsTrigger value="audit" className="gap-1.5 text-xs py-2">
            <History className="h-3.5 w-3.5" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & ACTIONS */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resolution Metadata Card */}
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Resolution Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-default-100">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Number</span>
                    <span className="font-bold text-foreground">{resolutionNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Type</span>
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] rounded-full px-2.5">
                      {resolutionType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Resolved Date & Location</span>
                  <p className="font-medium text-foreground">
                    {dateResolved
                      ? new Date(dateResolved).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Pending Resolution Date'}{' '}
                    at {resolvedLocation || 'BAC Office'}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-default-100">
                  <span className="text-muted-foreground block text-[11px]">Created By & Timestamp</span>
                  <p className="font-medium text-foreground">
                    {createdBy}{' '}
                    {createdAt
                      ? `on ${new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : ''}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Approval & Endorsement Status Card */}
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Approval & Endorsement Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1 pb-2 border-b border-default-100">
                  <span className="text-muted-foreground block text-[11px]">HOPE Approval Status</span>
                  {approvedBy || approvedAt ? (
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Approved by {approvedBy} {approvedAt ? `on ${new Date(approvedAt).toLocaleDateString('en-US')}` : ''}
                    </div>
                  ) : isApproved ? (
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Approved by HOPE
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium text-amber-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Pending Approval
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-muted-foreground block text-[11px]">Provisional BAC Representatives</span>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">End-user Rep:</span>
                    <span className="font-medium text-foreground">{endUserRep}</span>
                  </div>
                  {techRep && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Tech Rep:</span>
                      <span className="font-medium text-foreground">{techRep}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PROCUREMENT SOURCE */}
        <TabsContent value="source" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Authoritative Procurement Source Information
                </CardTitle>
                <Badge className="bg-purple-600 text-white text-[10px] rounded-full px-3">
                  Path A: {isAppItemSource ? 'APP Item' : 'Consolidated PR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-default-50 border border-default-200">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">OFFICE / UNIT</span>
                  <span className="font-semibold text-foreground text-sm">{officeName}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">PROCUREMENT MODE</span>
                  <span className="font-semibold text-purple-600 text-sm">{procurementMode}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">SOURCE OF FUND</span>
                  <span className="font-semibold text-foreground text-sm">{fundSource}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">APPROVED BUDGET (ABC)</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* If multiple APP items are linked */}
              {appItemLinks.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                      LINKED APP LINE ITEMS ({appItemLinks.length})
                    </span>
                    {appItemLinks[0]?.appNumber && (
                      <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
                        {appItemLinks[0].appNumber}
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-lg border border-default-200 overflow-hidden bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-default-50 border-b border-default-200">
                        <tr>
                          <th className="p-2 text-left font-bold text-default-700">Item #</th>
                          <th className="p-2 text-left font-bold text-default-700">Description</th>
                          <th className="p-2 text-left font-bold text-default-700">Office</th>
                          <th className="p-2 text-right font-bold text-default-700">ABC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-default-100">
                        {appItemLinks.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="p-2 font-semibold text-primary">{item.itemNumber || `#${idx + 1}`}</td>
                            <td className="p-2 font-medium text-default-900">{item.description}</td>
                            <td className="p-2 text-default-600">{item.officeName || '—'}</td>
                            <td className="p-2 text-right font-semibold text-emerald-700">
                              ₱{item.effectiveABC.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                    ITEM SPECIFICATIONS & ALLOCATION DETAILS
                  </span>
                  <div className="rounded-lg border border-default-200 p-4 bg-white space-y-1 shadow-2xs">
                    <p className="font-bold text-default-900 text-sm">{title}</p>
                    <p className="text-muted-foreground text-xs">
                      Full Lot Allocation: ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RESOLUTION CLAUSES */}
        <TabsContent value="clauses" className="space-y-4">
          {/* WHEREAS CLAUSES */}
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                WHEREAS Clauses ({activeWhereasList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {activeWhereasList.length > 0 ? (
                activeWhereasList.map((clause, idx) => (
                  <div key={clause.id || idx} className="p-3.5 rounded-xl border border-default-200 bg-white space-y-1">
                    <span className="font-bold text-purple-600 block text-xs">{clause.name}</span>
                    <p className="text-foreground text-xs font-serif leading-relaxed">{clause.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-default-300 bg-default-50/50 p-6 text-center text-xs text-muted-foreground">
                  No WHEREAS clauses configured.
                </div>
              )}
            </CardContent>
          </Card>

          {/* NOW, THEREFORE CLAUSES (IF PRESENT) */}
          {nowThereforeClauseLinks.length > 0 && (
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  NOW, THEREFORE Clauses ({nowThereforeClauseLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {nowThereforeClauseLinks.map((clause, idx) => (
                  <div key={clause.id || idx} className="p-3.5 rounded-xl border border-default-200 bg-white space-y-1">
                    <span className="font-bold text-primary block text-xs">{clause.name}</span>
                    <p className="text-foreground text-xs font-serif leading-relaxed">{clause.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* RESOLVED CLAUSES (IF PRESENT) */}
          {resolvedClauseLinks.length > 0 && (
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  RESOLVED Clauses ({resolvedClauseLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {resolvedClauseLinks.map((clause, idx) => (
                  <div key={clause.id || idx} className="p-3.5 rounded-xl border border-default-200 bg-white space-y-1">
                    <span className="font-bold text-emerald-700 block text-xs">{clause.name}</span>
                    <p className="text-foreground text-xs font-serif leading-relaxed">{clause.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Bids and Awards Committee Signatories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-default-50 border border-default-200">
                  <p className="font-bold text-default-900 text-xs">BAC CHAIRPERSON</p>
                  <p className="text-muted-foreground text-[11px]">Chairperson, BAC</p>
                </div>

                <div className="p-3.5 rounded-xl bg-default-50 border border-default-200">
                  <p className="font-bold text-default-900 text-xs">BAC VICE-CHAIRPERSON</p>
                  <p className="text-muted-foreground text-[11px]">Vice-Chairperson, BAC</p>
                </div>

                <div className="p-3.5 rounded-xl bg-default-50 border border-default-200">
                  <p className="font-bold text-default-900 text-xs">{endUserRep}</p>
                  <p className="text-muted-foreground text-[11px]">End-user Representative ({officeName})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: LINKED PRS & SCHED */}
        {!isAppItemSource && (
          <TabsContent value="linked" className="space-y-4">
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    Linked Consolidated PRs (0)
                  </CardTitle>
                  {onLinkPrs && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onLinkPrs}
                      className="gap-1.5 text-xs border-purple-300 text-purple-600 hover:bg-purple-50 h-8"
                    >
                      <LinkIcon className="h-3.5 w-3.5 text-purple-600" />
                      Manage Linkage
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-xl border border-dashed border-default-300 bg-default-50/50 p-8 text-center text-xs text-muted-foreground">
                  No Consolidated PRs linked to this BAC resolution.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {activityLog.length > 0 ? (
                activityLog.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-default-200 bg-white flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="font-bold text-foreground block text-xs">{log.action}</span>
                      <span className="text-muted-foreground text-[11px] block">By {log.actor}</span>
                      {log.note && <p className="text-muted-foreground text-xs">{log.note}</p>}
                    </div>
                    <span className="text-muted-foreground text-[11px] font-mono">{log.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl border border-default-200 bg-white flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block text-xs">Project Created</span>
                    <span className="text-muted-foreground text-[11px] block">By {createdBy}</span>
                    <p className="text-muted-foreground text-xs">BAC Resolution initialized in system.</p>
                  </div>
                  {createdAt && (
                    <span className="text-muted-foreground text-[11px] font-mono">
                      {new Date(createdAt).toLocaleDateString('en-US')}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedId && (
        <>
          <ApproveBacResolutionDialog
            open={approveOpen}
            onOpenChange={setApproveOpen}
            bacResolutionId={selectedId}
            onApprove={handleApprove}
          />
          <ReturnBacResolutionDialog
            open={returnOpen}
            onOpenChange={setReturnOpen}
            bacResolutionId={selectedId}
            onReturn={handleReturn}
          />
        </>
      )}
    </div>
  )
}

export default DetailsPanel

