import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Icon } from '@iconify/react'
import type { ConsolidatedKPI } from '../types/consolidation'
import { cn } from '@/lib/utils'

interface ConsolidatedPreviewUIProps {
  consolidatedKPIs: ConsolidatedKPI[]
}

type NormalizedTargets = {
  q1: number
  q2: number
  q3: number
  q4: number
  annual: number
}

function getActivityTargets(activity: ConsolidatedKPI['activities'][number]): NormalizedTargets {
  const rawQ1 = activity.q1Target ?? 0
  const rawQ2 = activity.q2Target ?? 0
  const rawQ3 = activity.q3Target ?? 0
  const rawQ4 = activity.q4Target ?? 0
  const rawQuarterlySum = rawQ1 + rawQ2 + rawQ3 + rawQ4

  const annual =
    activity.annualTarget ??
    (rawQuarterlySum > 0
      ? rawQuarterlySum
      : Math.max(1, Math.round((activity.proposedBudget || 0) / 100000)))

  if (rawQuarterlySum > 0) {
    return {
      q1: rawQ1,
      q2: rawQ2,
      q3: rawQ3,
      q4: rawQ4,
      annual,
    }
  }

  const q1 = Math.round(annual * 0.2)
  const q2 = Math.round(annual * 0.25)
  const q3 = Math.round(annual * 0.25)
  const q4 = annual - q1 - q2 - q3

  return { q1, q2, q3, q4, annual }
}

export default function ConsolidatedPreviewUI({ consolidatedKPIs }: ConsolidatedPreviewUIProps) {
  const kpiSummaries = useMemo(
    () =>
      [...consolidatedKPIs]
        .sort((a, b) => a.masterKpiCode.localeCompare(b.masterKpiCode))
        .map((kpi, index) => {
          const activityRows = kpi.activities.map((activity) => ({
            activity,
            targets: getActivityTargets(activity),
          }))

          const officeMap = new Map<string, {
            officeName: string
            deliveryUnitName: string
            rows: typeof activityRows
            totals: NormalizedTargets
          }>()

          activityRows.forEach((row) => {
            const key = `${row.activity.officeName}::${row.activity.deliveryUnitName}`
            const existing = officeMap.get(key)

            if (existing) {
              existing.rows.push(row)
              existing.totals.q1 += row.targets.q1
              existing.totals.q2 += row.targets.q2
              existing.totals.q3 += row.targets.q3
              existing.totals.q4 += row.targets.q4
              existing.totals.annual += row.targets.annual
            } else {
              officeMap.set(key, {
                officeName: row.activity.officeName,
                deliveryUnitName: row.activity.deliveryUnitName,
                rows: [row],
                totals: {
                  q1: row.targets.q1,
                  q2: row.targets.q2,
                  q3: row.targets.q3,
                  q4: row.targets.q4,
                  annual: row.targets.annual,
                },
              })
            }
          })

          const offices = Array.from(officeMap.values())

          const totals = offices.reduce(
            (acc, item) => ({
              q1: acc.q1 + item.totals.q1,
              q2: acc.q2 + item.totals.q2,
              q3: acc.q3 + item.totals.q3,
              q4: acc.q4 + item.totals.q4,
              annual: acc.annual + item.totals.annual,
            }),
            { q1: 0, q2: 0, q3: 0, q4: 0, annual: 0 },
          )

          const level1Passed = totals.annual === kpi.strategicAgencyTarget

          return {
            index,
            kpi,
            offices,
            totals,
            level1Passed,
          }
        }),
    [consolidatedKPIs],
  )

  if (consolidatedKPIs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Icon icon="mdi:folder-open-outline" className="text-5xl text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">No Consolidation Data</h3>
        <p className="text-sm text-slate-500 mt-2">
          Click "Consolidate" to generate the Master KPI view
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Consolidated KPI List */}
      <div className="space-y-4">
        {kpiSummaries.map((summary) => (
          <KPIListItem key={summary.kpi.id} summary={summary} />
        ))}
      </div>
    </div>
  )
}

