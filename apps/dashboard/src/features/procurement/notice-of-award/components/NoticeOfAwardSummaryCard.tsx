import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NoticeOfAwardStatusBadge } from './NoticeOfAwardStatusBadge'
import type { NoticeOfAwardStatus } from '../types'

type NoticeOfAwardSummaryRow = {
  label: string
  value: string | number
}

type NoticeOfAwardSummaryCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  containerClassName: string
  iconClassName: string
  valueClassName: string
  status?: NoticeOfAwardStatus
  summary?: boolean
  rows?: NoticeOfAwardSummaryRow[]
}

export function NoticeOfAwardSummaryCard({
  title,
  value,
  icon: Icon,
  containerClassName,
  iconClassName,
  valueClassName,
  status,
  summary = false,
  rows,
}: NoticeOfAwardSummaryCardProps) {
  return (
    <Card
      className={`border p-2 transition-all duration-150 ${containerClassName}`}
    >
      <CardContent className="p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className={`text-xl font-semibold ${valueClassName}`}>{value}</p>
          </div>
          <div className="rounded-md bg-background p-1 shadow-sm ring-1 ring-border/40">
            <Icon className={`h-4 w-4 ${iconClassName}`} />
          </div>
        </div>

        {summary ? (
          <div className="mt-2 space-y-1 rounded-lg border border-dashed border-default-200 bg-background/70 p-2 text-xs">
            {rows?.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            {status ? <NoticeOfAwardStatusBadge status={status} /> : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
