/**
 * Office Assignment Dialog (Step 3.2)
 * 
 * Walks through each base KPI and asks which offices should receive it
 * For SUM aggregation KPIs, enforces that office target distributions must sum to base target
 */

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronRight, Search, AlertCircle } from 'lucide-react'

interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  unitOfMeasure?: string
  measurementUnit?: string
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

interface OfficeAssignmentDialogProps {
  open: boolean
  baseTargets: BaseKPITarget[]
  availableOffices: Array<{ id: string; name: string }>
  onComplete: (assignments: Array<{
    kpiId: string
    kpiCode: string
    kpiName: string
    assignedOfficeIds: Set<string>
    officeDistributions: Map<string, number>
  }>) => void
  onOpenChange: (open: boolean) => void
  currentKpiIndex?: number
  initialAssignments?: Array<{
    kpiId: string
    assignedOfficeIds: Set<string>
    officeDistributions?: Map<string, number>
  }>
}

export function OfficeAssignmentDialog({
  open,
  baseTargets,
  availableOffices,
  onComplete,
  onOpenChange,
  currentKpiIndex = 0,
  initialAssignments,
}: OfficeAssignmentDialogProps) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic
  // This ensures React sees consistent hook count on every render
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map())
  const [officeDistributions, setOfficeDistributions] = useState<Map<string, Map<string, number>>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(currentKpiIndex)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open && initialAssignments) {
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
  }, [open, initialAssignments])

  // Safely access current KPI with defaults
  const safeBaseTargets = baseTargets || []
  const safeAvailableOffices = availableOffices || []
  const currentKPI = safeBaseTargets[Math.min(currentIndex, safeBaseTargets.length - 1)]
  const currentAssigned: Set<string> = currentKPI ? (assignments.get(currentKPI.kpiId) || new Set<string>()) : new Set<string>()
  const filteredOffices = safeAvailableOffices.filter((office) =>
    office.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // USEMEMO HOOKS - called before guard checks
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

  // GUARD CHECK - after all hooks
  if (!currentKPI || safeAvailableOffices.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Offices to KPIs</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500 text-center py-6">
            {!currentKPI ? 'No base KPI targets available for office assignment.' : 'No offices available for assignment.'}
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  const handleToggleOffice = (officeId: string) => {
    const updated = new Set<string>(currentAssigned)
    const distributions = new Map(officeDistributions.get(currentKPI.kpiId) || new Map())

    if (updated.has(officeId)) {
      // Removing office - delete its distribution
      updated.delete(officeId)
      distributions.delete(officeId)
    } else {
      // Adding office - auto-populate distribution based on aggregation type
      updated.add(officeId)
      const baseTarget = currentKPI.baseTargetValue ?? 0
      
      if (currentKPI.aggregationMethod === 'SUM') {
        // For SUM: default new office to remaining undistributed target
        const currentSum = Array.from(currentAssigned).reduce((acc, id) => acc + (distributions.get(id) || 0), 0)
        const remaining = Math.max(0, baseTarget - currentSum)
        if (remaining > 0) {
          distributions.set(officeId, remaining)
        } else if (baseTarget > 0 && currentAssigned.size === 0) {
          distributions.set(officeId, baseTarget)
        }
      } else {
        // OTHER aggregations: set to base target automatically
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
      // Unselect all
      setAssignments(new Map(assignments).set(currentKPI.kpiId, new Set()))
      setOfficeDistributions(new Map(officeDistributions).set(currentKPI.kpiId, new Map()))
    } else {
      // Select all and auto-populate distributions
      const baseTarget = currentKPI.baseTargetValue ?? 0
      const officeCount = safeAvailableOffices.length
      const unit = currentKPI.measurementUnit || currentKPI.unitOfMeasure
      const isIntegerUnit = isIntegerMeasurementUnit(unit)

      if (currentKPI.aggregationMethod === 'SUM') {
        if (baseTarget > 0 && officeCount > 0) {
          if (isIntegerUnit) {
            // Integer counting numbers: distribute whole integers so sum equals baseTarget without decimals!
            const baseAmount = Math.floor(baseTarget / officeCount)
            let remainder = baseTarget - (baseAmount * officeCount)
            safeAvailableOffices.forEach((office) => {
              const portion = baseAmount + (remainder > 0 ? 1 : 0)
              if (remainder > 0) remainder--
              distributions.set(office.id, portion)
            })
          } else {
            // Percentage / decimal units: divide into clean 2-decimal numbers
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

  // Helper to validate office distribution value based on aggregation type
  const getDistributionValidation = (value: number | null): { isValid: boolean; error?: string } => {
    if (!currentKPI || value === null) {
      return { isValid: true }
    }

    const baseTarget = currentKPI.baseTargetValue ?? 0
    const isSumAggregation = currentKPI.aggregationMethod === 'SUM'

    if (isSumAggregation) {
      // SUM: values must be between 1 and baseTarget
      if (baseTarget > 0) {
        if (value < 1) return { isValid: false, error: 'Min 1' }
        if (value > baseTarget) return { isValid: false, error: `Max ${baseTarget}` }
      } else {
        // No base target: allow 0 and above
        if (value < 0) return { isValid: false, error: 'Min 0' }
      }
    } else {
      // OTHER aggregations: each office must equal base target
      if (baseTarget > 0) {
        if (value !== baseTarget) return { isValid: false, error: `Must be ${baseTarget}` }
      } else {
        // No base target: allow 0 and above
        if (value < 0) return { isValid: false, error: 'Min 0' }
      }
    }
    return { isValid: true }
  }

  const handleNext = () => {
    const baseTarget = currentKPI.baseTargetValue ?? 0
    const isSumAggregation = currentKPI.aggregationMethod === 'SUM'
    const distributions = officeDistributions.get(currentKPI.kpiId) || new Map()

    // ALL aggregation types: check all selected offices have values > 0
    for (const officeId of currentAssigned) {
      const value = distributions.get(officeId) ?? 0
      if (value <= 0) {
        setValidationError(
          `All selected offices must have a target value greater than 0. Some offices have 0 or no value assigned.`
        )
        return
      }
    }

    // Check all values are within valid range (only for selected offices)
    for (const officeId of currentAssigned) {
      const value = distributions.get(officeId)
      if (value !== undefined) {
        const validation = getDistributionValidation(value)
        if (!validation.isValid) {
          setValidationError(
            `Invalid distribution value: ${validation.error}. All office distributions must follow validation rules.`
          )
          return
        }
      }
    }

    // SUM-specific validation: distributions must sum to base target
    if (isSumAggregation && baseTarget > 0) {
      const totalDistributed: number = Array.from(currentAssigned).reduce<number>((sum, officeId) => {
        return sum + (distributions.get(officeId) ?? 0)
      }, 0)
      const isValid = Math.abs(totalDistributed - baseTarget) < 0.01 // Allow floating point tolerance
      
      if (!isValid) {
        setValidationError(
          `SUM aggregation KPI must have office distributions totaling the base target (${baseTarget}). Current total: ${totalDistributed.toFixed(2)}`
        )
        return
      }
    }

    // OTHER aggregation: verify each office has base target value
    if (!isSumAggregation && baseTarget > 0) {
      for (const officeId of currentAssigned) {
        const value = distributions.get(officeId) ?? 0
        if (value !== baseTarget) {
          setValidationError(
            `${currentKPI.aggregationMethod} aggregation: All selected offices must have a target value of ${baseTarget}. Each office receives the full base target.`
          )
          return
        }
      }
    }
    
    setValidationError(null)

    if (currentIndex < safeBaseTargets.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSearchQuery('')
    } else {
      // All done - compile results (only include KPIs that have assigned offices)
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
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSearchQuery('')
    }
  }

  const progress = ((currentIndex + 1) / safeBaseTargets.length) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0" size='2xl'>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Assign Offices to KPIs</DialogTitle>
          <DialogDescription>
            KPI {currentIndex + 1} of {safeBaseTargets.length}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1 min-h-0">
          {/* KPI Info */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{currentKPI.kpiCode}</h3>
                <p className="text-sm text-gray-700 mt-1">{currentKPI.kpiName}</p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`${
                    currentKPI.aggregationMethod === 'SUM'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentKPI.aggregationMethod}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {currentAssigned.size} / {safeAvailableOffices.length}
                </Badge>
              </div>
            </div>
            {currentKPI.baseTargetValue && (
              <p className="text-xs text-gray-600 mt-2">
                Base Target: <span className="font-semibold">{currentKPI.baseTargetValue}</span>
              </p>
            )}
            
            {/* SUM Aggregation Info */}
            {currentKPI.aggregationMethod === 'SUM' && currentKPI.baseTargetValue && (
              <p className="text-xs text-orange-700 mt-2">
                ⚠️ <span className="font-semibold">SUM Aggregation:</span> Office distributions must sum to <span className="font-semibold">{currentKPI.baseTargetValue}</span>
                {distributionTotal !== null && (
                  <span
                    className={`ml-2 ${
                      Math.abs(distributionTotal - (currentKPI.baseTargetValue ?? 0)) < 0.01
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    (Current: {distributionTotal.toFixed(2)})
                  </span>
                )}
                {distributionTotal !== null &&
                  Math.abs(distributionTotal - (currentKPI.baseTargetValue ?? 0)) < 0.01 && (
                    <span className="block text-green-700 font-medium mt-1">
                      ✓ Target fully distributed - no more offices can be added
                    </span>
                  )}
                {!allSelectedOfficesHaveValues && (
                  <span className="block text-red-700 font-medium mt-1">
                    ⚠️ All selected offices must receive a value - none can be 0
                  </span>
                )}
              </p>
            )}

            {/* OTHER Aggregations Info */}
            {currentKPI.aggregationMethod !== 'SUM' && currentKPI.baseTargetValue && (
              <p className="text-xs text-blue-700 mt-2">
                ℹ️ <span className="font-semibold">{currentKPI.aggregationMethod} Aggregation:</span> Each selected office receives the full base target value of <span className="font-semibold">{currentKPI.baseTargetValue}</span>
              </p>
            )}

            {/* No Base Target Info */}
            {!currentKPI.baseTargetValue && (
              <p className="text-xs text-blue-700 mt-2">
                ℹ️ No base target set. Each office value can be greater than or equal to 0.
              </p>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search offices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          {/* Office List */}
          <div className="space-y-2">
            {/* Select All */}
            {(() => {
              const isSumAggregation = currentKPI.aggregationMethod === 'SUM'
              const baseTarget = currentKPI.baseTargetValue ?? 0
              const isFullyDistributed =
                isSumAggregation &&
                baseTarget > 0 &&
                distributionTotal !== null &&
                Math.abs(distributionTotal - baseTarget) < 0.01
              const canSelectMore = !isFullyDistributed || currentAssigned.size > 0

              return (
                <div
                  className={`flex items-center space-x-2 p-3 rounded border transition-colors ${
                    canSelectMore
                      ? 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                      : 'border-red-200 bg-red-50 cursor-not-allowed'
                  }`}
                >
                  <Checkbox
                    checked={currentAssigned.size === safeAvailableOffices.length && safeAvailableOffices.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={isFullyDistributed && currentAssigned.size === 0}
                  />
                  <label
                    className={`text-sm font-medium flex-1 ${
                      canSelectMore ? 'text-gray-700 cursor-pointer' : 'text-red-700'
                    }`}
                  >
                    Select All Offices
                    {isFullyDistributed && (
                      <span className="text-xs text-red-600 ml-2">(Target fully distributed)</span>
                    )}
                  </label>
                </div>
              )
            })()}

            {/* Individual Offices */}
            {filteredOffices.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No offices match "{searchQuery}"</p>
              </div>
            ) : (
              filteredOffices.map((office) => {
                const isSelected = currentAssigned.has(office.id)
                const isSumAggregation = currentKPI.aggregationMethod === 'SUM'
                const baseTarget = currentKPI.baseTargetValue ?? 0
                const isFullyDistributed =
                  isSumAggregation &&
                  baseTarget > 0 &&
                  distributionTotal !== null &&
                  Math.abs(distributionTotal - baseTarget) < 0.01
                const canAddThisOffice = isSelected || !isFullyDistributed
                const distribution = officeDistributions.get(currentKPI.kpiId)?.get(office.id) ?? null
                
                return (
                  <div
                    key={office.id}
                    className={`flex items-center space-x-2 p-3 rounded border transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50'
                        : canAddThisOffice
                          ? 'border-gray-200 hover:bg-gray-50'
                          : 'border-red-200 bg-red-50 cursor-not-allowed'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleOffice(office.id)}
                      disabled={!canAddThisOffice}
                    />
                    <label className={`text-sm flex-1 ${canAddThisOffice ? 'cursor-pointer' : 'text-red-700'}`}>
                      <span className="text-gray-700">{office.name}</span>
                      {!canAddThisOffice && !isSelected && (
                        <span className="text-xs text-red-600 ml-2">(Target consumed)</span>
                      )}
                    </label>
                    {isSelected && (
                      <div className="flex flex-col items-end gap-1">
                        {(() => {
                          const unit = currentKPI.measurementUnit || currentKPI.unitOfMeasure
                          const isIntegerUnit = isIntegerMeasurementUnit(unit)
                          return (
                            <Input
                              type="number"
                              min="0"
                              step={isIntegerUnit ? "1" : "0.01"}
                              value={distribution ?? ''}
                              onChange={(e) => handleUpdateDistribution(office.id, e.target.value)}
                              placeholder="0"
                              className={`w-24 text-sm h-8 text-right ${
                                distribution !== null && !getDistributionValidation(distribution).isValid
                                  ? 'border-red-500 bg-red-50'
                                  : ''
                              }`}
                            />
                          )
                        })()}
                        {distribution !== null && !getDistributionValidation(distribution).isValid && (
                          <span className="text-xs text-red-600 font-medium">
                            {getDistributionValidation(distribution).error}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between bg-gray-50 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={Boolean(
              currentAssigned.size === 0 ||
              !allSelectedOfficesHaveValues ||
              (currentKPI.aggregationMethod === 'SUM' &&
                currentKPI.baseTargetValue &&
                currentKPI.baseTargetValue > 0 &&
                (!distributionTotal || Math.abs(distributionTotal - currentKPI.baseTargetValue) >= 0.01)) ||
              // Check for invalid values in SUM aggregation (only selected offices)
              (() => {
                if (currentKPI.aggregationMethod !== 'SUM') return false
                const distributions = officeDistributions.get(currentKPI.kpiId) || new Map()
                for (const officeId of currentAssigned) {
                  const value = distributions.get(officeId)
                  if (value !== undefined && !getDistributionValidation(value).isValid) return true
                }
                return false
              })()
            )}
          >
            {currentIndex === baseTargets.length - 1 ? (
              <>
                <span>Complete Assignment</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <span>Next KPI</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
