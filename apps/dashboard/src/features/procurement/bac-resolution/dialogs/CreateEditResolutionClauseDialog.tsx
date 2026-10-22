import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Loader2, ScrollText } from 'lucide-react'
import { toast } from 'sonner'
import type { ResolutionClause, ResolutionClauseType } from '../types'

interface CreateEditResolutionClauseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultClauseType?: ResolutionClauseType
  template?: ResolutionClause | null
  onSave: (name: string, body: string, clauseType: ResolutionClauseType, id?: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function CreateEditResolutionClauseDialog({
  open,
  onOpenChange,
  defaultClauseType = 'Whereas',
  template,
  onSave,
  isSubmitting = false,
}: CreateEditResolutionClauseDialogProps) {
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [clauseType, setClauseType] = useState<ResolutionClauseType>(defaultClauseType)

  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name || '')
        setBody(template.body || '')
        setClauseType(template.clauseType || defaultClauseType)
      } else {
        setName('')
        setBody('')
        setClauseType(defaultClauseType)
      }
    }
  }, [open, template, defaultClauseType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !body.trim()) {
      toast.error('Both Clause Title and Clause Body are required.')
      return
    }

    try {
      await onSave(name.trim(), body.trim(), clauseType, template?.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save clause template:', error)
    }
  }

  const typeLabel =
    clauseType === 'Whereas'
      ? 'WHEREAS'
      : clauseType === 'NowTherefore'
      ? 'NOW, THEREFORE'
      : 'RESOLVED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl">
                {template?.id ? `Edit ${typeLabel} Clause Template` : `Create New ${typeLabel} Clause`}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                {template?.id
                  ? 'Update this template to apply across future BAC resolutions.'
                  : 'Define a reusable standard legal clause for BAC resolution documents.'}
              </DialogDescription>
            </div>
            {template?.id && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs shrink-0">
                Editing
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="clause-type" className="text-xs font-bold uppercase tracking-wider text-default-700">
              Clause Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={clauseType}
              onValueChange={(val) => setClauseType(val as ResolutionClauseType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="clause-type" className="text-sm font-medium">
                <SelectValue placeholder="Select clause category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Whereas">WHEREAS Clause</SelectItem>
                <SelectItem value="NowTherefore">NOW, THEREFORE Clause</SelectItem>
                <SelectItem value="Resolved">RESOLVED Clause</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clause-title" className="text-xs font-bold uppercase tracking-wider text-default-700">
              Clause Title / Reference Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clause-title"
              placeholder={`e.g., Standard ${typeLabel} Requirement`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="text-sm font-medium"
            />
            <p className="text-[11px] text-muted-foreground">
              Descriptive label used when selecting clauses during resolution creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clause-body" className="text-xs font-bold uppercase tracking-wider text-default-700">
              Clause Body Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="clause-body"
              placeholder={
                clauseType === 'Whereas'
                  ? 'WHEREAS, the End-User Office submitted a Purchase Request...'
                  : clauseType === 'NowTherefore'
                  ? 'NOW, THEREFORE, We, the members of the Bids and Awards Committee...'
                  : 'RESOLVED, as it is hereby RESOLVED, to recommend the approval...'
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              className="font-serif text-sm leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              Exact legal body text included in the printed BAC Resolution document.
            </p>
          </div>

          {/* Live Document Rendering Preview */}
          {body.trim() && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" /> Document Rendering Preview
              </p>
              <div className="text-xs font-serif leading-relaxed text-default-900 text-justify bg-white p-3 rounded-lg border border-primary/10 shadow-xs">
                <span className="font-bold">{name || `${typeLabel},`} </span>
                {body}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-default-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !body.trim() || isSubmitting} className="gap-1.5">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {template?.id ? 'Save Template Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
