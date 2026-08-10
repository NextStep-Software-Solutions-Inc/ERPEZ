import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import {
  AlertCircle,
  CloudUpload,
  FileText,
  FolderOpen,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProjectChecklistItem, UploadedFileAttachment } from '../types'
import { formatTemplateFileSize } from '../utils'

const SUPPLIER_UPLOAD_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

interface SupplierUploadDialogProps {
  item: ProjectChecklistItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (itemId: string, upload: UploadedFileAttachment) => void
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex) : ''
}

function hasAcceptedExtension(fileName: string) {
  const extension = getFileExtension(fileName).replace('.', '').toLowerCase()
  return SUPPLIER_UPLOAD_ACCEPT.split(',')
    .map((value) => value.replace('.', '').trim())
    .includes(extension)
}

function normalizeRenamedFileName(renamedFileName: string, originalFile: File) {
  const trimmedName = renamedFileName.trim()
  if (!trimmedName) return ''
  if (getFileExtension(trimmedName)) return trimmedName
  return `${trimmedName}${getFileExtension(originalFile.name)}`
}

export function SupplierUploadDialog({
  item,
  open,
  onOpenChange,
  onUpload,
}: SupplierUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [renamedFileName, setRenamedFileName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
      setRenamedFileName('')
      setError('')
      setIsDragging(false)
    }
  }, [open])

  const handleFile = (file: File | undefined) => {
    if (!file) return

    if (!hasAcceptedExtension(file.name)) {
      setError('Use a PDF, Word, Excel, JPG, or PNG file.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError('File must be 10 MB or smaller.')
      return
    }

    setSelectedFile(file)
    setRenamedFileName(file.name)
    setError('')
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!item) return
    if (!selectedFile) {
      setError('Select a file before uploading.')
      return
    }

    const finalFileName = normalizeRenamedFileName(
      renamedFileName,
      selectedFile,
    )
    if (!finalFileName) {
      setError('Enter a file name.')
      return
    }

    onUpload(item.id, {
      fileName: finalFileName,
      previewUrl: URL.createObjectURL(selectedFile),
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            {item?.name ?? 'Select a checklist slot'} for Envelope{' '}
            {item?.envelope ?? '-'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-default-300 bg-muted/20 hover:border-primary/60 hover:bg-primary/5'
            }`}
          >
            <CloudUpload
              className={`mx-auto h-8 w-8 ${
                isDragging ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <div className="mt-3 text-sm font-semibold text-foreground">
              {isDragging ? 'Drop file here' : 'Drag and drop file here'}
            </div>
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={(event) => {
                  event.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <FolderOpen className="h-4 w-4" />
                Browse Folder
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPLIER_UPLOAD_ACCEPT}
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-success/5 p-3 text-success">
              <FileText className="h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {selectedFile.name}
                </div>
                <div className="text-xs">
                  {formatTemplateFileSize(selectedFile.size)}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="supplier-upload-file-name">
              Uploaded File Name
            </Label>
            <Input
              id="supplier-upload-file-name"
              value={renamedFileName}
              onChange={(event) => {
                setRenamedFileName(event.target.value)
                if (event.target.value.trim()) setError('')
              }}
              placeholder="Enter the file name saved to this slot"
              disabled={!selectedFile}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5" disabled={!selectedFile}>
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
