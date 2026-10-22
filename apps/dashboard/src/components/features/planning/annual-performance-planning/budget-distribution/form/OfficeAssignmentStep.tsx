/**
 * Step 3: Office Assignment & Target Distribution (Full View)
 * 
 * Promoted from dialog into full page workflow step.
 * Assigns offices (delivery units) to base KPIs and distributes targets.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ChevronRight,
  ChevronLeft,
  Search,
  AlertCircle,
  Building2,
  CheckCircle2,
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  q1?: number | null
  q2?: number | null
  q3?: number | null
  q4?: number | null
  unitOfMeasure?: string
  measurementUnit?: string
  isLocked?: boolean
  status?: string
}

export function isIntegerMeasurementUnit(unit?: string): boolean {
  if (!unit) return true
  const normalized = unit.trim().toLowerCase()
  if (
    normalized === 'percentage' ||
    normalized === 'percent' ||
    normalized === '%' ||
    normalized === 'currency' ||
    normalized === 'amount' ||
    normalized === 'php' ||
    normalized === 'usd' ||
    normalized === 'ratio' ||
    normalized === 'rate'
  ) {
    return false
  }
  return true
}

export interface KPIOfficeAssignmentResult {
  kpiId: string
  kpiCode: string
  kpiName: string
  assignedOfficeIds: Set<string>
  officeDistributions?: Map<string, number>
  officeQuarterlyDistributions?: Map<
    string,
    { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
  >
}

export interface OfficeAssignmentStepProps {
  baseTargets: BaseKPITarget[]
  availableOffices: Array<{ id: string; name: string }>
  initialAssignments?: KPIOfficeAssignmentResult[]
  onComplete: (assignments: KPIOfficeAssignmentResult[]) => void
  onBack: () => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export const OfficeAssignmentStep: React.FC<OfficeAssignmentStepProps> = ({
  baseTargets = [],
  availableOffices = [],
  initialAssignments = [],
  onComplete,
  onBack,
  onCancel,
  isSubmitting = false,
}) => {
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map())
  const [officeDistributions, setOfficeDistributions] = useState<Map<string, Map<string, number>>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Initialize assignments state
  useEffect(() => {
    if (initialAssignments && initialAssignments.length > 0) {
      const newAssignments = new Map<string, Set<string>>()
      const newDistributions = new Map<string, Map<string, number>>()
      initialAssignments.forEach((a) => {
        newAssignments.set(a.kpiId, a.assignedOfficeIds)
        if (a.officeDistributions) {
          newDistributions.set(a.kpiId, new Map(a.officeDistributions))
        }
      })
      setAssignments(newAssignments)
      setOfficeDistributions(newDistributions)
    }
  }, [initialAssignments])

  const safeBaseTargets = baseTargets || []
  const safeAvailableOffices = availableOffices || []
  const currentKPI = safeBaseTargets[Math.min(currentKpiIndex, Math.max(0, safeBaseTargets.length - 1))]
  const currentAssigned: Set<string> = currentKPI
    ? assignments.get(currentKPI.kpiId) || new Set<string>()
    : new Set<string>()

  const filteredOffices = safeAvailableOffices.filter((office) =>
    office.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const distributionTotal = useMemo(() => {
    if (!currentKPI || currentKPI.aggregationMethod !== 'SUM') return null
    const distributions = officeDistributions.get(currentKPI.kpiId) || new Map()
    let total = 0
    for (const officeId of currentAssigned) {
      total += distributions.get(officeId) ?? 0
    }
    return total
  }, [currentKPI, officeDistributions, currentAssigned])

  const allSelectedOfficesHaveValues = useMemo(() => {
    if (!currentKPI || currentKPI.aggregationMethod !== 'SUM') return true
    const baseTarget = currentKPI.baseTargetValue ?? 0
    if (baseTarget <= 0) return true

    const distributions = officeDistributions.get(currentKPI.kpiId) || new Map()
    for (const officeId of currentAssigned) {
      const value = distributions.get(officeId) ?? 0
      if (value <= 0) {
        return false
      }
    }
    return true
  }, [currentKPI, currentAssigned, officeDistributions])

  if (!currentKPI || safeAvailableOffices.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {!currentKPI ? 'No Base KPI Targets Found' : 'No Offices Available'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {!currentKPI
            ? 'Please define base KPI targets in Step 2 before assigning offices.'
            : 'No delivery units or offices found in the system.'}
        </p>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Target Setting
        </Button>
      </Card>
    )
  }

  const handleToggleOffice = (officeId: string) => {
    const updated = new Set<string>(currentAssigned)
    const distributions = new Map(officeDistributions.get(currentKPI.kpiId) || new Map())

    if (updated.has(officeId)) {
      updated.delete(officeId)
      distributions.delete(officeId)
    } else {
      updated.add(officeId)
      const baseTarget = currentKPI.baseTargetValue ?? 0
      if (currentKPI.aggregationMethod === 'SUM') {
        const currentSum = Array.from(currentAssigned).reduce((acc, id) => acc + (distributions.get(id) || 0), 0)
        const remaining = Math.max(0, baseTarget - currentSum)
        if (remaining > 0) {
          distributions.set(officeId, remaining)
        } else if (baseTarget > 0 && currentAssigned.size === 0) {
          distributions.set(officeId, baseTarget)
        }
      } else {
        if (baseTarget > 0) {
          distributions.set(officeId, baseTarget)
        }
      }
    }

    setAssignments(new Map(assignments).set(currentKPI.kpiId, updated))
    setOfficeDistributions(new Map(officeDistributions).set(currentKPI.kpiId, distributions))
  }

  const handleSelectAll = () => {
    const officeIds = new Set<string>(safeAvailableOffices.map((o) => o.id))
    const distributions = new Map(officeDistributions.get(currentKPI.kpiId) || new Map())

    if (currentAssigned.size === safeAvailableOffices.length) {
      setAssignments(new Map(assignments).set(currentKPI.kpiId, new Set()))
      setOfficeDistributions(new Map(officeDistributions).set(currentKPI.kpiId, new Map()))
    } else {
      const baseTarget = currentKPI.baseTargetValue ?? 0
      const officeCount = safeAvailableOffices.length
      const unit = currentKPI.measurementUnit || currentKPI.unitOfMeasure
      const isIntegerUnit = isIntegerMeasurementUnit(unit)

      if (currentKPI.aggregationMethod === 'SUM') {
        if (baseTarget > 0 && officeCount > 0) {
          if (isIntegerUnit) {
            const baseAmount = Math.floor(baseTarget / officeCount)
            let remainder = baseTarget - baseAmount * officeCount
            safeAvailableOffices.forEach((office) => {
              const portion = baseAmount + (remainder > 0 ? 1 : 0)
              if (remainder > 0) remainder--
              distributions.set(office.id, portion)
            })
          } else {
            const baseAmount = Math.floor((baseTarget / officeCount) * 100) / 100
            let remainder = Math.round((baseTarget - baseAmount * officeCount) * 100) / 100
            safeAvailableOffices.forEach((office) => {
              const add = remainder >= 0.01 ? 0.01 : 0
              if (remainder >= 0.01) remainder -= 0.01
              distributions.set(office.id, Math.round((baseAmount + add) * 100) / 100)
            })
          }
        }
      } else {
        if (baseTarget > 0) {
          safeAvailableOffices.forEach((office) => {
            distributions.set(office.id, baseTarget)
          })
        }
      }
      setAssignments(new Map(assignments).set(currentKPI.kpiId, officeIds))
      setOfficeDistributions(new Map(officeDistributions).set(currentKPI.kpiId, distributions))
    }
  }

  const handleUpdateDistribution = (officeId: string, value: string) => {
    const distributions = new Map(officeDistributions.get(currentKPI.kpiId) || new Map())
    if (value === '') {
      distributions.delete(officeId)
    } else {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        distributions.set(officeId, numValue)
      }
    }
    setOfficeDistributions(new Map(officeDistributions).set(currentKPI.kpiId, distributions))
  }

  const getDistributionValidation = (value: number | null): { isValid: boolean; error?: string } => {
    if (!currentKPI || value === null) {
      return { isValid: true }
    }

    const baseTarget = currentKPI.baseTargetValue ?? 0
    const isSumAggregation = currentKPI.aggregationMethod === 'SUM'

    if (isSumAggregation) {
      if (baseTarget > 0) {
        if (value < 1) return { isValid: false, error: 'Min 1' }
        if (value > baseTarget) return { isValid: false, error: `Max ${baseTarget}` }
      } else {
        if (value < 0) return { isValid: false, error: 'Min 0' }
      }
    } else {
      if (baseTarget > 0) {
        if (value !== baseTarget) return { isValid: false, error: `Must be ${baseTarget}` }
      } else {
        if (value < 0) return { isValid: false, error: 'Min 0' }
      }
    }
    return { isValid: true }
  }

  const validateCurrentKPI = (): boolean => {
    const baseTarget = currentKPI.baseTargetValue ?? 0
    const isSumAggregation = currentKPI.aggregationMethod === 'SUM'
    const distributions = officeDistributions.get(currentKPI.kpiId) || new Map()

    if (currentAssigned.size === 0) {
      setValidationError('Please assign at least one office to this KPI.')
      return false
    }

    for (const officeId of currentAssigned) {
      const value = distributions.get(officeId) ?? 0
      if (value <= 0) {
        setValidationError('All selected offices must have a target value greater than 0.')
        return false
      }
    }

    for (const officeId of currentAssigned) {
      const value = distributions.get(officeId)
      if (value !== undefined) {
        const validation = getDistributionValidation(value)
        if (!validation.isValid) {
          setValidationError(`Invalid distribution value: ${validation.error}.`)
          return false
        }
      }
    }

    if (isSumAggregation && baseTarget > 0) {
      const totalDistributed: number = Array.from(currentAssigned).reduce<number>((sum, officeId) => {
        return sum + (distributions.get(officeId) ?? 0)
      }, 0)
      const isValid = Math.abs(totalDistributed - baseTarget) < 0.01

      if (!isValid) {
        setValidationError(
          `SUM aggregation requires distributed values to equal base target (${baseTarget}). Current total: ${totalDistributed.toFixed(2)}`
        )
        return false
      }
    }

    if (!isSumAggregation && baseTarget > 0) {
      for (const officeId of currentAssigned) {
        const value = distributions.get(officeId) ?? 0
        if (value !== baseTarget) {
          setValidationError(
            `${currentKPI.aggregationMethod} aggregation: All selected offices must have target value of ${baseTarget}.`
          )
          return false
        }
      }
    }

    setValidationError(null)
    return true
  }

  const handleNextKpi = () => {
    if (!validateCurrentKPI()) return

    if (currentKpiIndex < safeBaseTargets.length - 1) {
      setCurrentKpiIndex(currentKpiIndex + 1)
      setSearchQuery('')
    } else {
      compileAndComplete()
    }
  }

  const handlePrevKpi = () => {
    if (currentKpiIndex > 0) {
      setCurrentKpiIndex(currentKpiIndex - 1)
      setSearchQuery('')
      setValidationError(null)
    }
  }

  const compileAndComplete = () => {
    const results = safeBaseTargets
      .map((kpi) => ({
        kpiId: kpi.kpiId,
        kpiCode: kpi.kpiCode,
        kpiName: kpi.kpiName,
        assignedOfficeIds: assignments.get(kpi.kpiId) || new Set<string>(),
        officeDistributions: officeDistributions.get(kpi.kpiId) || new Map<string, number>(),
      }))
      .filter((assignment) => assignment.assignedOfficeIds.size > 0)

    onComplete(results)
  }

  const isSumAggregation = currentKPI.aggregationMethod === 'SUM'
  const baseTarget = currentKPI.baseTargetValue ?? 0
  const isFullyDistributed =
    isSumAggregation &&
    baseTarget > 0 &&
    distributionTotal !== null &&
    Math.abs(distributionTotal - baseTarget) < 0.01

  return (
    <div className="space-y-6">
      {/* ── Top Header & KPI Stepper Ribbon ── */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Step 3: Assign Delivery Units & Distribute Targets
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign offices and distribute target quotas across departments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold text-xs">
                KPI {currentKpiIndex + 1} of {safeBaseTargets.length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Horizontal KPI Selector Carousel */}
        <div className="px-4 py-3 bg-muted/10 border-b overflow-x-auto flex items-center gap-2 scrollbar-thin">
          {safeBaseTargets.map((kpi, idx) => {
            const isSelected = idx === currentKpiIndex
            const kpiAssigned = assignments.get(kpi.kpiId)
            const hasOffices = Boolean(kpiAssigned && kpiAssigned.size > 0)

            return (
              <button
                key={kpi.kpiId}
                type="button"
                onClick={() => {
                  setCurrentKpiIndex(idx)
                  setSearchQuery('')
                  setValidationError(null)
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : hasOffices
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent/60',
                )}
              >
                {hasOffices ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Layers className="w-3.5 h-3.5" />}
                <span>{kpi.kpiCode || `KPI #${idx + 1}`}</span>
                {kpiAssigned && kpiAssigned.size > 0 && (
                  <span className="text-[10px] opacity-80 font-normal">({kpiAssigned.size})</span>
                )}
              </button>
            )
          })}
        </div>

        <CardContent className="pt-4 space-y-4">
          {/* Active KPI Highlight Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-950 text-base">{currentKPI.kpiCode}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-semibold',
                      currentKPI.aggregationMethod === 'SUM'
                        ? 'bg-orange-100 text-orange-900 border-orange-300'
                        : 'bg-blue-100 text-blue-900 border-blue-300',
                    )}
                  >
                    {currentKPI.aggregationMethod}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-blue-900 mt-1">{currentKPI.kpiName}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-blue-700 font-semibold">Base Target</div>
                  <div className="text-xl font-black text-blue-950">
                    {currentKPI.baseTargetValue ?? 0}{' '}
                    <span className="text-xs font-normal text-blue-800">
                      {currentKPI.unitOfMeasure || currentKPI.measurementUnit || ''}
                    </span>
                  </div>
                </div>
                <div className="text-right border-l pl-3 border-blue-200">
                  <div className="text-xs text-blue-700 font-semibold">Assigned Offices</div>
                  <div className="text-xl font-black text-blue-950">
                    {currentAssigned.size}{' '}
                    <span className="text-xs font-normal text-blue-800">/ {safeAvailableOffices.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aggregation Summary Helper */}
            {isSumAggregation && baseTarget > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="text-orange-900 font-medium">
                  ⚖️ <span className="font-bold">SUM Aggregation:</span> Office values must sum to{' '}
                  <span className="font-bold">{baseTarget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Distributed:</span>
                  <span
                    className={cn(
                      'font-bold px-2 py-0.5 rounded text-xs',
                      isFullyDistributed ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900',
                    )}
                  >
                    {distributionTotal !== null ? distributionTotal.toFixed(2) : 0} / {baseTarget}
                  </span>
                  {isFullyDistributed && <span className="text-emerald-700 font-bold">✓ Balanced</span>}
                </div>
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Search & Quick Action Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search delivery units / offices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-9"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
                {currentAssigned.size === safeAvailableOffices.length ? 'Deselect All' : 'Select All & Distribute'}
              </Button>
            </div>
          </div>

          {/* Office Grid / Selection List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto p-1 border rounded-lg">
            {filteredOffices.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-muted-foreground text-sm">
                No delivery units matching "{searchQuery}"
              </div>
            ) : (
              filteredOffices.map((office) => {
                const isSelected = currentAssigned.has(office.id)
                const canAddThisOffice = isSelected || !isFullyDistributed
                const distribution = officeDistributions.get(currentKPI.kpiId)?.get(office.id) ?? null
                const val = getDistributionValidation(distribution)

                return (
                  <div
                    key={office.id}
                    className={cn(
                      'flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-blue-50/60 border-blue-300 shadow-2xs'
                        : canAddThisOffice
                          ? 'bg-card border-border hover:bg-accent/40'
                          : 'bg-muted/40 border-dashed border-border opacity-70 cursor-not-allowed',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Checkbox
                        id={`office-${office.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleOffice(office.id)}
                        disabled={!canAddThisOffice}
                      />
                      <label
                        htmlFor={`office-${office.id}`}
                        className={cn(
                          'text-sm font-medium truncate cursor-pointer select-none',
                          !canAddThisOffice && !isSelected && 'text-muted-foreground cursor-not-allowed',
                        )}
                      >
                        {office.name}
                      </label>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min="0"
                          step={isIntegerMeasurementUnit(currentKPI.measurementUnit || currentKPI.unitOfMeasure) ? '1' : '0.01'}
                          value={distribution ?? ''}
                          onChange={(e) => handleUpdateDistribution(office.id, e.target.value)}
                          placeholder="Target"
                          className={cn(
                            'w-24 h-8 text-right font-semibold text-xs',
                            distribution !== null && !val.isValid && 'border-red-500 bg-red-50 text-red-900',
                          )}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>

        {/* Step Actions Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Target Setting
            </Button>
            {currentKpiIndex > 0 && (
              <Button type="button" variant="ghost" onClick={handlePrevKpi} disabled={isSubmitting} className="gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous KPI
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentKpiIndex < safeBaseTargets.length - 1 ? (
              <Button type="button" onClick={handleNextKpi} disabled={isSubmitting} className="bg-primary gap-1.5">
                <span>Next KPI</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={compileAndComplete}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
              >
                <span>Proceed to Review & Finalize</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default OfficeAssignmentStep
