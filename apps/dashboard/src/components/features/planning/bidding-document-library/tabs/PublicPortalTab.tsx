import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Download,
  Eye,
  FileCheck,
  Loader2,
  Lock,
  Upload,
} from 'lucide-react'
import { getSortedChecklist } from '../utils'
import { SupplierUploadDialog } from '../dialogs/SupplierUploadDialog'
import { UploadedFileViewerDialog } from '../dialogs/UploadedFileViewerDialog'
import type {
  MasterDoc,
  Project,
  ProjectChecklistItem,
  UploadedFileAttachment,
} from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PublicPortalTabProps {
  projects: Array<Project>
  currentProject: Project | null
  selectedProjectId: string
  masterDocs: Array<MasterDoc>
  isLoading?: boolean
  onSelectedProjectChange: (projectId: string) => void
  onDownloadTemplate: (templateFile: string) => void
  onViewTemplate: (doc: MasterDoc) => void
  onUploadFile: (itemId: string, upload: UploadedFileAttachment) => void
  onRemoveUploaded: (itemId: string) => void
}

function UploadSlot({
  item,
  onOpenUpload,
  onViewUploaded,
  onRemoveUploaded,
}: {
  item: ProjectChecklistItem
  onOpenUpload: (item: ProjectChecklistItem) => void
  onViewUploaded: (item: ProjectChecklistItem) => void
  onRemoveUploaded: (itemId: string) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border bg-background gap-3">
      <div className="space-y-0.5">
        <div className="font-semibold text-sm">{item.name}</div>
        <div className="text-2xs text-muted-foreground">
          {item.isCustom
            ? 'Custom project requirement'
            : 'Mandatory regulatory document'}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {item.uploadedFile ? (
          <div className="flex items-center gap-2 bg-success/5 border border-success/30 rounded p-1.5 text-xs text-success">
            <FileCheck className="h-4 w-4 shrink-0" />
            <span className="max-w-[120px] truncate font-semibold">
              {item.uploadedFile}
            </span>
            <Button
              variant="ghost"
              className="h-6 px-1.5 text-2xs font-bold text-success hover:bg-success/15"
              onClick={() => onViewUploaded(item)}
            >
              View File
            </Button>
            <Button
              variant="ghost"
              className="h-6 px-1.5 text-2xs text-destructive font-bold hover:bg-destructive/15"
              onClick={() => onRemoveUploaded(item.id)}
            >
              Remove
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto gap-1.5"
            onClick={() => onOpenUpload(item)}
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </Button>
        )}
      </div>
    </div>
  )
}

