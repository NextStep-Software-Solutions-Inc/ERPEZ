/**
 * Performance Review – MOV Uploader
 * Wraps the existing FileUpload component to work with the PR store.
 * Supports multiple file uploads per KPI row.
 */

import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import type { MOVFile } from '../types'

export interface MOVUploaderProps {
  kpiId: string
  movFiles: MOVFile[]
  onAdd: (kpiId: string, file: MOVFile) => void
  onRemove: (kpiId: string, fileId: string) => void
  disabled?: boolean
  acceptedTypes?: string
  preferredName?: string
  /** When provided, saved onto each uploaded file for later retrieval */
  configuredMOVIndex?: number
}

let fileCounter = 0

export function MOVUploader({ kpiId, movFiles, onAdd, onRemove, disabled, acceptedTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx', preferredName, configuredMOVIndex }: MOVUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    fileCounter += 1
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const fileType: MOVFile['fileType'] = ['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : 'document'

    // Use configured preferred name when provided; preserve extension.
    // Guard against duplicated extension when preferredName already includes one.
    const extPart = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
    const finalName = preferredName
      ? preferredName.toLowerCase().endsWith(extPart.toLowerCase()) ? preferredName : `${preferredName}${extPart}`
      : file.name

    const objectUrl = URL.createObjectURL(file)
    const movFile: MOVFile & { _revoke?: () => void } = {
      id: `mov-${Date.now()}-${fileCounter}`,
      name: finalName,
      url: objectUrl,
      fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      ...(preferredName ? { configuredMOVName: preferredName } : {}),
      // helper that callers (e.g. remove handler or preview unmount) can call to revoke the blob URL
      _revoke: () => {
      try {
        URL.revokeObjectURL(objectUrl)
      } catch {
        // ignore revoke errors
      }
      },
      ...(configuredMOVIndex !== undefined ? { configuredMOVIndex } : {}),
    }
    onAdd(kpiId, movFile)

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  const getFileIcon = (type: MOVFile['fileType']) => {
    if (type === 'image') return '🖼️'
    if (type === 'pdf') return '📄'
    return '📎'
  }

  return (
    <div className="space-y-2">
      {/* Uploaded files list */}
      {movFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {movFiles.map(f => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-lg border bg-white/50 px-3 py-1.5 text-sm shadow-sm"
            >
              <span className="text-sm">{getFileIcon(f.fileType)}</span>
              <span className="max-w-[140px] truncate">{f.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(kpiId, f.id)}
                  className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger */}
      {!disabled && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full rounded-md border border-dashed border-muted-foreground/30 px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="font-medium">{movFiles.length === 0 ? 'Upload MOV' : 'Add more evidence'}</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}

      {movFiles.length === 0 && disabled && (
        <span className="text-sm text-muted-foreground">No MOV uploaded</span>
      )}
    </div>
  )
}
