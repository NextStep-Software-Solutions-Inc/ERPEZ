import { Eye, FileCheck, FileText } from 'lucide-react'
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
import type { ProjectChecklistItem } from '../types'
import { formatTemplateFileSize } from '../utils'

interface UploadedFileViewerDialogProps {
  item: ProjectChecklistItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function hasExtension(fileName: string, extensions: string[]) {
  const lowerFileName = fileName.toLowerCase()
  return extensions.some((extension) => lowerFileName.endsWith(extension))
}

export function UploadedFileViewerDialog({
  item,
  open,
  onOpenChange,
}: UploadedFileViewerDialogProps) {
  const fileName = item?.uploadedFile ?? ''
  const fileType = item?.uploadedFileType ?? ''
  const previewUrl = item?.uploadedFilePreviewUrl
  const canRenderPdf = Boolean(
    previewUrl &&
      (fileType.includes('pdf') || hasExtension(fileName, ['.pdf'])),
  )
  const canRenderImage = Boolean(
    previewUrl &&
      (fileType.startsWith('image/') ||
        hasExtension(fileName, ['.jpg', '.jpeg', '.png'])),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Uploaded File
          </DialogTitle>
          <DialogDescription className="break-all">
            {fileName || 'No uploaded file selected'}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/20 overflow-hidden">
          {canRenderPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              title={fileName}
              className="h-[68vh] w-full bg-background"
            />
          ) : canRenderImage && previewUrl ? (
            <div className="flex h-[68vh] items-center justify-center bg-background p-4">
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto bg-slate-100 p-4">
              <div className="mx-auto min-h-[620px] max-w-[680px] bg-background p-10 shadow-sm">
                <div className="border-b pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Supplier Uploaded Document Preview
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-foreground">
                        {item?.name ?? 'Uploaded Checklist File'}
                      </h3>
                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {fileName}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                      <FileCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        item?.envelope === 2
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-info/10 text-info border-info/20'
                      }
                    >
                      Envelope {item?.envelope ?? '-'}
                    </Badge>
                    {item?.uploadedFileSize ? (
                      <Badge variant="outline" className="font-mono">
                        {formatTemplateFileSize(item.uploadedFileSize)}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-semibold">
                        Uploaded file is attached to this requirement.
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PDF and image uploads render directly. Office files are
                        represented here until server-side preview conversion is
                        available.
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Requirement
                      </div>
                      <div className="rounded-md border p-3 text-sm">
                        {item?.name ?? 'Checklist requirement'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        File Type
                      </div>
                      <div className="rounded-md border p-3 text-sm">
                        {fileType || 'Detected by file extension'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
