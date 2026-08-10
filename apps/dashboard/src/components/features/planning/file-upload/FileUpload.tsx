import { useEffect, useRef, useState } from 'react'
import { FileText, Image, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileUploadProps {
  onFileChange?: (file: File | null) => void
  acceptedTypes?: string
  maxSize?: number // in MB
  disabled?: boolean
  existingFileUrl?: string | null
  existingFileName?: string | null
  validationState?: 'default' | 'error'
}
export default function FileUpload(props: FileUploadProps) {
  const {
    onFileChange,
    acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    maxSize = 10,
    disabled = false,
    existingFileUrl,
    existingFileName,
    validationState = 'default',
  } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    const allowedExtensions = acceptedTypes
      .split(',')
      .map((ext) => ext.trim().toLowerCase())
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${acceptedTypes}`
    }

    return null
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
    onFileChange?.(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    handleFileSelect(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    handleFileSelect(e.target.files)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onFileChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-8 h-8 text-blue-500" />
    }
    return <FileText className="w-8 h-8 text-gray-500" />
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="File preview"
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          getFileIcon(selectedFile.name)
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={disabled}
          className="text-destructive hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  if (existingFileUrl && existingFileName) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
          {existingFileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={existingFileUrl}
              alt="Existing file preview"
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            getFileIcon(existingFileName)
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{existingFileName}</p>
            <p className="text-xs text-muted-foreground line-clamp-3 max-w-[280px]">
              {existingFileUrl}
            </p>
            <p className="text-xs text-muted-foreground">Existing file</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Trigger file selection for replacement
                fileInputRef.current?.click()
              }}
              disabled={disabled}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                // Remove existing file
                onFileChange?.(null)
              }}
              disabled={disabled}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">File Upload</Label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : validationState === 'error'
                ? 'border-destructive bg-destructive/5 cursor-pointer'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload
            className={`w-8 h-8 ${disabled ? 'text-gray-400' : validationState === 'error' ? 'text-destructive' : 'text-gray-500'}`}
          />
          <div className="text-sm">
            <span
              className={`font-medium ${validationState === 'error' ? 'text-destructive' : 'text-blue-600'}`}
            >
              Click to upload
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-muted-foreground">
            {acceptedTypes} (max {maxSize}MB)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="soft" color="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
