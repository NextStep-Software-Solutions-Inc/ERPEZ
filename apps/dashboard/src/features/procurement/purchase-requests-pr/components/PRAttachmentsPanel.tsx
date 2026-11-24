import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Paperclip, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import FileUpload from '@/components/features/planning/file-upload/FileUpload'
import { createFileRequest } from '@/components/features/planning/file-upload/handlers/createFileRequest'
import type { PurchaseRequest } from '../types'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { purchaseRequestRequiresTor } from '../utils/torAttachment'

interface PRAttachmentsPanelProps {
  pr: PurchaseRequest
  torValidationMessage?: string | null
  onViewSignedDocument?: () => void
}

const useUploadTorFile = createMutationHookFromTemplate(createFileRequest)

export function PRAttachmentsPanel({
  pr,
  torValidationMessage,
}: PRAttachmentsPanelProps) {
  const { updatePurchaseRequest } = usePurchaseRequestStore()
  const { toast } = useToast()
  const uploadTorMutation = useUploadTorFile()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResetKey, setUploadResetKey] = useState(0)

  const torRequired = purchaseRequestRequiresTor(pr)
  const hasTorAttachment = Boolean(pr.torAttachment?.url)

  if (!torRequired && !hasTorAttachment) {
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
      </CardContent>
    </Card>
  )
}
