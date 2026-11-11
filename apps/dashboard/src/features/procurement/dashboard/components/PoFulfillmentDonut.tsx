import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AlertCircle, Clock, ShoppingCart } from 'lucide-react'
import type { PoFulfillmentData, PoFulfillmentSegment } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartTooltipRow, ChartTooltipShell, useChartTheme } from '@/components/ui/chart-tooltip'
import { cn } from '@/lib/utils'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  data: PoFulfillmentData | null
  isLoading?: boolean
}

// Build concentric ring data: each segment is a percentage-of-full-circle arc
function buildRingData(
  name: string,
  count: number,
  percent: number,
  color: string,
  trackColor: string,
) {
  return [
    { name, count, pct: percent, value: percent, color, isTrack: false },
    { name, count, pct: percent, value: Math.max(0, 100 - percent), color: trackColor, isTrack: true },
  ]
}

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mx-auto h-44 w-44 rounded-full bg-muted/70 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/70 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/70 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PoFulfillmentDonut({ data, isLoading }: Props) {
  const { isDark } = useChartTheme()

  if (isLoading || !data) return <Skeleton />

  const trackColor = isDark ? '#1e293b' : '#f1f5f9'
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
    { ...(rates[0] || { name: 'Issued', value: poCount, color: '#3b82f6', pct: 100 }), innerRadius: 64, outerRadius: 78 },
    { ...(rates[1] || { name: 'Accepted', value: 0, color: '#8b5cf6', pct: 75 }), innerRadius: 46, outerRadius: 60 },
    { ...(rates[2] || { name: 'Delivered', value: 0, color: '#10b981', pct: 50 }), innerRadius: 28, outerRadius: 42 },
  ]

  const maxUacs = uacsBreakdown.length > 0 ? Math.max(...uacsBreakdown.map((u) => u.value), 1) : 1

  return (
    <Card className="shadow-sm h-full border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-foreground">Purchase Order Fulfillment</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border">
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
                    data={buildRingData(ring.name, ring.value, ring.pct, ring.color, trackColor)}
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
                    <Cell fill={trackColor} />
                  </Pie>
                ))}
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <ChartTooltipShell className="min-w-[155px]">
                          <div className="font-semibold text-popover-foreground pb-1 mb-1 border-b border-border/60">
                            {item.name} Stage
                          </div>
                          <ChartTooltipRow
                            color={rings.find((r) => r.name === item.name)?.color}
                            label="Fulfillment"
                            value={`${item.count} POs (${item.pct}%)`}
                          />
                        </ChartTooltipShell>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-foreground leading-none">{poCount}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">POs</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {rates.map((seg) => (
              <div key={seg.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {seg.name} <span className="text-foreground font-semibold">{seg.pct}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl p-2.5 border border-emerald-500/20">
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatCurrencyAbbr(totalPOValue)}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 text-center">Total PO value</span>
          </div>
          <div className="flex flex-col items-center bg-blue-500/10 dark:bg-blue-500/15 rounded-xl p-2.5 border border-blue-500/20">
            <div className="flex items-center gap-0.5">
              <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{avgDeliveryDays}d</span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 text-center">Avg delivery</span>
          </div>
          <div className={cn(
            'flex flex-col items-center rounded-xl p-2.5 border',
            overdueCount > 0
              ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/20'
              : 'bg-muted/60 border-border',
          )}>
            <div className="flex items-center gap-0.5">
              <AlertCircle className={cn('h-3 w-3', overdueCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-bold', overdueCount > 0 ? 'text-red-700 dark:text-red-300' : 'text-foreground')}>
                {overdueCount}
              </span>
            </div>
            <span className={cn('text-[10px] mt-0.5 text-center', overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}>
              Overdue POs
            </span>
          </div>
        </div>

        {/* ── UACS breakdown ──────────────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            PO value by object class (UACS)
          </p>
          {uacsBreakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-bold text-foreground">{formatCurrencyAbbr(item.value)}</span>
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
