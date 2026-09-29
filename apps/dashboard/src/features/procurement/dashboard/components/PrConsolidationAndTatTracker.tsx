import { AlertTriangle, Clock } from 'lucide-react'
import type { ConsolidationProgress, TatDataPoint } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  consolidation: ConsolidationProgress | null
  tatData: Array<TatDataPoint>
  fiscalYear: number
  isLoading?: boolean
}

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_DAYS = 14
const THRESHOLD_DAYS = 7

const SCALE_TICKS: Array<{ label: string; pct: number }> = [
  { label: '0d',    pct: 0   },
  { label: '3.5d',  pct: 25  },
  { label: '7d',    pct: 50  },
  { label: '10.5d', pct: 75  },
  { label: '14d',   pct: 100 },
]

// ── Status config ──────────────────────────────────────────────────────────

type TatStatus = 'on-target' | 'above-target' | 'critical'

function getStatus(avgDays: number): TatStatus {
  if (avgDays <= THRESHOLD_DAYS) return 'on-target'
  if (avgDays <= 10.5) return 'above-target'
  return 'critical'
}

const STATUS_MAP: Record<TatStatus, {
  label: string
  barHex: string
  textClass: string
  badgeClass: string
  dotClass: string
}> = {
  'on-target': {
    label: 'On target',
    barHex: '#10b981',
    textClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  'above-target': {
    label: 'Above target',
    barHex: '#d97706',
    textClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  'critical': {
    label: 'Critical',
    barHex: '#ef4444',
    textClass: 'text-red-600',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const month = new Date().getMonth() + 1
  if (month <= 3) return 'Q1'
  if (month <= 6) return 'Q2'
  if (month <= 9) return 'Q3'
  return 'Q4'
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Colored dot + text legend item */
function LegendDot({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
      <span className="text-[11px] text-gray-500">{label}</span>
    </div>
  )
}

/** Segmented consolidation bar legend item */
function BarLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-sm shrink-0', color)} />
      <span className="text-[11px] text-gray-600">{label}</span>
    </div>
  )
}

/** Horizontal scale axis row (aligns with bar tracks) */
function ScaleAxis() {
  return (
    <div className="pl-[7.5rem] pr-[9.5rem]">
      {/* "7d target" label + pip above the gradient strip */}
      <div className="relative h-5">
        <div
          className="absolute top-0 flex flex-col items-center gap-px"
          style={{ left: 'calc(50% - 1px)' }}
        >
          <span className="text-[10px] font-semibold text-rose-400 whitespace-nowrap">
            7d target
          </span>
          <div className="h-1.5 w-px bg-rose-300" />
        </div>
      </div>

      {/* Gradient strip */}
      <div
        className="h-2 w-full rounded-full"
        style={{
          background:
            'linear-gradient(to right, #10b981 0%, #10b981 48%, #f59e0b 52%, #f59e0b 73%, #ef4444 77%, #ef4444 100%)',
        }}
      />

      {/* Tick labels */}
      <div className="relative mt-1 h-4">
        {SCALE_TICKS.map(({ label, pct }) => (
          <span
            key={label}
            className="absolute text-[10px] text-gray-400 -translate-x-1/2"
            style={{ left: `${pct}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Single department TAT row */
function TatRow({ entry }: { entry: TatDataPoint }) {
  const status = getStatus(entry.avgDays)
  const cfg = STATUS_MAP[status]
  const barPct = Math.min((entry.avgDays / MAX_DAYS) * 100, 100)
  const dotOffsetPct = barPct

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Department name */}
      <span className="w-[7rem] shrink-0 text-sm font-semibold text-gray-700 leading-tight">
        {entry.stage}
      </span>

      {/* Track + bar + reference line + dot */}
      <div className="flex-1 relative h-3.5">
        {/* Gray track background */}
        <div className="absolute inset-0 bg-gray-200/60 rounded-full" />

        {/* 7d reference line (50% of track) */}
        <div
          className="absolute top-[-5px] bottom-[-5px] w-px bg-rose-300/70"
          style={{ left: '50%' }}
        />

        {/* Colored fill bar */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${barPct}%`, backgroundColor: cfg.barHex }}
        />

        {/* Endpoint dot */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-[18px] w-[18px] rounded-full border-2 border-white shadow-md transition-all duration-500',
            cfg.dotClass,
          )}
          style={{ left: `calc(${dotOffsetPct}% - 9px)` }}
        />
      </div>

      {/* Days value */}
      <span className={cn('w-9 text-right text-[13px] font-bold shrink-0', cfg.textClass)}>
        {entry.avgDays}d
      </span>

      {/* Status badge */}
      <div className="w-[6.5rem] shrink-0">
        <Badge
          variant="outline"
          className={cn('w-full justify-center text-[10px] font-semibold py-0.5', cfg.badgeClass)}
        >
          {cfg.label}
        </Badge>
      </div>
    </div>
  )
}

/** Bottom stat card */
function StatCard({
  value,
  unit,
  label,
  className,
}: {
  value: string | number
  unit?: string
  label: string
  className: string
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-xl p-3 text-center', className)}>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[1.7rem] font-black leading-none">{value}</span>
        {unit && <span className="text-xs font-semibold ml-0.5 mb-1">{unit}</span>}
      </div>
      <span className="text-[11px] font-medium mt-1 opacity-80">{label}</span>
    </div>
  )
}

/** Insight callout */
function InsightCallout({ aboveThreshold, stalledPct }: {
  aboveThreshold: Array<TatDataPoint>
  stalledPct: number
}) {
  if (aboveThreshold.length === 0) return null

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
      <p className="text-xs text-gray-600 leading-relaxed">
        {aboveThreshold.map((e, i) => {
          const cfg = STATUS_MAP[getStatus(e.avgDays)]
          const isLast = i === aboveThreshold.length - 1
          return (
            <span key={e.stage}>
              {i > 0 && isLast && ' and '}
              {i > 0 && !isLast && ', '}
              <span className={cn('font-bold', cfg.textClass)}>
                {e.stage} ({e.avgDays}d)
              </span>
            </span>
          )
        })}
        {' '}
        {aboveThreshold.length === 1 ? 'is' : 'are'} above the {THRESHOLD_DAYS}-day target. These divisions account for{' '}
        <span className="font-bold text-red-600">{stalledPct}% of stalled PRs</span>.
        {' '}Consider scheduling a consolidation review with division heads this week.
      </p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-56 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-28 h-3 bg-gray-200 rounded animate-pulse shrink-0" />
              <div className="flex-1 h-3.5 bg-gray-100 rounded-full animate-pulse" />
              <div className="w-9 h-3 bg-gray-200 rounded animate-pulse shrink-0" />
              <div className="w-24 h-6 bg-gray-100 rounded-full animate-pulse shrink-0" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function PrConsolidationAndTatTracker({ consolidation, tatData, fiscalYear, isLoading }: Props) {
  if (isLoading || !consolidation || tatData.length === 0) return <Skeleton />

  const { total, consolidated, inProgress, stalledPRs } = consolidation

  const consolidatedPct = Math.round((consolidated / total) * 100)
  const inProgressPct   = Math.round((inProgress / total) * 100)
  const pendingPct      = 100 - consolidatedPct - inProgressPct

  const avgTat = (
    tatData.reduce((s, d) => s + d.avgDays, 0) / tatData.length
  ).toFixed(1)

  const aboveThreshold = [...tatData]
    .filter((d) => d.avgDays > THRESHOLD_DAYS)
    .sort((a, b) => b.avgDays - a.avgDays)

  const stalledPct = aboveThreshold.reduce((s, d) => s + (d.stalledWeight ?? 0), 0)

  const quarter = getCurrentQuarter()

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base">PR Consolidation &amp; TAT Tracker</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-semibold text-amber-700 border-amber-300 bg-amber-50"
          >
            {quarter} {fiscalYear}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ── Segmented progress bar ─────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            PR consolidation rate &mdash;&nbsp;
            <span className="font-bold text-gray-800">{consolidated} of {total} consolidated</span>
          </p>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="bg-blue-600 transition-all" style={{ width: `${consolidatedPct}%` }} />
            <div className="bg-amber-400 transition-all" style={{ width: `${inProgressPct}%` }} />
            <div className="bg-gray-300 transition-all"  style={{ width: `${pendingPct}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <BarLegend color="bg-blue-600"  label={`Consolidated ${consolidatedPct}%`} />
            <BarLegend color="bg-amber-400" label={`In-review ${inProgressPct}%`} />
            <BarLegend color="bg-gray-300"  label={`Pending ${pendingPct}%`} />
          </div>
        </div>

        {/* ── TAT Section ────────────────────────────────────────────── */}
        <div className="space-y-0">
          {/* Header: label + legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-xs text-gray-500">
              Avg Turnaround Time: PR&nbsp;&rarr;&nbsp;PO&nbsp;(days)
              &nbsp;&middot;&nbsp;
              <span className="font-semibold text-blue-600">target: {THRESHOLD_DAYS} days</span>
            </p>
            <div className="flex items-center gap-4">
              <LegendDot hex={STATUS_MAP['on-target'].barHex}     label="On target" />
              <LegendDot hex={STATUS_MAP['above-target'].barHex}  label="Above target" />
              <LegendDot hex={STATUS_MAP['critical'].barHex}      label="Critical" />
            </div>
          </div>

          {/* Scale axis */}
          <ScaleAxis />

          {/* Department rows */}
          <div className="mt-2">
            {tatData.map((entry) => (
              <TatRow key={entry.stage} entry={entry} />
            ))}
          </div>
        </div>

        {/* ── Bottom stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={avgTat}
            unit="d"
            label="Avg TAT (days)"
            className="bg-blue-50 text-blue-700"
          />
          <StatCard
            value={consolidated}
            label="Consolidated PRs"
            className="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            value={stalledPRs}
            label="Stalled PRs"
            className="bg-red-50 text-red-600"
          />
        </div>

        {/* ── Insight callout ───────────────────────────────────────── */}
        <InsightCallout aboveThreshold={aboveThreshold} stalledPct={stalledPct} />

      </CardContent>
    </Card>
  )
}

interface Props {
  consolidation: ConsolidationProgress | null
  tatData: Array<TatDataPoint>
  fiscalYear: number
  isLoading?: boolean
}
