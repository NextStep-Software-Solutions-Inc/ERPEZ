import { Upload } from 'lucide-react'
import {
  formatFileSize,
  getUploadSlotDefinitions,
} from '../data/mockBiddingDocumentsData'
import type {
  BiddingDocumentRecord,
  BiddingDocumentUploadSlotDefinition,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface BiddingDocumentUploadsSectionProps {
  document: BiddingDocumentRecord
  disabled: boolean
  uploadErrors: Record<string, string>
  onUpload: (
    slot: BiddingDocumentUploadSlotDefinition,
    file: File | undefined,
  ) => void
  onToggleCustomizedSpecialConditions: (enabled: boolean) => void
  formatDateTime: (value: string | null) => string
}

export function BiddingDocumentUploadsSection({
  document,
  disabled,
  uploadErrors,
  onUpload,
  onToggleCustomizedSpecialConditions,
  formatDateTime,
}: BiddingDocumentUploadsSectionProps) {
  const uploadDefinitions = getUploadSlotDefinitions(document)

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          Phase 0B - Document Section Uploads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-default-200 bg-default-50 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-default-900">
                  Customized Special Conditions of Contract
                </p>
                <Badge
                  variant="outline"
                  color={
                    document.workspace.draft.uploads.customizedSections
                      .specialConditions
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {document.workspace.draft.uploads.customizedSections
                    .specialConditions
                    ? 'Upload required'
                    : 'Standard GPPB SCC'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Turn this on only when the BAC/TWG is using a customized SCC.
                When off, the standard GPPB SCC is assumed and the upload is
                optional.
              </p>
            </div>
            <Switch
              checked={
                document.workspace.draft.uploads.customizedSections
                  .specialConditions
              }
              disabled={disabled}
              onCheckedChange={onToggleCustomizedSpecialConditions}
            />
          </div>
        </div>

        {uploadDefinitions.map((slot) => {
          const file = document.uploads[slot.key]

          return (
            <div
              key={slot.key}
              className="rounded-lg border border-default-200 bg-default-50 px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-default-900">
                    {slot.label}
                    {slot.required ? ' *' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot.helperText}
                  </p>
                  {file ? (
                    <div className="space-y-1 text-sm text-default-700">
                      <p>File: {file.fileName}</p>
                      <p>Size: {formatFileSize(file.sizeBytes)}</p>
                      <p>
                        Uploaded: {formatDateTime(file.uploadedAt)} by{' '}
                        {file.uploadedBy}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No file uploaded yet.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`upload-${slot.key}`} className="sr-only">
                    Upload {slot.label}
                  </Label>
                  <Input
                    id={`upload-${slot.key}`}
                    type="file"
                    accept={slot.accept}
                    disabled={disabled}
                    onChange={(event) => {
                      onUpload(slot, event.target.files?.[0])
                      event.currentTarget.value = ''
                    }}
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    Replaceable only. Max 10 MB.
                  </div>
                </div>
              </div>
              {uploadErrors[slot.key] && (
                <p className="mt-2 text-sm text-destructive">
                  {uploadErrors[slot.key]}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
