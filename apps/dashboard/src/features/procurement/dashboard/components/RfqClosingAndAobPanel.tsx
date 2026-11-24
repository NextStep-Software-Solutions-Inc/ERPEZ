import { ClipboardList } from 'lucide-react'
import type { AobQueueItem, RfqStatusItem } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Props {
  rfqList: Array<RfqStatusItem>
  aobItems: Array<AobQueueItem>
  urgentCount: number
  isLoading?: boolean
}

// ── Urgency pill config ────────────────────────────────────────────────────

function getDaysPillConfig(daysRemaining: number): { label: string; barColor: string; pillColor: string } {
  if (daysRemaining < 0)
    return {
      label: `${Math.abs(daysRemaining)}d overdue`,
      barColor: '[&>div]:bg-red-500',
      pillColor: 'bg-red-100 text-red-700 border-red-200',
    }
  if (daysRemaining <= 3)
    return {
      label: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
      barColor: '[&>div]:bg-red-500',
      pillColor: 'bg-red-100 text-red-700 border-red-200',
    }
  if (daysRemaining <= 7)
    return {
      label: `${daysRemaining} days left`,
      barColor: '[&>div]:bg-amber-400',
      pillColor: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  return {
    label: `${daysRemaining} days left`,
    barColor: '[&>div]:bg-emerald-500',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
}

// ── RFQ row ────────────────────────────────────────────────────────────────

function RfqRow({ item }: { item: RfqStatusItem }) {
  const cfg = getDaysPillConfig(item.daysRemaining)
  const progress = Math.max(0, Math.min(100, 100 - (item.daysRemaining / 14) * 100))

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      {/* RFQ number */}
      <span className="text-[11px] font-bold text-blue-600 shrink-0 w-[94px]">
      {item.rfqNumber}
      </span>

      {/* Description (truncated) */}
      <span className="text-[11px] text-gray-500 flex-1 truncate min-w-0">
        {item.description}
      </span>

      {/* Urgency bar */}
      <div className="w-16 shrink-0">
        <Progress
          value={progress}
          className={cn('h-1.5', cfg.barColor)}
        />
      </div>

      {/* Days pill */}
      <Badge
        variant="outline"
        className={cn('text-[10px] font-bold border shrink-0 px-1.5 py-0', cfg.pillColor)}
      >
        {cfg.label}
      </Badge>
    </div>
  )
}

// ── AOB row ────────────────────────────────────────────────────────────────

const evalConfig = {
  technical: {
    label: 'Technical eval',
    className: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  financial: {
    label: 'Financial eval',
    className: 'bg-violet-100 text-violet-700 border-violet-300',
  },
}

function AobRow({ item }: { item: AobQueueItem }) {
  const cfg = evalConfig[item.evalType]
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <span className="text-[11px] font-bold text-gray-700">{item.aobNumber}</span>
        <span className="text-[11px] text-gray-500"> &mdash; {item.description}</span>
      </div>
      <Badge
        variant="outline"
        className={cn('text-[10px] font-semibold border shrink-0 px-1.5 py-0', cfg.className)}
      >
        {cfg.label}
      </Badge>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center py-2 border-b border-gray-100">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 flex-1 bg-gray-100 rounded animate-pulse" />
            <div className="h-1.5 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
        <div className="pt-2 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100">
              <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function RfqClosingAndAobPanel({ rfqList, aobItems, urgentCount, isLoading }: Props) {
  if (isLoading) return <Skeleton />

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-semibold">RFQ Closing Status &amp; AOB Queue</CardTitle>
          </div>
          {urgentCount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-0.5">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-0 pt-0">
        {/* RFQ list */}
        <div className="pb-2">
          {rfqList.map((item) => (
            <RfqRow key={item.id} item={item} />
          ))}
        </div>

        {/* AOB Section */}
        <div className="pt-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Abstract of Bids (AOB) evaluation queue
          </p>
          <div>
            {aobItems.map((item) => (
              <AobRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
