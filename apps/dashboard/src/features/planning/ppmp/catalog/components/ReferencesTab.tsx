/**
 * ReferencesTab
 * Lists PPMP documents that reference this catalog item.
 */

import { FileText, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useReferencesTab } from '../hooks/useDetailPanelTabs'
import type { PpmpReference } from '../types'

const STATUS_STYLES: Record<PpmpReference['status'], string> = {
  draft: 'bg-gray-50 text-gray-500 border-gray-200',
  pending_review:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
  approved:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  submitted:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
}

const STATUS_LABELS: Record<PpmpReference['status'], string> = {
  draft: 'Draft',
  pending_review: 'For Review',
  approved: 'Approved',
  submitted: 'Submitted',
}

export function ReferencesTab() {
  const { data: references, isLoading } = useReferencesTab()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border border-border"
          >
            <Skeleton className="h-8 w-8 rounded shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!references || references.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
        <FileText className="h-8 w-8 opacity-30" />
        <p className="text-sm italic">
          This item is not referenced in any PPMP.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <p className="text-xs text-muted-foreground mb-1">
        {references.length} PPMP document{references.length !== 1 ? 's' : ''}{' '}
        reference this item.
      </p>

      {references.map((ref) => (
        <div
          key={ref.ppmpId}
          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
        >
          {/* Icon */}
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium">
                {ref.ppmpCode}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] capitalize',
                  STATUS_STYLES[ref.status],
                )}
              >
                {STATUS_LABELS[ref.status]}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {ref.ppmpTitle}
            </span>
            <span className="text-[10px] text-muted-foreground">
              FY {ref.fiscalYear}
            </span>
          </div>

          {/* External link placeholder */}
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
        </div>
      ))}
    </div>
  )
}
