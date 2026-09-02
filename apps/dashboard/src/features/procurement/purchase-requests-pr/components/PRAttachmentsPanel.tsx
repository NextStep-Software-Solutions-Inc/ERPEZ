import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Loader2, Paperclip, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import FileUpload from '@/components/features/planning/file-upload/FileUpload'
import { createFileRequest } from '@/components/features/planning/file-upload/handlers/createFileRequest'
import type { PurchaseRequest } from '../types'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { purchaseRequestRequiresTor } from '../utils/torAttachment'
import { openSignedDocument } from '../utils/openSignedDocument'

interface PRAttachmentsPanelProps {
  pr: PurchaseRequest
  torValidationMessage?: string | null
  onViewSignedDocument?: () => void
}

const useUploadTorFile = createMutationHookFromTemplate(createFileRequest)

export function PRAttachmentsPanel({
  pr,
  torValidationMessage,
  onViewSignedDocument,
}: PRAttachmentsPanelProps) {
  const { updatePurchaseRequest } = usePurchaseRequestStore()
  const { toast } = useToast()
  const uploadTorMutation = useUploadTorFile()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResetKey, setUploadResetKey] = useState(0)

  const torRequired = purchaseRequestRequiresTor(pr)
  const hasTorAttachment = Boolean(pr.torAttachment?.url)
  const isApproved = pr.status === 'approved'
  const hasSignedDocument = Boolean(pr.signedPdfUrl) || isApproved

  if (!torRequired && !hasTorAttachment && !hasSignedDocument) {
    return null
  }

  return (
    <Card
      className={
        torValidationMessage
          ? 'border-destructive shadow-lg shadow-destructive/10'
          : 'border-0 shadow-lg overflow-hidden'
      }
    >
      <CardHeader className="border-b border-slate-200 bg-linear-to-r from-slate-50/50 to-slate-100/50 pb-4 dark:border-slate-700 dark:from-slate-900/20 dark:to-slate-800/20">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {torRequired && (
          <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-950">
                  Terms of Reference (TOR)
                </p>
                <p className="text-xs text-amber-800">
                  Required supporting attachment for this procurement category.
                </p>
              </div>

              {hasTorAttachment ? (
                <Badge color="warning" variant="outline">
                  TOR Attached
                </Badge>
              ) : (
                <Badge color="destructive" variant="outline">
                  Missing TOR
                </Badge>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-950">
                <Upload className="h-4 w-4" />
                <span>
                  {hasTorAttachment
                    ? 'Replace TOR attachment'
                    : 'Attach TOR now'}
                </span>
              </div>

              <FileUpload
                key={uploadResetKey}
                acceptedTypes=".pdf,.doc,.docx"
                disabled={uploadTorMutation.isPending}
                existingFileName={pr.torAttachment?.name}
                existingFileUrl={pr.torAttachment?.url}
                maxSize={10}
                validationState={uploadError ? 'error' : 'default'}
                onFileChange={(file) => {
                  const handleTorUpload = async () => {
                    if (!file) {
                      updatePurchaseRequest(pr.id, {
                        torAttachment: null,
                        updatedAt: new Date().toISOString(),
                      })
                      toast({
                        title: 'TOR Removed',
                        description:
                          'The TOR attachment has been removed from this PR.',
                      })
                      setUploadError(null)
                      setUploadResetKey((value) => value + 1)
                      return
                    }

                    setUploadError(null)

                    try {
                      const result = await uploadTorMutation.mutateAsync({
                        pathParams: {},
                        payload: { file },
                      })

                      if (!result.succeeded || !result.data) {
                        throw new Error(
                          result.message || 'Failed to upload TOR',
                        )
                      }

                      updatePurchaseRequest(pr.id, {
                        torAttachment: {
                          name: file.name,
                          url: result.data,
                          mimeType: file.type,
                          size: file.size,
                          uploadedAt: new Date().toISOString(),
                        },
                        updatedAt: new Date().toISOString(),
                      })

                      toast({
                        title: 'TOR Uploaded',
                        description:
                          'The Terms of Reference has been attached successfully.',
                      })
                    } catch (error) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : 'Unable to attach the Terms of Reference. Please try again.'
                      setUploadError(message)
                      toast({
                        title: 'TOR Upload Failed',
                        description: message,
                      })
                    } finally {
                      setUploadResetKey((value) => value + 1)
                    }
                  }

                  void handleTorUpload()
                }}
              />

              {uploadTorMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-amber-900">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading TOR...
                </div>
              )}

              {uploadError && (
                <Alert color="destructive" variant="soft">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {torValidationMessage && (
                <p className="text-sm font-medium text-destructive">
                  {torValidationMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {hasSignedDocument && (
          <div className="rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-purple-100/70 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-purple-950">
                  Signed PR Document
                </p>
                <p className="text-xs text-purple-800">
                  Download or view the signed copy from the approval stage.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="gap-2 border-purple-300 bg-white/80 text-purple-900 hover:bg-purple-50"
                onClick={() => {
                  if (pr.signedPdfUrl) {
                    openSignedDocument(pr.signedPdfUrl, 'Signed PR Document')
                  } else if (onViewSignedDocument) {
                    onViewSignedDocument()
                  } else {
                    openSignedDocument(pr.signedPdfUrl, 'Signed PR Document')
                  }
                }}
              >
                <FileText className="h-4 w-4" />
                View Signed Document
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
