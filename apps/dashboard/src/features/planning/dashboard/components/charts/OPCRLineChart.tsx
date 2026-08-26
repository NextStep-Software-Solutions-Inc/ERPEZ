/**
 * Quarterly OPCR Target vs Accomplishment Widget
 *
 * Visualizes quarterly OPCR accomplishment rates against the standardized 100% target baseline
 * using a clean horizontal bullet / progress-bar comparison (as established by SPMS guidelines).
 *
 * Features:
 * - Color-coded performance bands:
 *     >= 100% -> #1baf7a (emerald)
 *     85-99%  -> #1D9E75 (teal)
 *     50-84%  -> #2a78d6 (blue)
 *     < 50%   -> #eda100 (amber)
 * - Prominent vertical 100% target-line marker crossing each row
 * - Quarters with no backend data displayed as "No data reported" (italic muted)
 * - Top-right summary: "Avg: X% across reported quarters" and "Target baseline: 100%"
 * - Variance column with +/- prefix and color coding (green for positive, amber/red for negative)
 * - Flexible height distribution so the 4 rows evenly fill the parent card height
 *
 * @module features/planning/dashboard/components/charts/OPCRLineChart
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import type { OPCRChartData } from '../../types'

interface OPCRLineChartProps {
  data: OPCRChartData
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse flex-1 flex flex-col justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5 flex-1 flex flex-col justify-center">
          <div className="flex justify-between">
            <div className="h-3 w-8 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-3.5 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Performance band color mapping:
 * >= 100% -> #1baf7a (emerald)
 * 85-99%  -> #1D9E75 (teal)
 * 50-84%  -> #2a78d6 (blue)
 * < 50%   -> #eda100 (amber)
 */
function getBandColor(actual: number): string {
  if (actual >= 100) return '#1baf7a'
  if (actual >= 85) return '#1D9E75'
  if (actual >= 50) return '#2a78d6'
  return '#eda100'
}

