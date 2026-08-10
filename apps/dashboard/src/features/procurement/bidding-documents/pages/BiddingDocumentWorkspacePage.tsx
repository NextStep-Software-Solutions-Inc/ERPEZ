import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { PROCUREMENT_CATEGORY_LABELS } from '../../bidding-schedule/data/mockBiddingScheduleData'
import { useBiddingScheduleStore } from '../../bidding-schedule/store/biddingScheduleStore'
import {
  areAllGatesPassed,
  canGenerateBiddingDocument,
  formatCurrency,
  getOverallProgress,
  getSectionProgress,
} from '../data/mockBiddingDocumentsData'
import {
  BiddingDocumentPhaseScaffold,
  BiddingDocumentPrerequisiteChecklist,
  BiddingDocumentReviewPanel,
  BiddingDocumentStructuredFieldsSection,
  BiddingDocumentUploadsSection,
} from '../components'
import { useBiddingDocumentsStore } from '../store/biddingDocumentsStore'
import { downloadBiddingDocumentBlob } from '../utils/downloadBiddingDocumentBlob'
import type { BiddingDocumentUploadSlotDefinition } from '../types'
import { PageContainerDashtail } from '@/components/v2'
import {
  BacResolutionExecutionBadges,
  BacResolutionStatusBadge,
  getMockBacResolutionById,
} from '@/features/procurement/bac-resolution'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'

interface BiddingDocumentWorkspacePageProps {
  bacResolutionId: string
}

// TODO: Replace this stub once the dashboard exposes the authenticated user
// through auth/session context in the procurement workspace.
const CURRENT_USER = 'BAC Secretariat Demo'

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not yet saved'
  }

  try {
    return format(parseISO(value), 'MMM d, yyyy h:mm a')
  } catch {
    return value
  }
}

