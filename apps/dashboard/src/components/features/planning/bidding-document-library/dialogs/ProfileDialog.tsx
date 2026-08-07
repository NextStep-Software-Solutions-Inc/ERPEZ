import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'
import type { MasterDoc, Profile } from '../types'

interface ProfileDialogProps {
  profile: Profile | null
  masterDocs: MasterDoc[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<Profile, 'id'>) => void
}

export function ProfileDialog({
  profile,
  masterDocs,
  open,
  onOpenChange,
  onSave,
}: ProfileDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [documentIds, setDocumentIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return

    setName(profile?.name ?? '')
    setDescription(profile?.description ?? '')
    setDocumentIds(profile?.documentIds ?? [])
  }, [open, profile])

  const handleToggleDocument = (docId: string) => {
    setDocumentIds((current) =>
      current.includes(docId)
        ? current.filter((id) => id !== docId)
        : [...current, docId],
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name,
      description,
      documentIds,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {profile
                ? 'Configure Profile Checklist Blueprint'
                : 'Create Reusable Profile'}
            </DialogTitle>
            <DialogDescription>
              Toggle the default legal requirements included when this profile
              is loaded.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="prof-name">Profile Name</Label>
              <Input
                id="prof-name"
                placeholder="e.g. Standard Goods (Public Bidding)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prof-desc">Description</Label>
              <Textarea
                id="prof-desc"
                placeholder="e.g. Baseline profile for general commodities."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              <Label>Bundled Master Documents</Label>
              <div className="rounded-md border p-3 bg-muted/10 space-y-2">
                {masterDocs.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-2.5 py-1">
                    <Checkbox
                      id={`prof-checkbox-${doc.id}`}
                      checked={documentIds.includes(doc.id)}
                      onCheckedChange={() => handleToggleDocument(doc.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={`prof-checkbox-${doc.id}`}
                        className="text-sm font-semibold cursor-pointer"
                      >
                        {doc.name}
                      </Label>
                      <div className="text-[10px] text-muted-foreground flex gap-2">
                        <span>Envelope {doc.envelope}</span>
                        {doc.templateFile && <span>- Template Attached</span>}
                      </div>
                    </div>
                  </div>
                ))}
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
            <Button type="submit">Save Profile Blueprint</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
