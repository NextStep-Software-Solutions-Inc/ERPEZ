import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { FileText, Upload } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTemplateFileSize, TEMPLATE_FILE_ACCEPT } from '../utils'

interface CustomRequirementData {
  name: string
  envelope: 1 | 2
  templateFile: string
  templatePreviewUrl?: string
  templateFileType?: string
}

interface CustomRequirementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: CustomRequirementData) => void
}

export function CustomRequirementDialog({
  open,
  onOpenChange,
  onAdd,
}: CustomRequirementDialogProps) {
  const [name, setName] = useState('')
  const [envelope, setEnvelope] = useState<1 | 2>(1)
  const [templateFile, setTemplateFile] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const [templateError, setTemplateError] = useState('')

  useEffect(() => {
    if (!open) return

    setName('')
    setEnvelope(1)
    setTemplateFile('')
    setSelectedFile(null)
    setTemplateError('')
    setInputKey((key) => key + 1)
  }, [open])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setTemplateFile(file.name)
    setTemplateError('')
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTemplateFile('')
    setTemplateError('Standard template file is required.')
    setInputKey((key) => key + 1)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!templateFile.trim()) {
      setTemplateError('Standard template file is required.')
      return
    }

    onAdd({
      name,
      envelope,
      templateFile: templateFile.trim(),
      templatePreviewUrl: selectedFile
        ? URL.createObjectURL(selectedFile)
        : undefined,
      templateFileType: selectedFile?.type,
    })
  }

  const savedTemplateName = templateFile.trim()
  const displayedTemplateName =
    savedTemplateName || selectedFile?.name || 'No template file uploaded'
  const templateStatus = selectedFile
    ? `Selected upload: ${selectedFile.name} (${formatTemplateFileSize(selectedFile.size)})`
    : savedTemplateName
      ? 'Current attached template'
      : 'PDF, DOC, DOCX, XLS, or XLSX'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Custom Project Requirement</DialogTitle>
            <DialogDescription>
              Specify an additional document that the supplier must upload for
              this specific project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cust-name">Requirement Title</Label>
              <Input
                id="cust-name"
                placeholder="e.g. License to Operate (LTO) from FDA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cust-env">Envelope Group Assignment</Label>
              <Select
                value={String(envelope)}
                onValueChange={(val) => setEnvelope(Number(val) as 1 | 2)}
              >
                <SelectTrigger id="cust-env">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Envelope 1: Technical & Eligibility
                  </SelectItem>
                  <SelectItem value="2">
                    Envelope 2: Financial Proposal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Standard Template File{' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="overflow-hidden rounded-md border bg-muted/20 p-3">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4.5 w-4.5" />
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
                      htmlFor="cust-template-upload"
                      className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary bg-transparent px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {savedTemplateName || selectedFile
                        ? 'Replace File'
                        : 'Upload File'}
                    </Label>
                    {(savedTemplateName || selectedFile) && (
                      <Button
                        type="button"
                        variant="ghost"
                        color="destructive"
                        size="sm"
                        className="h-9 px-2"
                        onClick={handleRemoveFile}
                      >
                        Remove
                      </Button>
                    )}
                    <Input
                      key={inputKey}
                      id="cust-template-upload"
                      removeWrapper
                      type="file"
                      accept={TEMPLATE_FILE_ACCEPT}
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <Label htmlFor="cust-template-name">Saved File Name</Label>
                  <Input
                    id="cust-template-name"
                    placeholder="e.g. FDA_LTO_Template.docx"
                    value={templateFile}
                    onChange={(e) => {
                      setTemplateFile(e.target.value)
                      if (e.target.value.trim()) setTemplateError('')
                    }}
                    required
                    aria-invalid={Boolean(templateError)}
                  />
                  {templateError && (
                    <p className="text-xs font-medium text-destructive">
                      {templateError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add to Checklist</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
