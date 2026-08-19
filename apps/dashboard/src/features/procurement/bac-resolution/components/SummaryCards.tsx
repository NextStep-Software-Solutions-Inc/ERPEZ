import { BacResolutionStatusBadge } from './index'
import type { MetricCard } from '../hooks/useBacResolutionService'
import type { BacResolutionInboxFilter } from '../types'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  metricCards: MetricCard[]
  activeFilter?: BacResolutionInboxFilter
  onSelectFilter?: (filter: BacResolutionInboxFilter) => void
}

export default function SummaryCards({
  metricCards,
  activeFilter = 'all',
  onSelectFilter,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {metricCards.map((item) => {
        const Icon = item.icon
        const filterKey = (item.key === 'summary' ? 'all' : item.key) as BacResolutionInboxFilter
        const isSelected = activeFilter === filterKey

        const getSubtext = () => {
          switch (item.key) {
            case 'draft':
              return 'Under Preparation'
            case 'for-approval':
              return 'Pending BAC Review'
            case 'returned':
              return 'Requires Revisions'
            case 'approved':
              return 'HOPE Approved'
            case 'summary':
            default:
              return 'Total Resolutions'
          }
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectFilter?.(filterKey)}
            className={cn(
              'group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-xs',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm'
                : 'border-default-200 bg-white hover:border-primary/40 hover:bg-default-50/70 hover:shadow-sm',
            )}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                  isSelected ? 'bg-primary text-white' : 'bg-default-100 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2 space-y-0.5">
              <p
                className={cn(
                  'text-2xl font-extrabold tracking-tight',
                  item.key === 'approved'
                    ? 'text-emerald-700'
                    : item.key === 'for-approval'
                      ? 'text-sky-700'
                      : item.key === 'returned'
                        ? 'text-rose-700'
                        : 'text-foreground',
                )}
              >
                {item.count}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {getSubtext()}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