export function PublicPortalTab({
  projects,
  currentProject,
  selectedProjectId,
  masterDocs,
  isLoading,
  onSelectedProjectChange,
  onDownloadTemplate,
  onViewTemplate,
  onUploadFile,
  onRemoveUploaded,
}: PublicPortalTabProps) {
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(
    null,
  )
  const [uploadingItem, setUploadingItem] =
    useState<ProjectChecklistItem | null>(null)
  const [viewingUploadedItem, setViewingUploadedItem] =
    useState<ProjectChecklistItem | null>(null)
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading public portal preview...</span>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No projects found. Projects must be created before previewing the supplier portal.
      </div>
    )
  }

  const sortedChecklist = getSortedChecklist(
    currentProject.checklist,
    masterDocs,
  )
  const isFinalized = currentProject.status === 'Finalized'
  const finalizedChecklist = isFinalized
    ? sortedChecklist.filter((item) => item.enabled)
    : []
  const downloadableTemplates = finalizedChecklist.filter(
    (item) => item.enabled && item.templateFile,
  )
  const activeEnvelopeOne = finalizedChecklist.filter(
    (item) => item.envelope === 1,
  )
  const activeEnvelopeTwo = finalizedChecklist.filter(
    (item) => item.envelope === 2,
  )
  const uploadedEnvelopeOne = activeEnvelopeOne.filter(
    (item) => item.uploadedFile,
  ).length
  const uploadedEnvelopeTwo = activeEnvelopeTwo.filter(
    (item) => item.uploadedFile,
  ).length
  const getTemplateDoc = (item: ProjectChecklistItem): MasterDoc => {
    const masterDoc = masterDocs.find((doc) => doc.id === item.id)
    if (masterDoc) return masterDoc

    return {
      id: item.id,
      name: item.name,
      description: item.isCustom
        ? 'Custom project requirement template.'
        : 'Standard blank template for supplier completion.',
      envelope: item.envelope,
      templateFile: item.templateFile,
      templatePreviewUrl: item.templatePreviewUrl,
      templateFileType: item.templateFileType,
      order: 999,
    }
  }
  const handleDownloadClick = (templateFile: string) => {
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current)

    setDownloadingTemplate(templateFile)
    onDownloadTemplate(templateFile)
    downloadTimerRef.current = setTimeout(() => {
      setDownloadingTemplate((current) =>
        current === templateFile ? null : current,
      )
    }, 1200)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Supplier Application Portal (Live Preview)
          </h3>
          <p className="text-xs text-muted-foreground">
            Preview upload slots and template downloads based on BAC selections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-semibold uppercase">
            Preview Project View:
          </span>
          <Select
            value={selectedProjectId || currentProject.id}
            onValueChange={onSelectedProjectChange}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentProject.status === 'Draft Checklist' && (
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-sm flex gap-3 text-warning">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong>Warning:</strong> This project's checklist is in{' '}
            <span className="font-bold">Draft Checklist</span> status in BAC
            Secretariat Workspace. Changes are not final. Real applications will
            remain locked until BAC Sec finalizes.
          </div>
        </div>
      )}

      {!isFinalized && (
        <div className="flex items-start gap-3 rounded-lg border border-default-200 bg-muted/30 p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
          <div>
            <div className="font-semibold text-foreground">
              Supplier portal is locked for this project.
            </div>
            <div>
              Files to download and upload slots publish only after the BAC
              confirms and locks the project checklist.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-bold text-foreground">
              1. Files to Download
            </h4>
            <p className="text-xs text-muted-foreground">
              Download standardized GPPB templates to fill out locally.
            </p>
          </div>

          <div className="space-y-3">
            {downloadableTemplates.map((item) => (
              <Card key={item.id} className="border shadow-none bg-muted/10">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-wrap justify-between items-center gap-2 mt-2 border-t bg-muted/5">
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[170px]">
                    {item.templateFile}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="gap-1 text-2xs h-7"
                      onClick={() => onViewTemplate(getTemplateDoc(item))}
                    >
                      <Eye className="h-3 w-3" />
                      View File
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="gap-1 text-2xs h-7"
                      disabled={downloadingTemplate === item.templateFile}
                      onClick={() => handleDownloadClick(item.templateFile)}
                    >
                      {downloadingTemplate === item.templateFile ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Downloading
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3" />
                          Get Template
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {downloadableTemplates.length === 0 && (
              <div className="text-center p-6 border border-dashed rounded text-sm text-muted-foreground italic">
                {isFinalized
                  ? 'No downloadable templates required for this application profile.'
                  : 'No finalized template downloads are published yet.'}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h4 className="text-base font-bold text-foreground">
              2. Upload Application
            </h4>
            <p className="text-xs text-muted-foreground">
              Attach files to the dynamically generated slots. Structured order
              strictly enforces legal criteria.
            </p>
          </div>

          {isFinalized ? (
            <>
              <div className="space-y-4">
                <div className="font-bold text-sm text-info bg-info/10 p-2.5 rounded border border-info/20 flex justify-between">
                  <span>Envelope 1: Technical & Eligibility Submissions</span>
                  <span className="font-mono text-xs">
                    {uploadedEnvelopeOne} / {activeEnvelopeOne.length} Files
                    Attached
                  </span>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-info/20">
                  {activeEnvelopeOne.map((item) => (
                    <UploadSlot
                      key={item.id}
                      item={item}
                      onOpenUpload={setUploadingItem}
                      onViewUploaded={setViewingUploadedItem}
                      onRemoveUploaded={onRemoveUploaded}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="font-bold text-sm text-warning bg-warning/10 p-2.5 rounded border border-warning/20 flex justify-between">
                  <span>Envelope 2: Financial Bid Submissions</span>
                  <span className="font-mono text-xs">
                    {uploadedEnvelopeTwo} / {activeEnvelopeTwo.length} Files
                    Attached
                  </span>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-warning/20">
                  {activeEnvelopeTwo.map((item) => (
                    <UploadSlot
                      key={item.id}
                      item={item}
                      onOpenUpload={setUploadingItem}
                      onViewUploaded={setViewingUploadedItem}
                      onRemoveUploaded={onRemoveUploaded}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8 border border-dashed rounded text-sm text-muted-foreground italic">
              Upload slots will be generated from the finalized BAC checklist.
            </div>
          )}
        </div>
      </div>

      <SupplierUploadDialog
        item={uploadingItem}
        open={Boolean(uploadingItem)}
        onOpenChange={(open) => {
          if (!open) setUploadingItem(null)
        }}
        onUpload={onUploadFile}
      />
      <UploadedFileViewerDialog
        item={viewingUploadedItem}
        open={Boolean(viewingUploadedItem)}
        onOpenChange={(open) => {
          if (!open) setViewingUploadedItem(null)
        }}
      />
    </div>
  )
}
