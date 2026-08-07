import { Eye, FileText } from 'lucide-react'
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
import type { MasterDoc } from '../types'

interface TemplateViewerDialogProps {
  doc: MasterDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateViewerDialog({
  doc,
  open,
  onOpenChange,
}: TemplateViewerDialogProps) {
  const templateName = doc?.templateFile ?? ''
  const templateType = doc?.templateFileType ?? ''
  const templateUrl = doc?.templatePreviewUrl || doc?.templateFile || ''

  const canRenderPdf = Boolean(
    templateUrl &&
      (templateType.includes('pdf') ||
        templateName.toLowerCase().endsWith('.pdf') ||
        templateUrl.toLowerCase().includes('.pdf')),
  )
  const canRenderImage = Boolean(
    templateUrl &&
      (templateType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(templateUrl)),
  )
  const previewTitle = doc?.name ?? 'Blank Template'
  const envelopeLabel =
    doc?.envelope === 2 ? 'Envelope 2: Financial' : 'Envelope 1: Technical'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Blank Template File
          </DialogTitle>
          <DialogDescription className="break-all">
            {templateName || 'No template file selected'}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/20 overflow-hidden">
          {canRenderPdf && templateUrl ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(templateUrl)}&embedded=true`}
              title={templateName}
              className="h-[68vh] w-full bg-background"
            />
          ) : canRenderImage && templateUrl ? (
            <div className="flex h-[68vh] items-center justify-center bg-background p-4">
              <img
                src={templateUrl}
                alt={templateName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto bg-slate-100 p-4">
              {templateUrl && (
                <div className="flex justify-end p-2 border-b bg-muted/10 mb-4">
                  <a
                    href={templateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    Open / Download file
                  </a>
                </div>
              )}
              <div className="mx-auto min-h-[760px] max-w-[680px] bg-background p-10 shadow-sm">
                <div className="border-b pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                        GPPB Blank Template Mock Preview
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-foreground">
                        {previewTitle}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {doc?.description ||
                          'Standard blank template for supplier completion.'}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        doc?.envelope === 2
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-info/10 text-info border-info/20'
                      }
                    >
                      {envelopeLabel}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      {templateName || 'blank-template-mock.pdf'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-8 space-y-7">
                  {[
                    'Bidder / Supplier Name',
                    'Business Address',
                    'Project Reference Number',
                    'Authorized Representative',
                  ].map((field) => (
                    <div key={field} className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {field}
                      </div>
                      <div className="h-9 border-b border-dashed border-default-400" />
                    </div>
                  ))}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Date Prepared
                      </div>
                      <div className="h-9 border-b border-dashed border-default-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Contact Number
                      </div>
                      <div className="h-9 border-b border-dashed border-default-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Required Statements / Attachments
                    </div>
                    <div className="space-y-3 rounded-md border p-4">
                      {[
                        'All required entries are complete and accurate.',
                        'Supporting documents are attached where applicable.',
                        'The authorized representative certifies this submission.',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded border border-default-400" />
                          <span className="text-sm text-muted-foreground">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-8 pt-8 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="h-12 border-b border-default-500" />
                      <div className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Bidder Signature
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-12 border-b border-default-500" />
                      <div className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Date Signed
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                    Mock preview for seeded templates. Uploaded PDF and image
                    templates render directly in this viewer.
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
