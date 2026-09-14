import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  CheckCheck,
  RotateCcw,
  Plus,
  FileText,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WhereasClauseTemplate } from '../types'
import type { WhereasClauses } from '../handlers/createBacResolutionRequest'

interface WhereasClausePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: WhereasClauseTemplate[]
  initialSelected: WhereasClauses[]
  onApply: (items: WhereasClauses[]) => void
  onCreateCustom?: () => void
  isPending?: boolean
}

export function WhereasClausePickerModal({
  open,
  onOpenChange,
  templates,
  initialSelected,
  onApply,
  onCreateCustom,
  isPending = false,
}: WhereasClausePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [draftItems, setDraftItems] = useState<WhereasClauses[]>([])

  useEffect(() => {
    if (open) {
      setDraftItems(initialSelected || [])
      setSearchTerm('')
    }
  }, [open, initialSelected])

  const selectedIds = useMemo(
    () => draftItems.map((c) => c.whereasClauseId),
    [draftItems],
  )

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates
    const term = searchTerm.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.body.toLowerCase().includes(term),
    )
  }, [templates, searchTerm])

  const toggleTemplate = (templateId: string) => {
    if (selectedIds.includes(templateId)) {
      const nextItems = draftItems
        .filter((c) => c.whereasClauseId !== templateId)
        .map((c, idx) => ({ whereasClauseId: c.whereasClauseId, order: idx }))
      setDraftItems(nextItems)
    } else {
      const nextItems = [
        ...draftItems,
        { whereasClauseId: templateId, order: draftItems.length },
      ]
      setDraftItems(nextItems)
    }
  }

  const handleSelectAll = () => {
    const allItems = templates.map((t, idx) => ({
      whereasClauseId: t.id,
      order: idx,
    }))
    setDraftItems(allItems)
  }

  const handleClearAll = () => {
    setDraftItems([])
  }

  const handleRemoveDraftItem = (templateId: string) => {
    const nextItems = draftItems
      .filter((c) => c.whereasClauseId !== templateId)
      .map((c, idx) => ({ whereasClauseId: c.whereasClauseId, order: idx }))
    setDraftItems(nextItems)
  }

  const handleApply = () => {
    onApply(draftItems)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-w-6xl w-[95vw] h-[82vh] max-h-[850px] p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-default-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-default-900">
                  Select WHEREAS Clause Templates
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse repository templates and preview your selected sequence.
                </p>
              </div>
            </div>
            {onCreateCustom && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onCreateCustom()
                }}
                className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 mr-6"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Custom Template
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-12 flex-1 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-default-200">
          {/* Left Column: Template Checklist */}
          <div className="md:col-span-7 p-4 flex flex-col space-y-3 min-h-0 bg-white">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search templates by name or text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs bg-default-50 border-default-200"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={templates.length === 0}
                  className="h-8 text-xs gap-1 text-default-700 hover:text-primary"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={draftItems.length === 0}
                  className="h-8 text-xs gap-1 text-default-600 hover:text-destructive"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              {isPending ? (
                <div className="flex flex-col items-center justify-center p-12 text-xs text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  Loading WHEREAS templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-xs text-muted-foreground">
                  {searchTerm
                    ? 'No templates match your search.'
                    : 'No WHEREAS templates available.'}
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isChecked = selectedIds.includes(template.id)
                  return (
                    <div
                      key={template.id}
                      onClick={() => toggleTemplate(template.id)}
                      className={cn(
                        'group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-150',
                        isChecked
                          ? 'border-primary/50 border-l-4 border-l-primary bg-primary/5 shadow-xs'
                          : 'border-default-200 bg-white hover:border-default-300 hover:bg-default-50/50',
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleTemplate(template.id)}
                        className="mt-0.5 pointer-events-none"
                      />
                      <div className="flex-1 space-y-1 text-xs min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-default-900 group-hover:text-primary transition-colors truncate">
                            {template.name}
                          </span>
                          {isChecked && (
                            <Badge color="default" variant="soft" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-serif text-[11.5px] line-clamp-2">
                          {template.body}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Selection Preview */}
          <div className="md:col-span-5 p-4 flex flex-col space-y-3 min-h-0 bg-default-50/60">
            <div className="flex items-center justify-between border-b border-default-200 pb-2">
              <div className="flex items-center gap-2">
                <Badge color="default" variant="soft" className="px-2 py-0.5 text-xs font-bold gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {draftItems.length}
                </Badge>
                <h5 className="font-bold text-xs text-default-900">
                  Selected Sequence
                </h5>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Live order
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              {draftItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground h-full border border-dashed border-default-200 rounded-lg bg-white">
                  <FileText className="h-8 w-8 text-default-300 mb-2 stroke-[1.5]" />
                  <p className="font-medium text-default-700 mb-1">No clauses selected</p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px]">
                    Check clause templates on the left to add them to your resolution sequence.
                  </p>
                </div>
              ) : (
                draftItems.map((item, index) => {
                  const template = templates.find((t) => t.id === item.whereasClauseId)
                  if (!template) return null
                  return (
                    <div
                      key={item.whereasClauseId}
                      className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-white p-2.5 text-xs shadow-2xs group"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[10px]">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-default-900 truncate">
                          {template.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate font-serif">
                          {template.body}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDraftItem(item.whereasClauseId)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 bg-white border-t border-default-200 flex items-center justify-between sm:justify-between gap-2">
          <span className="text-xs text-muted-foreground pl-2">
            {draftItems.length} clause{draftItems.length !== 1 ? 's' : ''} ready to apply
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="px-5 font-semibold"
            >
              Apply Selection ({draftItems.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
