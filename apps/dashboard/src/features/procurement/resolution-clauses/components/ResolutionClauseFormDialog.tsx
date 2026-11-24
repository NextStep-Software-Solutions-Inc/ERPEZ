import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FileText } from 'lucide-react'
import type { ResolutionClause, ResolutionClauseType } from '../types'

interface ResolutionClauseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clause?: ResolutionClause | null
  defaultClauseType?: ResolutionClauseType
  onSave: (name: string, body: string, type: ResolutionClauseType) => Promise<void> | void
  isSubmitting?: boolean
}

export function ResolutionClauseFormDialog({
  open,
  onOpenChange,
  clause,
  defaultClauseType = 'Whereas',
  onSave,
  isSubmitting = false,
}: ResolutionClauseFormDialogProps) {
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [clauseType, setClauseType] = useState<ResolutionClauseType>(defaultClauseType)
  const [errors, setErrors] = useState<{ name?: string; body?: string }>({})

  const isEditing = Boolean(clause)

  useEffect(() => {
    if (clause) {
      setName(clause.name)
      setBody(clause.body)
      setClauseType(clause.clauseType || defaultClauseType)
    } else {
      setName('')
      setBody('')
      setClauseType(defaultClauseType)
    }
    setErrors({})
  }, [clause, defaultClauseType, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { name?: string; body?: string } = {}
    if (!name.trim()) newErrors.name = 'Clause name is required.'
    if (!body.trim()) newErrors.body = 'Clause body text is required.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSave(name.trim(), body.trim(), clauseType)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            {isEditing ? 'Edit Resolution Clause' : 'Create New Resolution Clause'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Update the details and standard legal phrasing for this clause template.'
              : 'Add a reusable clause template for BAC Resolutions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Clause Type Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="clause-type" className="text-xs font-medium">
              Clause Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={clauseType}
              onValueChange={(val) => setClauseType(val as ResolutionClauseType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="clause-type" className="text-xs h-9">
                <SelectValue placeholder="Select clause type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Whereas" className="text-xs font-medium">
                  WHEREAS Clause (Context & Premise)
                </SelectItem>
                <SelectItem value="NowTherefore" className="text-xs font-medium">
                  NOW, THEREFORE Clause (Transition)
                </SelectItem>
                <SelectItem value="Resolved" className="text-xs font-medium">
                  RESOLVED Clause (Action & Recommendation)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clause Title/Name */}
          <div className="space-y-1.5">
            <Label htmlFor="clause-name" className="text-xs font-medium">
              Clause Name / Heading <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clause-name"
              placeholder="e.g. WHEREAS, the APP was approved by HOPE..."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              disabled={isSubmitting}
              className="text-xs h-9"
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
          </div>

          {/* Clause Phrasing Body */}
          <div className="space-y-1.5">
            <Label htmlFor="clause-body" className="text-xs font-medium">
              Clause Legal Phrasing / Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="clause-body"
              placeholder="Enter the full text of the clause. You can use placeholders or legal standard terminology..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }))
              }}
              rows={5}
              disabled={isSubmitting}
              className="text-xs leading-relaxed"
            />
            {errors.body && <p className="text-[11px] text-destructive">{errors.body}</p>}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditing ? 'Save Changes' : 'Create Clause'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