export function OPCRLineChart({ data, isLoading }: OPCRLineChartProps) {
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null)

  if (isLoading || !data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full border border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Quarterly OPCR target vs accomplishment
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 font-normal">
            Quarterly accomplishment rate against the 100% target baseline
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 pt-0">
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  // Quarters with actual data reported
  const reportedQuarters = data.filter((d) => d.hasData && d.hasAccomplishmentReported)
  const maxAccomplished = reportedQuarters.length > 0
    ? Math.max(...reportedQuarters.map((d) => d.actual))
    : 100

  // Calculate track max scale (at least 135% so the 100% target marker sits comfortably with breathing room for exceedance)
  const maxScale = Math.max(135, Math.ceil(maxAccomplished / 25) * 25)
  const targetMarkerPercent = (100 / maxScale) * 100

  // Summary metric: Average accomplishment across reported quarters
  const averageAccomplishment = reportedQuarters.length > 0
    ? reportedQuarters.reduce((acc, curr) => acc + curr.actual, 0) / reportedQuarters.length
    : null

  const hasAnyData = data.some((d) => d.hasData)

  const quarterLabels: Record<string, string> = {
    Q1: '1st Quarter (Q1)',
    Q2: '2nd Quarter (Q2)',
    Q3: '3rd Quarter (Q3)',
    Q4: '4th Quarter (Q4)',
  }

  return (
    <Card className="flex flex-col h-full border border-gray-100 shadow-sm bg-white">
      {/* ── Widget Header ────────────────────────────────────────────── */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Quarterly OPCR target vs accomplishment
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-normal mt-0.5">
              Quarterly accomplishment rate against the 100% target baseline
            </CardDescription>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[11px] text-gray-400 font-normal">
              Target baseline: 100%
            </div>
            {averageAccomplishment !== null ? (
              <div className="text-xl font-bold text-gray-900 leading-tight">
                Avg: {averageAccomplishment.toFixed(1)}%
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-500">
                No data
              </div>
            )}
            <div className="text-[10px] text-gray-400 font-normal">
              across reported quarters
            </div>
          </div>
        </div>

        {/* ── Performance Band Legend ─────────────────────────────────── */}
        <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1.5 pt-2 text-[11px] text-gray-600 font-normal border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#1baf7a' }} />
            <span>≥ 100% — target met</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#1D9E75' }} />
            <span>85–99% — in progress</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#2a78d6' }} />
            <span>50–84% — below target</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#eda100' }} />
            <span>&lt; 50% — critical</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 ml-auto sm:ml-0">
            <span className="font-bold text-gray-700">|</span>
            <span>100% target line</span>
          </div>
        </div>
      </CardHeader>

      {/* ── Widget Content ───────────────────────────────────────────── */}
      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4">
        {!hasAnyData ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/40 my-auto">
            <Layers className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs font-medium text-gray-600">No OPCR targets or accomplishments encoded</p>
            <p className="text-[11px] text-gray-400 font-normal mt-0.5">
              Accomplishments will be tracked here once department OPCRs are submitted for this fiscal year.
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-between flex-1 py-1 gap-2">
            {data.map((item) => {
              const hasTarget = item.hasData ?? (item.planned > 0)
              const hasAccomplishment = item.hasAccomplishmentReported ?? (item.actual > 0)
              const actualVal = hasAccomplishment ? item.actual : 0
              const barWidthPct = hasAccomplishment
                ? Math.min(100, (actualVal / maxScale) * 100)
                : 0
              const barColor = getBandColor(actualVal)
              const variance = actualVal - 100
              const isPositive = variance >= 0
              const isHovered = hoveredQuarter === item.month

              return (
                <div
                  key={item.month}
                  className="flex items-center gap-4 flex-1 min-h-[40px] relative group"
                  onMouseEnter={() => setHoveredQuarter(item.month)}
                  onMouseLeave={() => setHoveredQuarter(null)}
                >
                  {/* Quarter Label */}
                  <span className="text-xs font-semibold text-gray-700 w-6 flex-shrink-0">
                    {item.month}
                  </span>

                  {/* Bullet Track Container */}
                  <div className="relative flex-1 h-3.5 bg-gray-100 rounded-full flex items-center overflow-visible">
                    {/* Actual Accomplishment Bar */}
                    {hasAccomplishment && (
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidthPct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    )}

                    {/* 100% Target Reference Line (vertical tick crossing track) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-600 z-10 rounded-full"
                      style={{ left: `${targetMarkerPercent}%` }}
                      title="100% Target Line"
                    />
                  </div>

                  {/* Right-Hand Metric / Status */}
                  <div className="w-32 flex-shrink-0 text-right flex items-center justify-end gap-2 text-xs">
                    {!hasTarget || !hasAccomplishment ? (
                      <span className="text-xs text-gray-400 font-normal italic">
                        No data reported
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-gray-900 text-xs min-w-[42px] text-right">
                          {actualVal.toFixed(1)}%
                        </span>

                        <span
                          className="font-bold text-xs min-w-[48px] text-right"
                          style={{ color: isPositive ? '#1baf7a' : '#eda100' }}
                        >
                          {isPositive ? '+' : ''}
                          {variance.toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Interactive Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute left-10 -top-12 z-20 bg-gray-900 text-white text-xs rounded-lg shadow-lg px-3 py-2 pointer-events-none min-w-[190px]">
                      <p className="font-semibold text-white mb-1">
                        {quarterLabels[item.month] || item.month}
                      </p>
                      {!hasTarget || !hasAccomplishment ? (
                        <p className="text-[11px] text-gray-300">
                          Target baseline is 100%, but no accomplishment data has been reported for this quarter.
                        </p>
                      ) : (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-300 font-normal">Accomplished:</span>
                            <span className="font-bold text-white">{actualVal.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-300 font-normal">Target Baseline:</span>
                            <span className="font-semibold text-gray-200">100.0%</span>
                          </div>
                          <div className="flex justify-between gap-3 pt-0.5 border-t border-gray-700">
                            <span className="text-gray-300 font-normal">Variance:</span>
                            <span
                              className="font-bold"
                              style={{ color: isPositive ? '#1baf7a' : '#eda100' }}
                            >
                              {isPositive ? '+' : ''}{variance.toFixed(1)}% ({isPositive ? 'Target Met' : 'Below Target'})
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
