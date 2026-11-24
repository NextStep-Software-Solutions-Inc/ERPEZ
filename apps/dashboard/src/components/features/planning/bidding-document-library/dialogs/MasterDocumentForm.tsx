import { useEffect, useState } from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'
import { TEMPLATE_FILE_ACCEPT, formatTemplateFileSize } from '../utils'
import type { ChangeEvent, FormEvent } from 'react'
import type { APIResponse } from 'erpez-shared-lib'
import type { MasterDoc, MasterDocumentFormData } from '../types'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface MasterDocumentFormProps {
  doc?: MasterDoc | null
  submitLabel: string
  onCancel: () => void
  onSubmit: (data: MasterDocumentFormData) => void
}

export function MasterDocumentForm({
  doc,
  submitLabel,
  onCancel,
  onSubmit,
}: MasterDocumentFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [envelope, setEnvelope] = useState<1 | 2>(1)
  const [templateFile, setTemplateFile] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const [templateError, setTemplateError] = useState('')
  const [fileId, setFileId] = useState<string | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setName(doc?.name ?? '')
    setDescription(doc?.description ?? '')
    setEnvelope(doc?.envelope ?? 1)
    setTemplateFile(doc?.templateFile ?? '')
    setSelectedFile(null)
    setFileId(undefined)
    setTemplateError('')
    setInputKey((k) => k + 1)
  }, [doc])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setTemplateFile(file.name)
    setTemplateError('')
    setFileId(undefined)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post<APIResponse<string>>(
        '/files/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setFileId(response.data.data)
    } catch {
      setTemplateError('File upload failed. Please try again.')
      setSelectedFile(null)
      setTemplateFile('')
      setInputKey((k) => k + 1)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTemplateFile('')
    setFileId(undefined)
    setTemplateError('')
    setInputKey((k) => k + 1)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (selectedFile && !fileId) {
      setTemplateError('File is still uploading. Please wait.')
      return
    }

    const trimmedTemplate = templateFile.trim()

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      envelope,
      templateFile: trimmedTemplate || undefined,
      templateFileId: fileId,
      templatePreviewUrl: selectedFile
        ? URL.createObjectURL(selectedFile)
        : trimmedTemplate
          ? doc?.templatePreviewUrl
          : undefined,
      templateFileType: selectedFile?.type
        ? selectedFile.type
        : trimmedTemplate
          ? doc?.templateFileType
          : undefined,
    })
  }

  // Derive a human-readable display name from the stored URL/filename.
  // /files/download/{uuid} → "Uploaded Template" (original name not stored separately)
  // blob:... / selected file → actual filename
  const UUID_ONLY = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  const savedTemplateName = templateFile.trim()
  const hasSavedTemplate = savedTemplateName !== ''

  const getStoredDisplayName = (url: string): string => {
    if (!url) return ''
    const last = url.split('/').pop() ?? url
    if (UUID_ONLY.test(last)) return 'Uploaded Template'
    const uscore = last.indexOf('_')
    return uscore !== -1 ? last.slice(uscore + 1) : last
  }

  const displayedTemplateName = selectedFile
    ? selectedFile.name
    : hasSavedTemplate
      ? getStoredDisplayName(savedTemplateName)
      : 'No template file attached'

  const templateStatus = isUploading
    ? 'Uploading file...'
    : selectedFile
      ? `Selected upload: ${selectedFile.name} (${formatTemplateFileSize(selectedFile.size)})`
      : hasSavedTemplate
        ? 'Template file attached — click preview icon to view'
        : 'PDF, DOC, DOCX, XLS, or XLSX (Optional)'

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor={doc ? 'edit-doc-name' : 'doc-name'}>
            Document Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id={doc ? 'edit-doc-name' : 'doc-name'}
            placeholder="e.g. PCAB Contractor License"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={doc ? 'edit-doc-desc' : 'doc-desc'}>
            Scope Description{' '}
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Textarea
            id={doc ? 'edit-doc-desc' : 'doc-desc'}
            placeholder="Summarize legality requirements or validity rules."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={doc ? 'edit-doc-env' : 'doc-env'}>
              Envelope Group <span className="text-destructive">*</span>
            </Label>
            <Select
              value={String(envelope)}
              onValueChange={(val) => setEnvelope(Number(val) as 1 | 2)}
            >
              <SelectTrigger id={doc ? 'edit-doc-env' : 'doc-env'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Envelope 1: Technical</SelectItem>
                <SelectItem value="2">Envelope 2: Financial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>
            Standard Template File{' '}
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <div className="overflow-hidden rounded-md border bg-muted/20 p-3">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {isUploading
                    ? <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    : <FileText className="h-4.5 w-4.5" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {displayedTemplateName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {templateStatus}
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2 pl-12">
                <Label
                  htmlFor={doc ? 'edit-doc-template-upload' : 'doc-template-upload'}
                  className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary bg-transparent px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {savedTemplateName || selectedFile ? 'Replace File' : 'Upload File'}
                </Label>
                {(savedTemplateName || selectedFile) && (
                  <Button
                    type="button"
                    variant="ghost"
                    color="destructive"
                    size="sm"
                    className="h-9 px-2"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                )}
                <Input
                  key={inputKey}
                  id={doc ? 'edit-doc-template-upload' : 'doc-template-upload'}
                  removeWrapper
                  type="file"
                  accept={TEMPLATE_FILE_ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            {templateError && (
              <p className="mt-2 text-xs font-medium text-destructive">
                {templateError}
              </p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}