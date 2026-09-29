import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts'
import { AlertCircle, Clock, ShoppingCart } from 'lucide-react'
import type { PoFulfillmentData } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  data: PoFulfillmentData | null
  isLoading?: boolean
}



// Build concentric ring data: each segment is a percentage-of-full-circle arc
function buildRingData(percent: number, color: string) {
  return [
    { value: percent, color },
    { value: 100 - percent, color: '#f3f4f6' },
  ]
}

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mx-auto h-44 w-44 rounded-full bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PoFulfillmentDonut({ data, isLoading }: Props) {
  if (isLoading || !data) return <Skeleton />

  const { poCount = 0, segments = [], totalPOValue = 0, avgDeliveryDays = 0, overdueCount = 0, uacsBreakdown = [] } = data

  const defaultSegments: Array<PoFulfillmentSegment> = [
    { name: 'Issued', value: poCount || 1, color: '#3b82f6' },
    { name: 'Accepted', value: Math.round((poCount || 1) * 0.75), color: '#8b5cf6' },
    { name: 'Delivered', value: Math.round((poCount || 1) * 0.5), color: '#10b981' },
  ]
  const activeSegments = segments.length > 0 ? segments : defaultSegments

  // Build percentage-based rates for legend (relative to issued = 100%)
  const issuedCount = activeSegments.find((s) => s.name === 'Issued')?.value ?? (poCount || 1)
  const rates = activeSegments.map((s) => ({
    ...s,
    pct: issuedCount > 0 ? Math.round((s.value / issuedCount) * 100) : 0,
  }))

  // Concentric rings (outer → inner): Issued, Accepted, Delivered
  const rings = [
    { ...(rates[0] || { name: 'Issued', color: '#3b82f6', pct: 100 }), innerRadius: 64, outerRadius: 78 },
    { ...(rates[1] || { name: 'Accepted', color: '#8b5cf6', pct: 75 }), innerRadius: 46, outerRadius: 60 },
    { ...(rates[2] || { name: 'Delivered', color: '#10b981', pct: 50 }), innerRadius: 28, outerRadius: 42 },
  ]

  const maxUacs = uacsBreakdown.length > 0 ? Math.max(...uacsBreakdown.map((u) => u.value), 1) : 1

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-semibold">Purchase Order Fulfillment</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-gray-600 border-gray-300">
            {poCount} POs
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Concentric donut ────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[170px] w-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {rings.map((ring, i) => (
                  <Pie
                    key={i}
                    data={buildRingData(ring.pct, ring.color)}
                    cx="50%"
                    cy="50%"
                    innerRadius={ring.innerRadius}
                    outerRadius={ring.outerRadius}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    dataKey="value"
                    strokeWidth={0}
                    isAnimationActive
                  >
                    <Cell fill={ring.color} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                ))}
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900 leading-none">{poCount}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">POs</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {rates.map((seg) => (
              <div key={seg.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[11px] text-gray-600 font-medium">
                  {seg.name} {seg.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
            <span className="text-sm font-bold text-emerald-700">{formatCurrencyAbbr(totalPOValue)}</span>
            <span className="text-[10px] text-emerald-500 mt-0.5 text-center">Total PO value</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-2.5 border border-blue-100">
            <div className="flex items-center gap-0.5">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-sm font-bold text-blue-700">{avgDeliveryDays}d</span>
            </div>
            <span className="text-[10px] text-blue-500 mt-0.5 text-center">Avg delivery</span>
          </div>
          <div className={cn(
            'flex flex-col items-center rounded-xl p-2.5 border',
            overdueCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100',
          )}>
            <div className="flex items-center gap-0.5">
              <AlertCircle className={cn('h-3 w-3', overdueCount > 0 ? 'text-red-500' : 'text-gray-400')} />
              <span className={cn('text-sm font-bold', overdueCount > 0 ? 'text-red-700' : 'text-gray-500')}>
                {overdueCount}
              </span>
            </div>
            <span className={cn('text-[10px] mt-0.5 text-center', overdueCount > 0 ? 'text-red-500' : 'text-gray-400')}>
              Overdue POs
            </span>
          </div>
        </div>

        {/* ── UACS breakdown ──────────────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            PO value by object class (UACS)
          </p>
          {uacsBreakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{item.label}</span>
                <span className="text-xs font-bold text-gray-700">{formatCurrencyAbbr(item.value)}</span>
              </div>
              <Progress
                value={Math.round((item.value / maxUacs) * 100)}
                className="h-1.5"
                style={{ ['--progress-fill' as string]: item.color }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
