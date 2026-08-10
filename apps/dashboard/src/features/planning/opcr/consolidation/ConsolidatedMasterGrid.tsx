import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import type { ConsolidatedKPI, ValidationResult } from './types'

type ViewMode = 'kpi' | 'office'

interface ConsolidatedMasterGridProps {
  consolidatedKpis: ConsolidatedKPI[]
  validation: ValidationResult
  isReadOnly?: boolean
  onFinalizeClick?: () => void
}

/**
 * FEATURES 3 & 4: Consolidated Master Grid
 * 
 * Dual view modes:
 * - BY KPI: Accordion layout (KPI → Office Contributions → Activities)
 * - BY OFFICE: Card layout (Office → KPIs → Activities)
 */
export function ConsolidatedMasterGrid({
  consolidatedKpis,
  validation,
  isReadOnly = false,
  onFinalizeClick,
}: ConsolidatedMasterGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('kpi')
  const [expandedKpis, setExpandedKpis] = useState<Set<string>>(new Set())
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set())

  // Extract unique offices from contributions
  const uniqueOffices = useMemo(() => {
    const offices = new Set<string>()
    consolidatedKpis.forEach((kpi) => {
      kpi.officeContributions.forEach((contrib) => {
        offices.add(contrib.officeName)
      })
    })
    return Array.from(offices).sort()
  }, [consolidatedKpis])

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalActivities = consolidatedKpis.reduce(
      (sum, kpi) =>
        sum +
        kpi.officeContributions.reduce(
          (kpiSum, contrib) => kpiSum + contrib.activities.length,
          0,
        ),
      0,
    )
    const totalBudget = consolidatedKpis.reduce(
      (sum, kpi) =>
        sum +
        kpi.officeContributions.reduce((kpiSum, contrib) => kpiSum + contrib.budget, 0),
      0,
    )
    return {
      totalKpis: consolidatedKpis.length,
      totalActivities,
      totalBudget,
      validKpis: consolidatedKpis.filter((k) => k.isValid).length,
    }
  }, [consolidatedKpis])

  const toggleKpiExpanded = (kpiCode: string) => {
    const newExpanded = new Set(expandedKpis)
    if (newExpanded.has(kpiCode)) {
      newExpanded.delete(kpiCode)
    } else {
      newExpanded.add(kpiCode)
    }
    setExpandedKpis(newExpanded)
  }

  const toggleOfficeExpanded = (officeName: string) => {
    const newExpanded = new Set(expandedOffices)
    if (newExpanded.has(officeName)) {
      newExpanded.delete(officeName)
    } else {
      newExpanded.add(officeName)
    }
    setExpandedOffices(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Agency OPCR Consolidation</h2>
        <p className="text-sm text-slate-600 mt-1">
          Fiscal Year 2025 • {uniqueOffices.length} offices consolidated
        </p>
      </div>

      {/* Validation Summary */}
      <Card
        className={cn(
          'p-4 border-2',
          validation.isValid
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-amber-300 bg-amber-50',
        )}
      >
        <div className="flex items-start gap-3">
          <Icon
            icon={validation.isValid ? 'mdi:check-circle' : 'mdi:alert-circle'}
            className={cn(
              'text-2xl mt-0.5 flex-shrink-0',
              validation.isValid ? 'text-emerald-600' : 'text-amber-600',
            )}
          />
          <div className="flex-1">
            <p
              className={cn(
                'font-semibold text-sm',
                validation.isValid ? 'text-emerald-900' : 'text-amber-900',
              )}
            >
              {validation.isValid
                ? '✓ All validations passed'
                : `⚠ ${validation.errors.length} error(s), ${validation.warnings.length} warning(s)`}
            </p>
            {!validation.isValid && validation.errors.length > 0 && (
              <div className="text-xs text-amber-800 mt-2 space-y-1">
                {validation.errors.slice(0, 2).map((err, idx) => (
                  <p key={idx}>{err.message}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Total KPIs"
          value={metrics.totalKpis}
          icon="mdi:target-multiple"
        />
        <MetricCard
          label="Total Activities"
          value={metrics.totalActivities}
          icon="mdi:file-document-multiple"
        />
        <MetricCard
          label="Total Budget"
          value={`₱${(metrics.totalBudget / 1000000).toFixed(1)}M`}
          icon="mdi:cash-multiple"
        />
        <MetricCard
          label="Valid KPIs"
          value={metrics.validKpis}
          icon="mdi:check-circle"
          color="emerald"
        />
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2 border-b border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'px-4 py-2 rounded-none border-b-2 font-medium text-sm',
            viewMode === 'kpi'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900',
          )}
          onClick={() => setViewMode('kpi')}
        >
          <Icon icon="mdi:target" className="mr-2" />
          By KPI
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'px-4 py-2 rounded-none border-b-2 font-medium text-sm',
            viewMode === 'office'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900',
          )}
          onClick={() => setViewMode('office')}
        >
          <Icon icon="mdi:office-building" className="mr-2" />
          By Office
        </Button>
      </div>

      {/* BY KPI VIEW */}
      {viewMode === 'kpi' && (
        <div className="space-y-2">
          {consolidatedKpis.map((kpi) => {
            const isExpanded = expandedKpis.has(kpi.masterKpiCode)

            return (
              <Card key={kpi.masterKpiCode} className="overflow-hidden border-slate-200">
                {/* KPI Header */}
                <button
                  onClick={() => toggleKpiExpanded(kpi.masterKpiCode)}
                  className={cn(
                    'w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors',
                    !kpi.isValid && 'bg-amber-50',
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon
                      icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                      className="text-slate-600"
                    />

                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{kpi.masterKpiCode}</h3>
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                          {kpi.behaviorTag}
                        </Badge>
                        {!kpi.isValid && (
                          <Icon
                            icon="mdi:alert"
                            className="text-amber-500 text-lg"
                          />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{kpi.kpiTitle}</p>
                    </div>
                  </div>

                  {/* Targets Display */}
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Agency Target</p>
                      <p className="font-bold text-slate-900">{kpi.agencyTarget.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Consolidated</p>
                      <p
                        className={cn(
                          'font-bold',
                          kpi.isValid ? 'text-emerald-600' : 'text-amber-600',
                        )}
                      >
                        {kpi.consolidatedTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Validation Aura */}
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        kpi.isValid
                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                          : 'bg-amber-500 shadow-lg shadow-amber-500/50',
                      )}
                    />
                  </div>
                </button>

                {/* Expanded: Office Contributions */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-0">
                    {kpi.officeContributions.map((contrib, idx) => (
                      <div
                        key={`${contrib.officeId}-${kpi.masterKpiCode}`}
                        className={cn(
                          'px-6 py-3',
                          idx > 0 && 'border-t border-slate-200',
                          !contrib.isValid && 'bg-amber-50',
                        )}
                      >
                        {/* Office Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{contrib.officeName}</p>
                            {!contrib.isValid && contrib.quarterlyMismatch && (
                              <p className="text-xs text-amber-700 mt-0.5">
                                Q1+Q2+Q3+Q4 = {(contrib.q1 + contrib.q2 + contrib.q3 + contrib.q4).toFixed(2)} ≠ {contrib.annualTarget.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 font-mono text-sm">
                            <div className="text-right">
                              <span className="text-slate-600">Annual:</span>{' '}
                              <span className="font-semibold text-slate-900">
                                {contrib.annualTarget.toFixed(1)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-600">Budget:</span>{' '}
                              <span className="font-semibold text-slate-900">
                                ₱{(contrib.budget / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quarterly Row */}
                        <div className="grid grid-cols-5 gap-2 mb-3 text-xs font-mono">
                          <div className="text-center">
                            <p className="text-slate-600">Q1</p>
                            <p className="font-semibold text-slate-900">
                              {contrib.q1.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600">Q2</p>
                            <p className="font-semibold text-slate-900">
                              {contrib.q2.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600">Q3</p>
                            <p className="font-semibold text-slate-900">
                              {contrib.q3.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600">Q4</p>
                            <p className="font-semibold text-slate-900">
                              {contrib.q4.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600">Sum</p>
                            <p className="font-semibold text-slate-900">
                              {(contrib.q1 + contrib.q2 + contrib.q3 + contrib.q4).toFixed(1)}
                            </p>
                          </div>
                        </div>

                        {/* Activities */}
                        {contrib.activities.length > 0 && (
                          <div className="border-t border-slate-300 pt-3 space-y-2">
                            {contrib.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="italic text-sm text-slate-700 pl-3 border-l-2 border-slate-400"
                              >
                                "{activity.description}"
                                <span className="text-xs text-slate-600 block mt-0.5">
                                  Budget: ₱{(activity.proposedBudget / 1000).toFixed(0)}K
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* BY OFFICE VIEW */}
      {viewMode === 'office' && (
        <div className="grid gap-4 md:grid-cols-2">
          {uniqueOffices.map((officeName) => {
            const isExpanded = expandedOffices.has(officeName)
            const officeKpis = consolidatedKpis
              .map((kpi) => ({
                ...kpi,
                contribution: kpi.officeContributions.find((c) => c.officeName === officeName),
              }))
              .filter((k) => k.contribution)

            return (
              <Card key={officeName} className="overflow-hidden border-slate-200">
                {/* Office Header */}
                <button
                  onClick={() => toggleOfficeExpanded(officeName)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-200"
                >
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-slate-900">{officeName}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {officeKpis.length} KPIs
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {officeKpis.reduce((sum, k) => sum + (k.contribution?.activities.length || 0), 0)}{' '}
                        Activities
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ₱
                        {(
                          officeKpis.reduce((sum, k) => sum + (k.contribution?.budget || 0), 0) /
                          1000000
                        ).toFixed(1)}
                        M
                      </Badge>
                    </div>
                  </div>
                  <Icon
                    icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                    className="text-slate-600 ml-2"
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 py-4 space-y-4 bg-slate-50">
                    {officeKpis.map((kpi) => {
                      const contrib = kpi.contribution!
                      return (
                        <div key={kpi.masterKpiCode} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{kpi.masterKpiCode}</p>
                              <p className="text-xs text-slate-600">{kpi.kpiTitle}</p>
                            </div>
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                              {kpi.behaviorTag}
                            </Badge>
                          </div>

                          {/* Quarterly Breakdown */}
                          <div className="grid grid-cols-5 gap-1 text-xs font-mono bg-white p-2 rounded border border-slate-200">
                            <div className="text-center">
                              <p className="text-slate-600">Q1</p>
                              <p className="font-bold">{contrib.q1.toFixed(0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-600">Q2</p>
                              <p className="font-bold">{contrib.q2.toFixed(0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-600">Q3</p>
                              <p className="font-bold">{contrib.q3.toFixed(0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-600">Q4</p>
                              <p className="font-bold">{contrib.q4.toFixed(0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-600">Annual</p>
                              <p className="font-bold text-slate-900">
                                {contrib.annualTarget.toFixed(0)}
                              </p>
                            </div>
                          </div>

                          {/* Activities */}
                          {contrib.activities.length > 0 && (
                            <div className="space-y-1">
                              {contrib.activities.map((activity) => (
                                <p
                                  key={activity.id}
                                  className="text-xs italic text-slate-700 pl-2 border-l-2 border-slate-300"
                                >
                                  "{activity.description}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Finalize Panel */}
      {!isReadOnly && (
        <Card className="p-6 border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Ready to Finalize?</h3>
              <p className="text-sm text-slate-600 mt-1">
                This will lock the consolidation and prevent further modifications.
              </p>
            </div>
            <Button
              disabled={!validation.isValid}
              onClick={onFinalizeClick}
              className={cn(
                'text-white font-semibold',
                validation.isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed',
              )}
            >
              <Icon icon="mdi:lock" className="mr-2" />
              Finalize Agency OPCR
            </Button>
          </div>
        </Card>
      )}

      {/* Success State */}
      {isReadOnly && (
        <Card className="p-8 border-2 border-emerald-300 bg-emerald-50 text-center">
          <Icon icon="mdi:check-circle" className="text-5xl text-emerald-600 mx-auto mb-3 animate-bounce" />
          <h3 className="text-xl font-bold text-emerald-900">
            Agency OPCR Successfully Consolidated
          </h3>
          <p className="text-sm text-emerald-800 mt-2">
            This consolidation has been finalized and locked.
          </p>
        </Card>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  icon: string
  color?: 'slate' | 'emerald'
}

function MetricCard({ label, value, icon, color = 'slate' }: MetricCardProps) {
  return (
    <Card className={cn(
      'p-4',
      color === 'emerald' ? 'bg-emerald-50' : 'bg-slate-50'
    )}>
      <div className="flex items-center gap-3">
        <Icon
          icon={icon}
          className={cn(
            'text-2xl flex-shrink-0',
            color === 'emerald' ? 'text-emerald-600' : 'text-slate-600'
          )}
        />
        <div>
          <p className="text-xs text-slate-600 font-medium">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
