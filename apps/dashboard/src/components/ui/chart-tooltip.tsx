import * as React from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

/**
 * Shared theme-aware palette and hover cursor tokens for Recharts visualizations.
 * Ensures axis ticks, gridlines, active dots, and hover cursors adapt seamlessly
 * between light and dark themes without harsh default `#ccc` / `#fff` artifacts.
 */
export function useChartTheme() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return React.useMemo(
    () => ({
      isDark,
      tickColor: isDark ? '#94a3b8' : '#64748b',
      gridStroke: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.26)',
      axisStroke: isDark ? 'rgba(148, 163, 184, 0.22)' : '#e2e8f0',
      legendStyle: {
        fontSize: 11,
        paddingTop: 6,
        color: isDark ? '#cbd5e1' : '#475569',
      } as React.CSSProperties,
      barCursor: {
        fill: isDark ? 'rgba(148, 163, 184, 0.09)' : 'rgba(15, 23, 42, 0.045)',
        radius: 6,
      },
      lineCursor: {
        stroke: isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.32)',
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
      activeDot: {
        r: 5,
        strokeWidth: 2,
        stroke: isDark ? '#0f172a' : '#ffffff',
      },
    }),
    [isDark],
  )
}

interface ChartTooltipShellProps {
  children: React.ReactNode
  className?: string
}

/**
 * Elevated glassmorphic card container for custom Recharts tooltips.
 */
export function ChartTooltipShell({ children, className }: ChartTooltipShellProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md px-3.5 py-2.5 text-xs text-popover-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10 min-w-[175px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ChartTooltipRowProps {
  label: React.ReactNode
  value: React.ReactNode
  color?: string
  indicator?: 'dot' | 'line'
  valueClassName?: string
}

export function ChartTooltipRow({
  label,
  value,
  color,
  indicator = 'dot',
  valueClassName,
}: ChartTooltipRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="flex items-center gap-2 min-w-0">
        {color && (
          <span
            className={cn(
              'shrink-0',
              indicator === 'line'
                ? 'h-0.5 w-3 rounded-full'
                : 'h-2.5 w-2.5 rounded-[3px] ring-1 ring-black/10 dark:ring-white/15',
            )}
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-muted-foreground font-normal truncate">{label}</span>
      </div>
      <span className={cn('font-semibold text-popover-foreground tabular-nums shrink-0', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

export interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<any>
  label?: any
  hideLabel?: boolean
  indicator?: 'dot' | 'line'
  labelFormatter?: (label: any, payload: Array<any>) => React.ReactNode
  valueFormatter?: (value: number, name: string, item: any) => React.ReactNode
  showTotal?: boolean
  totalLabel?: string
  footer?: React.ReactNode | ((payload: Array<any>) => React.ReactNode)
  className?: string
}

/**
 * Reusable theme-aware Recharts `<Tooltip content={<ChartTooltipContent />} />` renderer.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = 'dot',
  labelFormatter,
  valueFormatter,
  showTotal = false,
  totalLabel = 'Total',
  footer,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const resolvedLabel = labelFormatter
    ? labelFormatter(label, payload)
    : label ?? payload[0]?.name

  const total = showTotal
    ? payload.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0

  const resolvedFooter = typeof footer === 'function' ? footer(payload) : footer

  return (
    <ChartTooltipShell className={className}>
      {!hideLabel && resolvedLabel !== undefined && resolvedLabel !== null && resolvedLabel !== '' && (
        <div className="font-semibold text-popover-foreground pb-1.5 mb-1.5 border-b border-border/60 leading-snug">
          {resolvedLabel}
        </div>
      )}

      <div className="space-y-0.5">
        {payload.map((item, idx) => {
          const itemColor =
            item.color || item.stroke || item.fill || item.payload?.fill || item.payload?.color
          const rawVal = typeof item.value === 'number' ? item.value : Number(item.value ?? 0)
          const formattedVal = valueFormatter
            ? valueFormatter(rawVal, String(item.name ?? item.dataKey ?? ''), item)
            : rawVal.toLocaleString('en-PH')

          return (
            <ChartTooltipRow
              key={`${item.dataKey ?? item.name ?? idx}-${idx}`}
              color={itemColor}
              indicator={indicator}
              label={item.name ?? item.dataKey}
              value={formattedVal}
            />
          )
        })}
      </div>

      {showTotal && payload.length > 1 && (
        <div className="mt-1.5 pt-1.5 border-t border-border/60 flex items-center justify-between gap-4 text-[11px]">
          <span className="text-muted-foreground font-medium">{totalLabel}</span>
          <span className="font-bold text-popover-foreground tabular-nums">
            {valueFormatter ? valueFormatter(total, totalLabel, null) : total.toLocaleString('en-PH')}
          </span>
        </div>
      )}

      {resolvedFooter && (
        <div className="mt-1.5 pt-1.5 border-t border-border/60 text-[11px]">
          {resolvedFooter}
        </div>
      )}
    </ChartTooltipShell>
  )
}
