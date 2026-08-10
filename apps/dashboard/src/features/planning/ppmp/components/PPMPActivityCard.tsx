import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatCurrency } from '../lib/ppmpUtils'
import type {
  PPMPActivityBlock,
  PPMPActivity,
  PPMPIoEBlock,
  PPMPLineItem,
  Month,
} from '../types'
import { cn } from '@/lib/utils'

interface PPMPActivityCardProps {
  activity: PPMPActivityBlock | PPMPActivity
  isSelected?: boolean
  onSelect?: (id: string) => void
  className?: string
}

function isActivityBlock(
  a: PPMPActivityBlock | PPMPActivity,
): a is PPMPActivityBlock {
  return (a as PPMPActivityBlock).ioEBlocks !== undefined
}

export function PPMPActivityCard({
  activity,
  isSelected = false,
  onSelect,
  className = '',
}: PPMPActivityCardProps) {
  const [expanded, setExpanded] = useState(false)

  const amount = isActivityBlock(activity)
    ? activity.totalCost
    : (activity.totalAllocationAmount ?? 0)

  return (
    <div
      className={cn(
        'rounded-md border bg-white overflow-hidden',
        isSelected && 'ring-2 ring-primary/40',
        className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => onSelect?.(activity.id)}
          className="text-left truncate flex-1 mr-3"
        >
          <div className="text-sm font-medium text-foreground truncate">
            {activity.activityName ?? 'Untitled activity'}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {formatCurrency(amount)}
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((s) => !s)}
            className="p-1"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>

      {/* Condensed selected preview (shows when selected but not expanded) */}
      {isSelected && !expanded && (
        <div className="px-3 pb-2 text-sm text-muted-foreground">
          {isActivityBlock(activity) ? (
            <div>
              {activity.ioEBlocks.length} IoE block(s) ·{' '}
              {formatCurrency(activity.totalCost)}
            </div>
          ) : (
            <div>
              {activity.totalItems ?? 0} item(s) ·{' '}
              {formatCurrency(activity.totalAllocationAmount ?? 0)}
            </div>
          )}
        </div>
      )}

      {/* Expanded details (renders inline within left pane) */}
      {expanded && (
        <div className="border-t bg-muted/5 p-3 space-y-3">
          {isActivityBlock(activity) ? (
            activity.ioEBlocks.length > 0 ? (
              activity.ioEBlocks.map((block: PPMPIoEBlock) => (
                <div key={block.id} className="rounded-md border bg-white p-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">
                      {block.ioEName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(block.totalCost)}
                    </div>
                  </div>

                  {block.items && block.items.length > 0 && (
                    <ul className="mt-2 text-sm leading-snug list-disc list-inside">
                      {block.items.slice(0, 6).map((it: PPMPLineItem) => (
                        <li key={it.id} className="truncate">
                          {it.itemName} — {formatCurrency(it.estimatedBudget)}
                        </li>
                      ))}
                      {block.items.length > 6 && (
                        <li className="text-muted-foreground">
                          +{block.items.length - 6} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No IoE blocks available
              </div>
            )
          ) : (
            <div className="text-sm text-muted-foreground">
              Activity summary — {activity.totalItems ?? 0} item(s),{' '}
              {formatCurrency(activity.totalAllocationAmount ?? 0)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PPMPActivityCard