interface KPIListItemProps {
  summary: {
    index: number
    kpi: ConsolidatedKPI
    offices: Array<{
      officeName: string
      deliveryUnitName: string
      rows: Array<{
        activity: ConsolidatedKPI['activities'][number]
        targets: NormalizedTargets
      }>
      totals: NormalizedTargets
    }>
    totals: {
      q1: number
      q2: number
      q3: number
      q4: number
      annual: number
    }
    level1Passed: boolean
  }
}

function KPIListItem({ summary }: KPIListItemProps) {
  const { index, kpi, offices, totals, level1Passed } = summary
  const isMatched = level1Passed
  const deficitAmount = kpi.strategicAgencyTarget - totals.annual

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden', !isMatched && 'border-amber-300')}>
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">KPI {index + 1}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 text-base">{kpi.kpiName}</h4>
              <Badge variant="outline" className="text-xs font-mono bg-slate-100 text-slate-700">
                {kpi.masterKpiCode}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isMatched ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300',
                )}
              >
                {isMatched ? 'Matched' : 'Mismatch'}
              </Badge>
            </div>
            {kpi.kpiDescription && <p className="text-xs text-slate-600 mt-1 italic">{kpi.kpiDescription}</p>}
          </div>

          <div className="text-left lg:text-right">
            <p className="text-xs text-slate-600">Behavior Tag</p>
            <Badge
              variant="outline"
              color="secondary"
              className={cn(
                'font-mono text-xs mt-1',
                kpi.behaviorTag === 'Sum' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700',
              )}
            >
              {kpi.behaviorTag}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-slate-200 bg-white">
        <p className="text-sm font-medium text-slate-800 mb-3">Target Summary (Activity + Quarterly Totals)</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Q1 Sum</p>
            <p className="text-sm font-semibold text-slate-900">{totals.q1.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Q2 Sum</p>
            <p className="text-sm font-semibold text-slate-900">{totals.q2.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Q3 Sum</p>
            <p className="text-sm font-semibold text-slate-900">{totals.q3.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Q4 Sum</p>
            <p className="text-sm font-semibold text-slate-900">{totals.q4.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="text-[11px] text-blue-600">Target (Annual Sum)</p>
            <p className="text-sm font-semibold text-blue-900">{totals.annual.toLocaleString()}</p>
          </div>
        </div>

        {!isMatched && (
          <p className="text-xs font-medium text-amber-700 mt-3">
            Variance against Agency Target: {deficitAmount > 0 ? '+' : ''}{deficitAmount.toLocaleString()} {kpi.unitOfMeasure}
          </p>
        )}
      </div>

      <div className="p-4 space-y-4 bg-slate-50">
        {offices.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">No activities found for this KPI</div>
        ) : (
          offices.map((office, officeIndex) => (
            <div key={`${office.officeName}-${officeIndex}`} className="rounded-md border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{office.officeName}</p>
                  <p className="text-xs text-slate-600">{office.deliveryUnitName}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold text-slate-700">Activity</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Q1</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Q2</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Q3</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Q4</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Annual</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right pr-4">Proposed Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {office.rows.map(({ activity, targets }) => (
                      <TableRow key={activity.id} className="border-b border-slate-200 hover:bg-white">
                        <TableCell className="py-3">
                          <div className="border-l-4 border-slate-300 pl-3 py-1">
                            <p className="text-sm text-slate-700">{activity.activityDescription}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right font-mono text-sm">{targets.q1.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right font-mono text-sm">{targets.q2.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right font-mono text-sm">{targets.q3.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right font-mono text-sm">{targets.q4.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right font-mono text-sm font-semibold">{targets.annual.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right pr-4 font-mono text-sm font-semibold">₱{activity.proposedBudget.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                  <TableFooter className="bg-slate-50">
                    <TableRow className="border-t border-slate-200">
                      <TableCell className="text-xs text-slate-600 font-semibold">Office Totals</TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-700">{office.totals.q1.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-700">{office.totals.q2.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-700">{office.totals.q3.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-700">{office.totals.q4.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-slate-900">{office.totals.annual.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-4 text-xs text-slate-500">—</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
