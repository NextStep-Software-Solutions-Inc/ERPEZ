/**
 * Step 2: Activities Conducted Form
 * Collects market research activities with evidence file uploads
 * Uses real API endpoints for activity settings
 * Location: src/features/planning/market-scoping/forms/
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAtom } from 'jotai'
import {
  draftMarketScopingAtom,
  currentFormStepAtom,
} from '../atoms/marketScopingStateAtom'
import { FILE_UPLOAD_CONFIG } from '../utils/constants'
import { AttachmentViewer } from '../components/AttachmentViewer'
import { fetchActivitySettings } from '../handlers/getActivitySettingsRequest'
import type {
  ActivityEvidence,
  FileAttachment,
} from '../types/marketScopingTypes'
import type { RawActivityConducted } from '../types/marketScopingApiTypes'

type DraftActivityItem = ActivityEvidence | RawActivityConducted

interface ActivitiesConductedFormProps {
  onNext: (activities: ActivityEvidence[]) => void
  onPrevious: () => void
  onSaveDraft?: (activities: ActivityEvidence[]) => void
}

export function ActivitiesConductedForm({
  onNext,
  onPrevious,
  onSaveDraft,
}: ActivitiesConductedFormProps) {
  const [draft] = useAtom(draftMarketScopingAtom)
  const [, setCurrentStep] = useAtom(currentFormStepAtom)
  const { toast } = useToast()

  // State for API loading
  const [isLoading, setIsLoading] = useState(true)

  // State for form activities
  const [activities, setActivities] = useState<ActivityEvidence[]>(
    draft?.activities || [],
  )

  // Fetch activity settings on mount & hydrate from draft
  useEffect(() => {
    const loadActivitySettings = async () => {
      setIsLoading(true)
      try {
        const settings = await fetchActivitySettings()

        const draftActivities: DraftActivityItem[] =
          draft?.activities || draft?.activitiesConducted || []
        const draftedMap = new Map<string, DraftActivityItem>()

        draftActivities.forEach((act: DraftActivityItem) => {
          if (act.activitySettingsId)
            draftedMap.set(act.activitySettingsId, act)
          if ('activityId' in act && act.activityId)
            draftedMap.set(act.activityId, act)
          if (act.id) draftedMap.set(act.id, act)
          if (act.label) draftedMap.set(act.label.toLowerCase().trim(), act)
        })

        const mergedActivities: ActivityEvidence[] = settings.map((setting) => {
          const match =
            draftedMap.get(setting.id) ||
            draftedMap.get(setting.label?.toLowerCase()?.trim() || '')

          if (match) {
            const isChecked =
              'checked' in match ? (match.checked ?? true) : true
            const attachments: FileAttachment[] = (match.attachments || []).map(
              (att, attIdx) => {
                const url =
                  att.fileUrl ||
                  ('url' in att && att.url) ||
                  ('fileId' in att && att.fileId) ||
                  ''
                return {
                  id:
                    att.id ||
                    ('fileId' in att && att.fileId) ||
                    url ||
                    `att-${setting.id}-${attIdx}`,
                  fileName:
                    att.fileName ||
                    ('name' in att && att.name) ||
                    `Attachment ${attIdx + 1}`,
                  fileUrl: url,
                  fileSize:
                    att.fileSize ?? ('size' in att ? att.size : undefined),
                  fileType:
                    att.fileType ?? ('type' in att ? att.type : undefined),
                  uploadedDate: att.uploadedDate
                    ? new Date(att.uploadedDate)
                    : undefined,
                  rawFile: 'rawFile' in att ? att.rawFile : undefined,
                }
              },
            )
            return {
              id: setting.id,
              activitySettingsId: setting.id,
              activityType: setting.activityType,
              label: setting.label,
              description: setting.description,
              checked: isChecked,
              attachments,
            }
          }

          return {
            id: setting.id,
            activitySettingsId: setting.id,
            activityType: setting.activityType,
            label: setting.label,
            description: setting.description,
            checked: false,
            attachments: [],
          }
        })

        setActivities(mergedActivities)
      } catch (error) {
        console.error('Failed to fetch activity settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load activity settings. Please try again.',
          color: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadActivitySettings()
  }, [draft])

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const toggleActivity = (settingsId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.activitySettingsId === settingsId
          ? { ...activity, checked: !activity.checked }
          : activity,
      ),
    )
  }

  const handleFileChange = useCallback((settingsId: string, files: File[]) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.activitySettingsId === settingsId) {
          const newAttachments: FileAttachment[] = files.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileSize: file.size,
            fileType: file.type,
            uploadedDate: new Date(),
            rawFile: file,
          }))

          return {
            ...activity,
            attachments: [...(activity.attachments || []), ...newAttachments],
          }
        }
        return activity
      }),
    )
  }, [])

  const removeAttachment = (settingsId: string, attachmentId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.activitySettingsId === settingsId
          ? {
              ...activity,
              attachments: activity.attachments.filter(
                (att) => att.id !== attachmentId,
              ),
            }
          : activity,
      ),
    )
  }

  const handleRenameAttachment = useCallback(
    (settingsId: string, attachmentId: string, newName: string) => {
      setActivities((prev) =>
        prev.map((activity) => {
          if (activity.activitySettingsId === settingsId) {
            return {
              ...activity,
              attachments: activity.attachments.map((att) =>
                att.id === attachmentId ? { ...att, fileName: newName } : att,
              ),
            }
          }
          return activity
        }),
      )
    },
    [],
  )

  const checkedCount = activities.filter((a) => a.checked).length
  const hasUnsupportedCheckedActivities = activities.some(
    (a) => a.checked && a.attachments.length === 0,
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-gray-600">
              Loading activity settings...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activities Conducted</CardTitle>
          <CardDescription>
            Select the market research activities you conducted and attach
            supporting evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Activities Checklist */}
            {activities.map((activity) => {
              const settingsId = activity.activitySettingsId || activity.id
              return (
                <div
                  key={settingsId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`activity-${settingsId}`}
                      checked={activity.checked}
                      onCheckedChange={() => toggleActivity(settingsId)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`activity-${settingsId}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {activity.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  {/* Conditional fields when checked */}
                  {activity.checked && (
                    <div className="ml-9 space-y-3 border-t pt-3">
                      {/* File Upload */}
                      <FileUploadDropzone
                        activityId={settingsId}
                        files={activity.attachments || []}
                        onFilesChange={handleFileChange}
                        onRemoveFile={(fileId: string) =>
                          removeAttachment(settingsId, fileId)
                        }
                        onRenameFile={(fileId: string, newName: string) =>
                          handleRenameAttachment(settingsId, fileId, newName)
                        }
                      />

                      {activity.attachments.length === 0 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800">
                            Draft Notice: Supporting document not yet attached.
                            You can proceed or save as draft now, but files must
                            be attached before final submission.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Summary and Validation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>{checkedCount}</strong> activit
                {checkedCount !== 1 ? 'ies' : 'y'} selected
              </p>
              {hasUnsupportedCheckedActivities && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Draft mode:{' '}
                    {
                      activities.filter(
                        (a) => a.checked && a.attachments.length === 0,
                      ).length
                    }{' '}
                    checked activit
                    {activities.filter(
                      (a) => a.checked && a.attachments.length === 0,
                    ).length > 1
                      ? 'ies'
                      : 'y'}{' '}
                    missing supporting documents. You can save as draft or
                    proceed, but attachments are required before submitting for
                    approval.
                  </p>
                </div>
              )}
              {checkedCount === 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  Draft tip: You can select activities and upload evidence now,
                  or save your draft and return to complete this step later.
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
              <div className="flex items-center gap-3">
                {onSaveDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSaveDraft(activities)}
                  >
                    Save as Draft
                  </Button>
                )}
                <Button onClick={() => onNext(activities)}>
                  Next: Parameter Evaluation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * File Upload Dropzone Component
 */
function FileUploadDropzone({
  activityId,
  files,
  onFilesChange,
  onRemoveFile,
  onRenameFile,
}: {
  activityId: string
  files: FileAttachment[]
  onFilesChange: (activityId: string, files: File[]) => void
  onRemoveFile: (fileId: string) => void
  onRenameFile: (fileId: string, newName: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter((file) =>
      FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type),
    )
    if (validFiles.length > 0) {
      onFilesChange(activityId, validFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    onFilesChange(activityId, selectedFiles)
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-3">
          PDF, Word, Excel, or image files. Max 10MB per file.
        </p>
        <input
          type="file"
          multiple
          accept={FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          id={`file-input-${activityId}`}
        />
        <Label
          htmlFor={`file-input-${activityId}`}
          className="cursor-pointer text-primary text-sm"
        >
          Browse files
        </Label>
      </div>

      {/* Uploaded Files List using AttachmentViewer */}
      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <AttachmentViewer
            attachments={files}
            showLabel={true}
            compact={false}
            onRemove={onRemoveFile}
            onRename={onRenameFile}
          />
        </div>
      )}
    </div>
  )
}