export function BiddingDocumentWorkspacePage({
  bacResolutionId,
}: BiddingDocumentWorkspacePageProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const document = useBiddingDocumentsStore((state) =>
    state.getDocumentByResolutionId(bacResolutionId),
  )
  const updateStructuredField = useBiddingDocumentsStore(
    (state) => state.updateStructuredField,
  )
  const saveDraft = useBiddingDocumentsStore((state) => state.saveDraft)
  const toggleGate = useBiddingDocumentsStore((state) => state.toggleGate)
  const replaceUpload = useBiddingDocumentsStore((state) => state.replaceUpload)
  const setCustomizedSpecialConditionsRequired = useBiddingDocumentsStore(
    (state) => state.setCustomizedSpecialConditionsRequired,
  )
  const generatePreview = useBiddingDocumentsStore(
    (state) => state.generatePreview,
  )
  const markPosted = useBiddingDocumentsStore((state) => state.markPosted)
  const linkedSchedule = useBiddingScheduleStore((state) =>
    state.schedules.find(
      (schedule) => schedule.bacResolutionId === bacResolutionId,
    ),
  )
  const [currentPage, setCurrentPage] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!document) {
      void navigate({ to: '/v2/bidding-documents', replace: true })
    }
  }, [document, navigate])

  useEffect(() => {
    if (!document || document.status === 'posted') {
      return undefined
    }

    const interval = window.setInterval(() => {
      saveDraft(document.id)
    }, 30_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [document, saveDraft])

  useEffect(() => {
    setCurrentPage(0)
  }, [document?.previewPages.length])

  if (!document) {
    return null
  }

  const bacResolution = getMockBacResolutionById(bacResolutionId)
  const allGatesPassed = areAllGatesPassed(document.gates)
  const canGenerate = canGenerateBiddingDocument(document)
  const progress = getOverallProgress(document)
  const sectionProgress = getSectionProgress(document)
  const isPosted = document.status === 'posted'

  const handleSaveDraft = () => {
    saveDraft(document.id)
  }

  const handleGenerate = () => {
    generatePreview(document.id)
    toast({
      title:
        document.status === 'generated' ? 'PBD regenerated' : 'PBD generated',
      description:
        'The preview was refreshed using the current structured inputs and uploaded sections.',
    })
  }

  const handleDownload = (extension: 'docx' | 'pdf') => {
    if (document.previewPages.length === 0) {
      return
    }

    const content = document.previewPages
      .map((page) => [page.title, ...page.lines].join('\n'))
      .join('\n\n')
    downloadBiddingDocumentBlob(
      `${document.bacResolutionNumber}-PBD.${extension}.txt`,
      content,
    )
    toast({
      title: `Downloaded ${extension.toUpperCase()} mock`,
      description: 'This FE-only phase uses a simulated download artifact.',
    })
  }

  const handleMarkPosted = () => {
    markPosted(document.id, CURRENT_USER)
    toast({
      title: 'PBD marked as posted',
      description:
        'The workspace is now read-only and the linked schedule is locked when available.',
    })
  }

  const handleUpload = (
    slot: BiddingDocumentUploadSlotDefinition,
    file: File | undefined,
  ) => {
    if (!file) {
      return
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!slot.acceptedExtensions.includes(extension)) {
      const message = `Invalid file type for ${slot.label}. Accepted: ${slot.acceptedExtensions.join(', ')}`
      setUploadErrors((state) => ({ ...state, [slot.key]: message }))
      toast({
        title: 'Upload rejected',
        description: message,
        color: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      const message = `${slot.label} exceeds the 10 MB limit.`
      setUploadErrors((state) => ({ ...state, [slot.key]: message }))
      toast({
        title: 'Upload rejected',
        description: message,
        color: 'destructive',
      })
      return
    }

    setUploadErrors((state) => ({ ...state, [slot.key]: '' }))
    replaceUpload(document.id, slot.key, {
      fileName: file.name,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: CURRENT_USER,
    })
    saveDraft(document.id)
    toast({
      title: `${slot.label} uploaded`,
      description:
        'Replace completed. Regenerate the preview once all edits are done.',
    })
  }

  return (
    <PageContainerDashtail
      title={`${document.bacResolutionNumber} — Bidding Documents`}
      description="Complete the remaining PBD inputs, review the assembled preview, and prepare the PhilGEPS posting package."
      headerVariant="branded"
      mode="simple"
      contentType="default"
      backTo="/v2/bidding-documents"
      backLabel="Back to Bidding Documents"
      containerClassName="h-full min-h-0"
      contentClassName="space-y-4"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {PROCUREMENT_CATEGORY_LABELS[document.procurementCategory]}
          </Badge>
          <Badge variant="outline" color={isPosted ? 'success' : 'secondary'}>
            {isPosted
              ? 'Posted'
              : document.status === 'generated'
                ? 'Generated'
                : 'Draft'}
          </Badge>
        </div>
      }
    >
      {bacResolution ? (
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="text-base">Workflow context</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Keep the owning BAC Resolution and downstream schedule context
                  visible while preparing this PBD.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BacResolutionStatusBadge status={bacResolution.status} />
                <Badge variant="outline" color="secondary">
                  {linkedSchedule
                    ? linkedSchedule.status === 'locked'
                      ? 'Schedule Locked'
                      : linkedSchedule.status === 'confirmed'
                        ? 'Schedule Confirmed'
                        : 'Schedule Draft'
                    : 'No Schedule Yet'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <BacResolutionExecutionBadges resolution={bacResolution} />
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link
                  to="/v2/bac-resolutions"
                  search={{ selectedResolutionId: bacResolution.id }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open BAC Resolution
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link
                  to="/v2/bac-resolutions/$resolutionId/bidding-schedule"
                  params={{ resolutionId: bacResolution.id }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Bidding Schedule
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link
                  to="/v2/bidding-master-calendar"
                  search={{ selectedResolutionId: bacResolution.id }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Master Calendar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isPosted && (
        <Alert variant="outline" color="success">
          <div>
            <AlertTitle>PBD posted to PhilGEPS</AlertTitle>
            <AlertDescription>
              Posted on {formatDateTime(document.postedAt)} by{' '}
              {document.postedBy ?? '—'}. Regeneration and editing are locked.
              To amend this document, initiate a Supplemental Bid Bulletin
              workflow.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {document.needsRegeneration && !isPosted && (
        <Alert variant="outline" color="warning">
          <div>
            <AlertTitle>Preview requires regeneration</AlertTitle>
            <AlertDescription>
              Structured inputs or uploaded section files changed after the last
              preview. Regenerate the PBD before downloading or marking it as
              posted.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <BiddingDocumentPhaseScaffold document={document} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-default-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <div>
                <CardTitle className="text-base">Source Data Summary</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Field sources tracked by origin. Click source-specific links
                  to update.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Organization Profile Fields */}
            <div className="space-y-3 rounded-lg border border-default-100 bg-default-50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" color="info" className="text-xs">
                  Organization Profile
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Agency
                  </p>
                  <p className="font-medium">{document.agencyName}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="font-medium">{document.agencyAddress}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    BAC Chairperson
                  </p>
                  <p className="font-medium">{document.bacChairperson}</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Link to="/v2/organization">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Edit agency profile
                </Link>
              </Button>
            </div>

            {/* BAC Resolution Fields */}
            <div className="space-y-3 rounded-lg border border-default-100 bg-default-50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" color="success" className="text-xs">
                  BAC Resolution
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Project Title
                  </p>
                  <p className="font-medium">{document.projectTitle}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Contract ID
                  </p>
                  <p className="font-medium">{document.contractId}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    ABC (Budget)
                  </p>
                  <p className="font-medium">{formatCurrency(document.abc)}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Funding Source
                  </p>
                  <p className="font-medium">{document.fundingSource}</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Link
                  to="/v2/bac-resolutions/$resolutionId/bidding-schedule"
                  params={{ resolutionId: document.bacResolutionId }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open BAC Resolution details
                </Link>
              </Button>
            </div>

            {/* Procurement Request Fields */}
            <div className="space-y-3 rounded-lg border border-default-100 bg-default-50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" color="warning" className="text-xs">
                  Procurement Request
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  Procurement Request ID
                </p>
                <p className="font-medium">
                  (Source: Consolidated PR approval)
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Link to="/v2/consolidate-prs">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Edit PR source / Consolidation
                </Link>
              </Button>
            </div>

            {/* PBD Workspace Fields */}
            <div className="space-y-3 rounded-lg border border-default-100 bg-default-50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" color="secondary" className="text-xs">
                  PBD Workspace
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  Last draft saved
                </p>
                <p className="font-medium">
                  {formatDateTime(document.lastDraftSavedAt)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>
                  Auto-saves every 30 seconds. Manual phases gate edit access to
                  required form completions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Completion Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall completion</span>
                <span>
                  {progress.complete}/{progress.total}
                </span>
              </div>
              <Progress value={progress.percent} color="success" size="sm" />
            </div>
            <div className="space-y-2">
              {sectionProgress.map((section) => (
                <div key={section.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{section.label}</span>
                    <span>
                      {section.complete}/{section.total}
                    </span>
                  </div>
                  <Progress
                    value={
                      section.total === 0
                        ? 0
                        : Math.round((section.complete / section.total) * 100)
                    }
                    size="xs"
                    color={
                      section.complete === section.total ? 'success' : 'warning'
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BiddingDocumentPrerequisiteChecklist
        document={document}
        allGatesPassed={allGatesPassed}
        onToggleGate={(gate) => toggleGate(document.id, gate)}
      />

      <fieldset
        disabled={!allGatesPassed || isPosted}
        className="space-y-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <BiddingDocumentStructuredFieldsSection
          document={document}
          disabled={!allGatesPassed || isPosted}
          onUpdateStructuredField={(field, value) =>
            updateStructuredField(document.id, field, value)
          }
          onSaveDraft={handleSaveDraft}
        />

        <BiddingDocumentUploadsSection
          document={document}
          disabled={!allGatesPassed || isPosted}
          uploadErrors={uploadErrors}
          onUpload={handleUpload}
          onToggleCustomizedSpecialConditions={(enabled) => {
            setCustomizedSpecialConditionsRequired(document.id, enabled)
            saveDraft(document.id)
          }}
          formatDateTime={formatDateTime}
        />
      </fieldset>

      <BiddingDocumentReviewPanel
        document={document}
        canGenerate={canGenerate}
        isPosted={isPosted}
        currentPage={currentPage}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
        onMarkPosted={handleMarkPosted}
        onSelectPage={setCurrentPage}
        onPreviousPage={() => setCurrentPage((page) => Math.max(page - 1, 0))}
        onNextPage={() =>
          setCurrentPage((page) =>
            Math.min(page + 1, document.previewPages.length - 1),
          )
        }
      />
    </PageContainerDashtail>
  )
}
