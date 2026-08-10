import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ConsolidatedPrLink } from '../types'

interface ConsolidatedPrTableProps {
  items: ConsolidatedPrLink[]
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (nextIds: string[]) => void
  onViewDetails?: (item: ConsolidatedPrLink) => void
  emptyMessage?: string
}

export function ConsolidatedPrTable({
  items,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onViewDetails,
  emptyMessage = 'No linked Consolidated PRs yet.',
}: ConsolidatedPrTableProps) {
  const handleToggle = (id: string) => {
    if (!onSelectionChange) return

    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id]

    onSelectionChange(nextIds)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-[360px] rounded-lg border border-default-200">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background/95 backdrop-blur border-b border-default-200">
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            {selectable && <th className="px-4 py-3 w-12" />}
            <th className="px-4 py-3">PR Number</th>
            <th className="px-4 py-3">Project / End User</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3 text-right">Amount</th>
            {onViewDetails && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={cn(
                'border-b border-default-100 transition-colors',
                (selectable || onViewDetails) && 'hover:bg-default-50',
                selectable && 'cursor-pointer',
                selectedIds.includes(item.id) && 'bg-primary/5',
              )}
              onClick={() => {
                if (selectable) {
                  handleToggle(item.id)
                  return
                }

                if (onViewDetails) {
                  onViewDetails(item)
                }
              }}
            >
              {selectable && (
                <td className="px-4 py-3 align-top">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => handleToggle(item.id)}
                  />
                </td>
              )}
              <td className="px-4 py-3 align-top font-medium">
                {item.prNumber}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="space-y-1">
                  <p className="font-medium leading-snug">{item.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.endUser} · {item.description}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 align-top">{item.modeOfProcurement}</td>
              <td className="px-4 py-3 align-top text-right font-medium">
                ₱{(item.amount ?? 0).toLocaleString('en-PH')}
              </td>
              {onViewDetails && (
                <td className="px-4 py-3 align-top text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={(event) => {
                      event.stopPropagation()
                      onViewDetails(item)
                    }}
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
