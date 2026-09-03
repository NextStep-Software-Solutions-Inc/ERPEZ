import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PROCUREMENT_CATEGORIES } from '../types'
import type { FormEvent } from 'react'
import type { MasterDoc, Profile } from '../types'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface ProfileFormData {
  name: string
  description: string
  procurementCategory: string
  documentIds: Array<string>
}

interface ProfileDialogProps {
  profile: Profile | null
  masterDocs: Array<MasterDoc>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ProfileFormData) => void
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
  const [procurementCategory, setProcurementCategory] = useState('')
  const [documentIds, setDocumentIds] = useState<Array<string>>([])
  const [envelopeFilter, setEnvelopeFilter] = useState<'all' | '1' | '2'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) return

    setName(profile?.name ?? '')
    setDescription(profile?.description ?? '')
    setProcurementCategory(profile?.procurementCategory ?? '')
    setDocumentIds(profile?.documentIds ?? [])
    setEnvelopeFilter('all')
    setSearchQuery('')
  }, [open, profile])

  const handleToggleDocument = (docId: string) => {
    setDocumentIds((current) =>
      current.includes(docId)
        ? current.filter((id) => id !== docId)
        : [...current, docId],
    )
  }

  const filteredDocs = useMemo(() => {
    return masterDocs.filter((doc) => {
      const matchesEnvelope =
        envelopeFilter === 'all' || doc.envelope.toString() === envelopeFilter
      const matchesSearch =
        !searchQuery.trim() ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesEnvelope && matchesSearch
    })
  }, [masterDocs, envelopeFilter, searchQuery])

  const allFilteredSelected =
    filteredDocs.length > 0 &&
    filteredDocs.every((doc) => documentIds.includes(doc.id))

  const handleToggleAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredDocs.map((d) => d.id))
      setDocumentIds((prev) => prev.filter((id) => !filteredIds.has(id)))
    } else {
      const toAdd = filteredDocs
        .map((d) => d.id)
        .filter((id) => !documentIds.includes(id))
      setDocumentIds((prev) => [...prev, ...toAdd])
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!procurementCategory.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim(),
      procurementCategory,
      documentIds,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-bold">
              {profile
                ? 'Configure Profile Checklist Blueprint'
                : 'Create Reusable Profile'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure baseline document requirements and bundled templates for this procurement category blueprint.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 flex-1 overflow-y-auto pr-1">
            {/* Top row: Profile Name & Procurement Category side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="prof-name" className="text-xs font-semibold">
                  Profile Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prof-name"
                  placeholder="e.g. Standard Competitive Bidding — Goods"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prof-category" className="text-xs font-semibold">
                  Procurement Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={procurementCategory}
                  onValueChange={setProcurementCategory}
                  required
                >
                  <SelectTrigger id="prof-category" className="w-full h-9">
                    <SelectValue placeholder="Select procurement category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCUREMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="prof-desc" className="text-xs font-semibold">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="prof-desc"
                placeholder="e.g. Baseline profile for goods and commodity competitive bidding requirements."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Bundled Master Documents Section */}
            <div className="space-y-3 pt-1">
              {/* Header row: Title, badge counter & bulk action button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Bundled Master Documents
                  </Label>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                    {documentIds.length} of {masterDocs.length} selected
                  </span>
                </div>

                {/* Bulk Select / Deselect */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 font-medium"
                  onClick={handleToggleAllFiltered}
                  disabled={filteredDocs.length === 0}
                >
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Dedicated Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-lg bg-muted/30 border">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search master documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>

                {/* Segmented Filter Buttons */}
                <div className="inline-flex items-center gap-1 p-1 bg-background border rounded-md shadow-2xs">
                  <Button
                    type="button"
                    size="sm"
                    variant={envelopeFilter === 'all' ? 'soft' : 'ghost'}
                    className={cn(
                      'h-6 text-xs px-2.5 rounded-sm transition-colors',
                      envelopeFilter === 'all'
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setEnvelopeFilter('all')}
                  >
                    All ({masterDocs.length})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={envelopeFilter === '1' ? 'soft' : 'ghost'}
                    className={cn(
                      'h-6 text-xs px-2.5 rounded-sm transition-colors',
                      envelopeFilter === '1'
                        ? 'bg-info text-info-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setEnvelopeFilter('1')}
                  >
                    Technical ({masterDocs.filter((d) => d.envelope === 1).length})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={envelopeFilter === '2' ? 'soft' : 'ghost'}
                    className={cn(
                      'h-6 text-xs px-2.5 rounded-sm transition-colors',
                      envelopeFilter === '2'
                        ? 'bg-warning text-warning-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setEnvelopeFilter('2')}
                  >
                    Financial ({masterDocs.filter((d) => d.envelope === 2).length})
                  </Button>
                </div>
              </div>

              {/* Document items 2-column grid */}
              <div className="rounded-lg border p-3 bg-muted/10 max-h-[360px] overflow-y-auto">
                {filteredDocs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No documents match the current filter or search criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredDocs.map((doc) => {
                      const isSelected = documentIds.includes(doc.id)
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleToggleDocument(doc.id)}
                          className={cn(
                            'flex items-start gap-2.5 p-2.5 rounded-md border transition-all cursor-pointer select-none text-left',
                            isSelected
                              ? 'bg-primary/5 border-primary/40 shadow-2xs'
                              : 'bg-card hover:bg-muted/40 border-border/60',
                          )}
                        >
                          <Checkbox
                            id={`prof-checkbox-${doc.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleDocument(doc.id)}
                            className="mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <Label
                              htmlFor={`prof-checkbox-${doc.id}`}
                              className="text-xs font-semibold cursor-pointer line-clamp-1 block text-foreground"
                            >
                              {doc.name}
                            </Label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] py-0 px-1.5 font-normal',
                                  doc.envelope === 1
                                    ? 'border-info/30 text-info bg-info/5'
                                    : 'border-warning/30 text-warning bg-warning/5',
                                )}
                              >
                                {doc.envelope === 1 ? 'Env 1: Technical' : 'Env 2: Financial'}
                              </Badge>
                              {doc.templateFile ? (
                                <span className="text-[10px] text-muted-foreground truncate">
                                  Template attached
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t mt-2">
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
