import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Eye, Paperclip, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { PPMPAttachment, SupportingDocumentCategory } from '../types'

const MAX_ATTACHMENTS = 5
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
const ACCEPTED_TYPES = ACCEPTED_EXTENSIONS.join(',')

const CATEGORY_OPTIONS: Array<{
  value: SupportingDocumentCategory
  label: string
}> = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'specification', label: 'Specification' },
  { value: 'certification', label: 'Certification' },
  { value: 'photo', label: 'Photo' },
  { value: 'other', label: 'Other' },
]

interface SupportingDocumentsCellProps {
  title?: string
  attachments?: PPMPAttachment[] | null
  onAttachmentsChange: (
    nextAttachments: PPMPAttachment[],
  ) => void | Promise<void>
  isReadOnly?: boolean
  disabled?: boolean
  className?: string
}

function getFileExtension(fileName: string): string {
  const position = fileName.lastIndexOf('.')
  if (position < 0) return ''
  return fileName.slice(position).toLowerCase()
}

function isSupportedAttachmentFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name))
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) return `${fileSize} B`
  if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`
  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
}

function isBlobUrl(url?: string | null): boolean {
  return !!url?.startsWith('blob:')
}

function createAttachmentRecord(file: File): PPMPAttachment {
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName: file.name,
    category: 'other',
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    previewUrl: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
  }
}

export function SupportingDocumentsCell({
  title = 'Supporting documents',
  attachments,
  onAttachmentsChange,
  isReadOnly = false,
  disabled = false,
  className,
}: SupportingDocumentsCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draftAttachments, setDraftAttachments] = useState<PPMPAttachment[]>(
    attachments ?? [],
  )

  const draftAttachmentsRef = useRef(draftAttachments)
  useEffect(() => {
    draftAttachmentsRef.current = draftAttachments
  }, [draftAttachments])

  useEffect(() => {
    setDraftAttachments(attachments ?? [])
  }, [attachments])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      draftAttachmentsRef.current.forEach((attachment) => {
        if (attachment.previewUrl && isBlobUrl(attachment.previewUrl)) {
          URL.revokeObjectURL(attachment.previewUrl)
        }
      })
    }
  }, [])

  const commitAttachments = useCallback(
    (nextAttachments: PPMPAttachment[]) => {
      setDraftAttachments(nextAttachments)
      void onAttachmentsChange(nextAttachments)
    },
    [onAttachmentsChange],
  )

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files || files.length === 0 || disabled) return

      const currentAttachments = draftAttachments
      const availableSlots = MAX_ATTACHMENTS - currentAttachments.length

      if (availableSlots <= 0) {
        toast.error(
          `You can attach up to ${MAX_ATTACHMENTS} files per line item.`,
        )
        resetFileInput()
        return
      }

      const acceptedFiles: File[] = []
      const rejectedFiles: string[] = []

      for (const file of Array.from(files)) {
        if (acceptedFiles.length >= availableSlots) break
        if (!isSupportedAttachmentFile(file)) {
          rejectedFiles.push(file.name)
          continue
        }
        acceptedFiles.push(file)
      }

      if (rejectedFiles.length > 0) {
        toast.error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.')
      }

      if (acceptedFiles.length === 0) {
        resetFileInput()
        return
      }

      const nextAttachments = [
        ...currentAttachments,
        ...acceptedFiles.map(createAttachmentRecord),
      ]

      commitAttachments(nextAttachments)

      if (acceptedFiles.length < Array.from(files).length) {
        toast.info(
          `Added ${acceptedFiles.length} file${acceptedFiles.length === 1 ? '' : 's'}. The 5-file cap or file type filter skipped the rest.`,
        )
      }

      resetFileInput()
    },
    [commitAttachments, disabled, draftAttachments],
  )

  const handleAttachmentCategoryChange = useCallback(
    (attachmentId: string, category: SupportingDocumentCategory) => {
      commitAttachments(
        draftAttachments.map((attachment) =>
          attachment.id === attachmentId
            ? {
                ...attachment,
                category,
              }
            : attachment,
        ),
      )
    },
    [commitAttachments, draftAttachments],
  )

  const handleAttachmentRemove = useCallback(
    (attachmentId: string) => {
      const attachment = draftAttachments.find(
        (entry) => entry.id === attachmentId,
      )
      if (attachment?.previewUrl && isBlobUrl(attachment.previewUrl)) {
        URL.revokeObjectURL(attachment.previewUrl)
      }

      commitAttachments(
        draftAttachments.filter((entry) => entry.id !== attachmentId),
      )
    },
    [commitAttachments, draftAttachments],
  )

  const handleAttachmentPreview = useCallback((attachment: PPMPAttachment) => {
    if (!attachment.previewUrl) {
      toast.error('Preview is unavailable for this file.')
      return
    }

    window.open(attachment.previewUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const count = draftAttachments.length
  const canUploadMore = !disabled && !isReadOnly && count < MAX_ATTACHMENTS

  return (
    <div className={cn('space-y-1', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={isReadOnly ? 'ghost' : 'outline'}
            size="sm"
            className={cn(
              'h-8 w-full justify-between gap-2 text-xs',
              isReadOnly && 'cursor-pointer px-2',
            )}
            disabled={disabled && !isReadOnly}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{title}</span>
            </span>
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {count}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-96 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{title}</p>
            <p className="text-xs text-muted-foreground">
              Attach PDF, DOC, DOCX, XLS, or XLSX files. Up to {MAX_ATTACHMENTS}{' '}
              files per line item.
            </p>
          </div>

          {!isReadOnly && (
            <div
              className={cn(
                'rounded-lg border border-dashed p-3 text-center transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : canUploadMore
                    ? 'border-border bg-muted/20 hover:bg-muted/30'
                    : 'border-border/60 bg-muted/10 opacity-70',
              )}
              onDragEnter={(e) => {
                e.preventDefault()
                if (canUploadMore) setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (canUploadMore) setDragActive(true)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                if (!canUploadMore) return
                handleFiles(e.dataTransfer.files)
              }}
              onClick={() => {
                if (canUploadMore) {
                  fileInputRef.current?.click()
                }
              }}
            >
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                disabled={disabled}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {canUploadMore
                      ? 'Click to add files or drag & drop'
                      : 'Attachment limit reached'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ACCEPTED_TYPES}
                  </p>
                </div>
                {count >= MAX_ATTACHMENTS && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    {MAX_ATTACHMENTS}-file limit reached
                  </Badge>
                )}
              </div>
            </div>
          )}

          {draftAttachments.length > 0 ? (
            <div className="space-y-2">
              {draftAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="space-y-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="truncate text-sm font-medium text-foreground">
                          {attachment.fileName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} ·{' '}
                        {attachment.mimeType || 'Unknown type'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleAttachmentPreview(attachment)}
                        disabled={!attachment.previewUrl}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleAttachmentRemove(attachment.id)}
                          aria-label="Remove attachment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isReadOnly ? (
                    <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Category
                      </Label>
                      <Select
                        value={attachment.category}
                        onValueChange={(value) =>
                          handleAttachmentCategoryChange(
                            attachment.id,
                            value as SupportingDocumentCategory,
                          )
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {attachment.category}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No supporting documents attached yet.
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {draftAttachments.length}/{MAX_ATTACHMENTS} attached
            </span>
            {!isReadOnly && (
              <span>Categories are required for every file.</span>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
