import { useMemo, useState } from 'react'
import { Eye, FileCheck, FileText, Files, Search } from 'lucide-react'
import type { MasterDoc, Profile } from '../types'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

interface ProfileDocumentsDialogProps {
  profile: Profile | null
  masterDocs: Array<MasterDoc>
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewTemplate: (doc: MasterDoc) => void
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function getTemplateDisplayName(url?: string): string {
  if (!url) return ''
  try {
    const decoded = decodeURIComponent(url)
    const lastSegment = decoded.split('/').pop() ?? url
    if (UUID_REGEX.test(lastSegment)) return 'Uploaded Template'
    const underscoreIndex = lastSegment.indexOf('_')
    if (underscoreIndex !== -1) return lastSegment.slice(underscoreIndex + 1)
    return lastSegment
  } catch {
    return url
  }
}

export function ProfileDocumentsDialog({
  profile,
  masterDocs,
  open,
  onOpenChange,
  onViewTemplate,
}: ProfileDocumentsDialogProps) {
  const [filter, setFilter] = useState<'all' | '1' | '2'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const includedDocs = useMemo(() => {
    return (
      profile?.documentIds
        .map((docId) => masterDocs.find((doc) => doc.id === docId))
        .filter((doc): doc is MasterDoc => Boolean(doc)) ?? []
    )
  }, [profile, masterDocs])

  const technicalDocs = useMemo(
    () => includedDocs.filter((doc) => doc.envelope === 1),
    [includedDocs],
  )
  const financialDocs = useMemo(
    () => includedDocs.filter((doc) => doc.envelope === 2),
    [includedDocs],
  )

  const displayedDocs = useMemo(() => {
    return includedDocs.filter((doc) => {
      const matchesFilter =
        filter === 'all' || doc.envelope.toString() === filter
      const matchesSearch =
        !searchQuery.trim() ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesFilter && matchesSearch
    })
  }, [includedDocs, filter, searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-6">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {profile?.name ?? 'Profile Blueprint Documents'}
                </DialogTitle>
                {profile?.procurementCategory && (
                  <Badge variant="secondary" className="text-xs font-semibold py-0.5 px-2">
                    {profile.procurementCategory}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Review the master documents, envelope assignments, and attached fillable templates bundled into this profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
          {/* Executive Metric Cards */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-2xs uppercase font-bold tracking-wider text-muted-foreground">
                  Total Documents
                </div>
                <div className="mt-1 text-2xl font-bold text-foreground">
                  {includedDocs.length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                <Files className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="rounded-xl border border-info/25 bg-info/5 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-2xs uppercase font-bold tracking-wider text-info">
                  Envelope 1: Technical
                </div>
                <div className="mt-1 text-2xl font-bold text-info">
                  {technicalDocs.length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-info" />
              </div>
            </div>

            <div className="rounded-xl border border-warning/25 bg-warning/5 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-2xs uppercase font-bold tracking-wider text-warning">
                  Envelope 2: Financial
                </div>
                <div className="mt-1 text-2xl font-bold text-warning">
                  {financialDocs.length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-lg bg-muted/30 border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search included documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-background border rounded-md shadow-2xs">
              <Button
                type="button"
                size="sm"
                variant={filter === 'all' ? 'soft' : 'ghost'}
                className={cn(
                  'h-6 text-xs px-2.5 rounded-sm transition-colors',
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setFilter('all')}
              >
                All ({includedDocs.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === '1' ? 'soft' : 'ghost'}
                className={cn(
                  'h-6 text-xs px-2.5 rounded-sm transition-colors',
                  filter === '1'
                    ? 'bg-info text-info-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setFilter('1')}
              >
                Technical ({technicalDocs.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === '2' ? 'soft' : 'ghost'}
                className={cn(
                  'h-6 text-xs px-2.5 rounded-sm transition-colors',
                  filter === '2'
                    ? 'bg-warning text-warning-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setFilter('2')}
              >
                Financial ({financialDocs.length})
              </Button>
            </div>
          </div>

          {/* Documents List */}
          <div className="rounded-xl border bg-muted/10 p-3 max-h-[360px] overflow-y-auto space-y-2">
            {displayedDocs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                <Files className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-foreground/80">No documents found</p>
                <p className="text-2xs text-muted-foreground mt-0.5">
                  No documents match the active filter or search criteria.
                </p>
              </div>
            ) : (
              displayedDocs.map((doc) => {
                const displayName = getTemplateDisplayName(doc.templateFile)
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all duration-150 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="font-semibold text-sm text-foreground">
                        {doc.name}
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {doc.description || 'Standard requirement specification.'}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 flex-wrap justify-end">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-semibold py-0.5 px-2',
                          doc.envelope === 1
                            ? 'bg-info/10 text-info border-info/30'
                            : 'bg-warning/10 text-warning border-warning/30',
                        )}
                      >
                        {doc.envelope === 1 ? 'Env 1: Technical' : 'Env 2: Financial'}
                      </Badge>

                      {doc.templateFile ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title={doc.templateFile}
                          className="h-7 gap-1.5 rounded-md border-primary/25 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors"
                          onClick={() => onViewTemplate(doc)}
                        >
                          <Eye className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {displayName}
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t mt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
