import { BacResolutionStatusBadge } from './index'
import type { MetricCard } from '../hooks/useBacResolutionService'

interface SummaryCardsProps {
  metricCards: MetricCard[]
}

export default function SummaryCards({ metricCards }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {metricCards.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.key}
            className={`rounded-lg border p-2 transition-all duration-150 ${item.containerClass}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className={`text-xl font-semibold ${item.valueClass}`}>
                  {item.count}
                </p>
              </div>
              <div className="rounded-md bg-background p-1 shadow-sm ring-1 ring-border/40">
                <Icon className={`h-4 w-4 ${item.iconClass}`} />
              </div>
            </div>

            {item.summary ? (
              <div className="mt-2 space-y-1 rounded-lg border border-dashed border-default-200 bg-background/70 p-2 text-xs">
                {item.rows?.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2">
                <BacResolutionStatusBadge
                  status={
                    item.key as
                      | 'draft'
                      | 'for-approval'
                      | 'returned'
                      | 'approved'
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
