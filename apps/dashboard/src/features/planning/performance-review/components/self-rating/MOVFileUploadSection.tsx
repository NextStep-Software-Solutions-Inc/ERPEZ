/**
 * MOV (Means of Verification) File Upload Section
 * Renders one file upload field per configured MOV
 * Displays existing files and allows replacement in edit mode
 */

import { useCallback, useRef } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import FileUpload from '@/components/features/planning/file-upload/FileUpload'
import { usePerformanceReviewFileUploadStore } from '../../store/performanceReviewFileUploadStore'
import type { MOVFile } from '../../types'

interface MOVFileUploadSectionProps {
  itemId: string
  configuredMOVs: string[] | undefined
  existingFiles?: MOVFile[] | null
  isReadOnly: boolean
  onFilesChange?: (files: Map<number, File>) => void
}

/**
 * MOV File Upload Section - manages upload fields and tracks selected files
 * Exposes files via callback for parent to collect before submission
 */
export function MOVFileUploadSection({
  itemId,
  configuredMOVs,
  existingFiles,
  isReadOnly,
  onFilesChange,
}: MOVFileUploadSectionProps) {
  // Track selected files: movIndex -> File
  const selectedFilesRef = useRef<Map<number, File>>(new Map())

  // Notify parent of file changes
  const handleFileChanged = useCallback(
    (movIndex: number, file: File | null) => {
      if (file) {
        selectedFilesRef.current.set(movIndex, file)
        toast.success(`File "${file.name}" selected for MOV ${movIndex + 1} successfully!`)
      } else {
        const removedFile = selectedFilesRef.current.get(movIndex)
        selectedFilesRef.current.delete(movIndex)
        if (removedFile) {
          toast.info(`Removed file selection for MOV ${movIndex + 1}`)
        }
      }
      // Notify parent component of all currently selected files
      onFilesChange?.(new Map(selectedFilesRef.current))
    },
    [onFilesChange],
  )

  // If no configured MOVs, don't render
  if (!configuredMOVs || configuredMOVs.length === 0) {
    return null
  }

  // In read-only mode, only show existing files as links
  if (isReadOnly) {
    if (!existingFiles || existingFiles.length === 0) {
      return null
    }

    return (
      <div className="px-4 py-3 border-t space-y-2">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
          Means of Verification (MOVs)
        </Label>
        <div className="space-y-1.5">
          {existingFiles.map((file, idx) => (
            <div
              key={`${file.id}-${idx}`}
              className="flex items-center gap-2 p-2 rounded border bg-green-50/30 border-green-200 text-sm animate-in fade-in duration-300"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex-1 truncate"
              >
                {file.name}
              </a>
              <Badge variant="outline" className="text-[10px] shrink-0 bg-green-50 text-green-700 border-green-200">
                Uploaded
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Edit mode: Show upload fields for each MOV
  return (
    <div className="px-4 py-3 border-t space-y-3">
      <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
        Means of Verification ({configuredMOVs.length})
        <span className="text-destructive ml-1">*</span>
      </Label>

      <div className="space-y-3">
        {configuredMOVs.map((movName, movIndex) => (
          <MOVFileUploadField
            key={`${itemId}-mov-${movIndex}`}
            itemId={itemId}
            movIndex={movIndex}
            movName={movName}
            existingFile={existingFiles?.[movIndex]}
            onFileChange={(file) => handleFileChanged(movIndex, file)}
          />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        All MOVs require file uploads for submission
      </p>
    </div>
  )
}

/**
 * Individual MOV file upload field
 */
interface MOVFileUploadFieldProps {
  itemId: string
  movIndex: number
  movName: string
  existingFile?: MOVFile | null
  onFileChange?: (file: File | null) => void
}

function MOVFileUploadField({
  itemId,
  movIndex,
  movName,
  existingFile,
  onFileChange,
}: MOVFileUploadFieldProps) {
  const uploadState = usePerformanceReviewFileUploadStore((state) =>
    state.getUploadState(itemId, movIndex),
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentFile = uploadState?.file
  const isUploading = uploadState?.status === 'uploading'
  const isSuccess = uploadState?.status === 'success' || (!!existingFile && !currentFile)
  const isError = uploadState?.status === 'error'
  const isReadyToUpload = !!currentFile && !isUploading && uploadState?.status !== 'success'

  // Handle file selection for replacing existing file
  const handleReplaceClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-1.5 p-2 border rounded-md bg-slate-50">
      {/* MOV Label with status indicators */}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-slate-700">
          MOV {movIndex + 1}: {movName}
        </Label>
        {isUploading && (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span className="text-[10px] text-blue-600 font-medium">
              Uploading...
            </span>
          </div>
        )}
        {isSuccess && (
          <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[10px] text-green-600 font-semibold">
              Uploaded
            </span>
          </div>
        )}
        {isReadyToUpload && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] text-amber-600 font-semibold">
              Ready to Upload
            </span>
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-[10px] text-destructive font-medium">
              Failed
            </span>
          </div>
        )}
      </div>

      {/* File Upload Component or Existing File Display */}
      {currentFile ? (
        <div className="flex items-center gap-2 p-2 border rounded bg-blue-50/50 border-blue-200/50">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 truncate">
              {currentFile.name}
            </p>
            <p className="text-xs text-muted-foreground">Selected for upload</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-destructive hover:text-destructive"
            onClick={() => onFileChange?.(null)}
            disabled={isUploading}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileChange?.(e.target.files[0])
              }
              e.target.value = ''
            }}
            className="hidden"
          />
        </div>
      ) : existingFile ? (
        <ExistingFileDisplay
          file={existingFile}
          onRemove={() => onFileChange?.(null)}
          onReplace={handleReplaceClick}
          fileInputRef={fileInputRef}
          onFileSelected={(file) => onFileChange?.(file)}
        />
      ) : (
        <FileUpload
          onFileChange={onFileChange}
          acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          maxSize={10}
          disabled={isUploading}
          validationState={isError ? 'error' : 'default'}
        />
      )}

      {/* Error Message */}
      {isError && uploadState?.error && (
        <Alert variant="soft" color="destructive" className="p-2">
          <AlertDescription className="text-xs">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Display existing file with option to replace
 */
interface ExistingFileDisplayProps {
  file: MOVFile
  onRemove: () => void
  onReplace: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelected: (file: File) => void
}

function ExistingFileDisplay({
  file,
  onRemove,
  onReplace,
  fileInputRef,
  onFileSelected,
}: ExistingFileDisplayProps) {
  return (
    <>
      <div className="flex items-center gap-2 p-2 border rounded bg-green-50/50 border-green-200/50">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline truncate block"
          >
            {file.name}
          </a>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-green-700 font-medium">Uploaded Successfully</span>
            <span className="text-[10px] text-muted-foreground">• Existing file</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onReplace}
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input for replace functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelected(e.target.files[0])
          }
          e.target.value = ''
        }}
        className="hidden"
      />
    </>
  )
}
