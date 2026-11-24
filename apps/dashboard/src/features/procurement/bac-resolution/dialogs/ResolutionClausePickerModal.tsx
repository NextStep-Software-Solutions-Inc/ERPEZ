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
import type { ResolutionClause, ResolutionClauseType } from '../types'

interface ResolutionClauseItemSelection {
  resolutionClauseId: string
  order: number
}

interface ResolutionClausePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clauseType: ResolutionClauseType
  templates: ResolutionClause[]
  initialSelected: ResolutionClauseItemSelection[]
  onApply: (items: ResolutionClauseItemSelection[]) => void
  onCreateCustom?: () => void
  isPending?: boolean
}

export function normalizeClauseType(type?: string | null): ResolutionClauseType {
  if (!type) return 'Whereas'
  const cleaned = type.toLowerCase().replace(/[^a-z]/g, '')
  if (cleaned.includes('now') || cleaned.includes('therefore')) {
    return 'NowTherefore'
  }
  if (cleaned.includes('resolved') || cleaned.includes('resolve')) {
    return 'Resolved'
  }
  return 'Whereas'
}

export function ResolutionClausePickerModal({
  open,
  onOpenChange,
  clauseType,
  templates,
  initialSelected,
  onApply,
  onCreateCustom,
  isPending = false,
}: ResolutionClausePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [draftItems, setDraftItems] = useState<ResolutionClauseItemSelection[]>([])

  useEffect(() => {
    if (open) {
      setDraftItems(
        (initialSelected || []).filter((c) => Boolean(c && c.resolutionClauseId)),
      )
      setSearchTerm('')
    }
  }, [open, initialSelected])

  const selectedIds = useMemo(
    () => draftItems.map((c) => c.resolutionClauseId),
    [draftItems],
  )

  const targetType = normalizeClauseType(clauseType)

  // Filter templates strictly by clauseType and ensure they have a valid id
  const typeFilteredTemplates = useMemo(() => {
    return templates.filter(
      (t) => Boolean(t && t.id) && normalizeClauseType(t.clauseType) === targetType,
    )
  }, [templates, targetType])

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return typeFilteredTemplates
    const term = searchTerm.toLowerCase()
    return typeFilteredTemplates.filter(
      (t) =>
        t.name?.toLowerCase().includes(term) ||
        t.body?.toLowerCase().includes(term),
    )
  }, [typeFilteredTemplates, searchTerm])

  const toggleTemplate = (templateId: string) => {
    if (!templateId) return
    if (selectedIds.includes(templateId)) {
      const nextItems = draftItems
        .filter((c) => c.resolutionClauseId !== templateId)
        .map((c, idx) => ({ resolutionClauseId: c.resolutionClauseId, order: idx }))
      setDraftItems(nextItems)
    } else {
      const nextItems = [
        ...draftItems,
        { resolutionClauseId: templateId, order: draftItems.length },
      ]
      setDraftItems(nextItems)
    }
  }

  const handleSelectAll = () => {
    const allItems = typeFilteredTemplates.map((t, idx) => ({
      resolutionClauseId: t.id,
      order: idx,
    }))
    setDraftItems(allItems)
  }

  const handleClearAll = () => {
    setDraftItems([])
  }

  const handleRemoveDraftItem = (templateId: string) => {
    const nextItems = draftItems
      .filter((c) => c.resolutionClauseId !== templateId)
      .map((c, idx) => ({ resolutionClauseId: c.resolutionClauseId, order: idx }))
    setDraftItems(nextItems)
  }

  const handleApply = () => {
    onApply(draftItems)
    onOpenChange(false)
  }

  const typeLabel =
    clauseType === 'Whereas'
      ? 'WHEREAS'
      : clauseType === 'NowTherefore'
      ? 'NOW, THEREFORE'
      : 'RESOLVED'

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
                  Select {typeLabel} Clause Templates
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
                  placeholder={`Search ${typeLabel} templates...`}
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
                  disabled={typeFilteredTemplates.length === 0}
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
                  Loading {typeLabel} templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-xs text-muted-foreground">
                  {searchTerm
                    ? 'No templates match your search.'
                    : `No ${typeLabel} templates available.`}
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isChecked = selectedIds.includes(template.id)
                  return (
                    <div
                      key={template.id}
                      onClick={() => toggleTemplate(template.id)}
                      className={cn(
                        'group flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer select-none',
                        isChecked
                          ? 'border-primary/40 bg-primary/5 shadow-xs'
                          : 'border-default-200 hover:border-default-300 hover:bg-default-50/60',
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleTemplate(template.id)}
                        className="mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={cn(
                              'text-xs font-semibold leading-none',
                              isChecked ? 'text-primary' : 'text-default-900',
                            )}
                          >
                            {template.name}
                          </h4>
                          {isChecked && (
                            <Badge
                              variant="outline"
                              className="h-4 text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0 font-medium px-1.5"
                            >
                              Seq #{draftItems.findIndex((c) => c.resolutionClauseId === template.id) + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {template.body}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Ordered Sequence Preview */}
          <div className="md:col-span-5 p-4 flex flex-col space-y-3 min-h-0 bg-default-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-default-900">
                Selected Sequence
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold bg-default-200 text-default-700"
              >
                {draftItems.length} selected
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              {draftItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground border border-dashed border-default-200 rounded-lg bg-white">
                  <CheckCircle2 className="h-7 w-7 text-muted-foreground/30 mb-2" />
                  <p className="font-medium text-default-700">No clauses selected</p>
                  <p className="text-[11px] mt-0.5 text-muted-foreground">
                    Check items from the list to build your sequence.
                  </p>
                </div>
              ) : (
                draftItems.map((item, index) => {
                  const template = templates.find((t) => t.id === item.resolutionClauseId)
                  return (
                    <div
                      key={item.resolutionClauseId || index}
                      className="group flex items-start gap-2.5 p-2.5 rounded-lg border border-default-200 bg-white shadow-xs text-left"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-default-900 truncate">
                            {template?.name || (template?.body ? 'Clause' : 'Selected Clause')}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDraftItem(item.resolutionClauseId)}
                            className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                          {template?.body || 'Loading clause content...'}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 border-t border-default-200 bg-white flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {draftItems.length} template{draftItems.length !== 1 ? 's' : ''} ready to apply
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs h-8 gap-1.5"
            >
              Apply Selection ({draftItems.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
