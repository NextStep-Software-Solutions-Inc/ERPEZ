/**
 * Step 3.1: Base KPI Targets Form
 * 
 * Planning officers define which KPIs will be targeted and their base values
 * These base targets will be distributed to offices in later steps
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronRight, AlertCircle, Info, Lock, Unlock, MoreHorizontal } from 'lucide-react'
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'

interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  isSelected: boolean
  isLocked: boolean
  status?: string
  isDraft: boolean
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

interface BaseKPITargetsFormProps {
  activeKPIs: ActivatedKPI[]
  onComplete: (baseTargets: BaseKPITarget[]) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isFiscalYearLocked?: boolean
}

export function BaseKPITargetsForm({
  activeKPIs,
  onComplete,
  onCancel,
  isSubmitting = false,
  isFiscalYearLocked = false,
}: BaseKPITargetsFormProps) {
  const [targets, setTargets] = useState<BaseKPITarget[]>(() => {
    const list = activeKPIs.map((kpi) => {
      const agencyTarget = kpi.agencyTargetAnnual ?? null
      const statusLower = (kpi.status || '').toLowerCase()
      const isAssignedOrEstablished = isFiscalYearLocked || kpi.isLocked || statusLower === 'assigned' || statusLower === 'established'
      const isDraftStatus = !isAssignedOrEstablished && (!kpi.status || statusLower === 'draft' || agencyTarget === null)
      return {
        kpiId: kpi.id,
        kpiCode: kpi.kpiCode || '',
        kpiName: kpi.kpiName,
        aggregationMethod: kpi.aggregationMethod || 'SUM',
        baseTargetValue: agencyTarget,
        q1: kpi.agencyTargetQ1 ?? null,
        q2: kpi.agencyTargetQ2 ?? null,
        q3: kpi.agencyTargetQ3 ?? null,
        q4: kpi.agencyTargetQ4 ?? null,
        isSelected: !isAssignedOrEstablished,
        isLocked: kpi.isLocked || isAssignedOrEstablished,
        status: kpi.status || (isAssignedOrEstablished ? 'Assigned' : 'Draft'),
        isDraft: isDraftStatus,
        unitOfMeasure: kpi.unitOfMeasure,
        measurementUnit: kpi.measurementUnit,
      }
    })
    // Sort Draft KPIs to top so user can edit them first
    return list.sort((a, b) => (b.isDraft ? 1 : 0) - (a.isDraft ? 1 : 0))
  })

  // Re-sync targets state when activeKPIs prop updates asynchronously with assignment status
  useEffect(() => {
    if (!activeKPIs || activeKPIs.length === 0) return
    const list = activeKPIs.map((kpi) => {
      const agencyTarget = kpi.agencyTargetAnnual ?? null
      const statusLower = (kpi.status || '').toLowerCase()
      const isAssignedOrEstablished = isFiscalYearLocked || kpi.isLocked || statusLower === 'assigned' || statusLower === 'established'
      const isDraftStatus = !isAssignedOrEstablished && (!kpi.status || statusLower === 'draft' || agencyTarget === null)
      return {
        kpiId: kpi.id,
        kpiCode: kpi.kpiCode || '',
        kpiName: kpi.kpiName,
        aggregationMethod: kpi.aggregationMethod || 'SUM',
        baseTargetValue: agencyTarget,
        q1: kpi.agencyTargetQ1 ?? null,
        q2: kpi.agencyTargetQ2 ?? null,
        q3: kpi.agencyTargetQ3 ?? null,
        q4: kpi.agencyTargetQ4 ?? null,
        isSelected: !isAssignedOrEstablished,
        isLocked: kpi.isLocked || isAssignedOrEstablished,
        status: kpi.status || (isAssignedOrEstablished ? 'Assigned' : 'Draft'),
        isDraft: isDraftStatus,
        unitOfMeasure: kpi.unitOfMeasure,
        measurementUnit: kpi.measurementUnit,
      }
    })
    setTargets(list.sort((a, b) => (b.isDraft ? 1 : 0) - (a.isDraft ? 1 : 0)))
  }, [activeKPIs, isFiscalYearLocked])

  const updateTarget = (kpiId: string, updates: Partial<BaseKPITarget>) => {
    setTargets(
      targets.map((t) => {
        if (t.kpiId === kpiId) {
          const updated = { ...t, ...updates }
          if (!isTargetEditable(updated)) {
            updated.isSelected = false
          }
          // Clear draft state when valid target is set for editable KPIs
          if (updates.baseTargetValue !== undefined && isTargetEditable(t)) {
            updated.isDraft = updates.baseTargetValue === null || updates.baseTargetValue === undefined
          }
          return updated
        }
        return t
      })
    )
  }

  const toggleKPI = (kpiId: string) => {
    const target = targets.find((t) => t.kpiId === kpiId)
    if (!target || !isTargetEditable(target)) return
    updateTarget(kpiId, { isSelected: !target.isSelected })
  }

  const toggleLock = (kpiId: string) => {
    const target = targets.find((t) => t.kpiId === kpiId)
    if (!target) return

    const origKpi = activeKPIs.find((k) => k.id === kpiId || (k as any).kpiId === kpiId)
    if (isFiscalYearLocked || origKpi?.isLocked) {
      toast.error('This KPI is locked for the fiscal year. Unlock KPIs in Step 2 to edit target values.', {
        id: 'fy-locked-toast',
      })
      return
    }

    const statusLower = (target.status || '').toLowerCase()
    if (statusLower === 'assigned' || statusLower === 'established') {
      toast.error('This KPI is assigned and approved in OPCR. It cannot be unlocked.', {
        id: 'opcr-locked-toast',
      })
      return
    }
    updateTarget(kpiId, { isLocked: !target.isLocked })
  }

  const isTargetEditable = (target: BaseKPITarget) => {
    const origKpi = activeKPIs.find((k) => k.id === target.kpiId || (k as any).kpiId === target.kpiId)
    if (isFiscalYearLocked || target.isLocked || origKpi?.isLocked) return false
    const statusLower = (target.status || '').toLowerCase()
    if (statusLower === 'assigned' || statusLower === 'established') return false
    return true
  }

  const editableTargets = targets.filter(isTargetEditable)
  const selectedTargets = targets.filter((t) => t.isSelected && isTargetEditable(t))
  const isAllEditableSelected = selectedTargets.length === editableTargets.length && editableTargets.length > 0
  const draftTargets = targets.filter((t) => t.isDraft)
  const draftCount = draftTargets.length

  const isMustDistribute = (target: BaseKPITarget): boolean => {
    return target.aggregationMethod === 'SUM' && (target.baseTargetValue ?? 0) > 0
  }

  const handleProceed = () => {
    const toSubmit = selectedTargets.filter((t) => isTargetEditable(t))
    if (toSubmit.length === 0 && targets.every((t) => !isTargetEditable(t))) {
      onComplete(targets)
      return
    }
    if (toSubmit.length === 0) {
      toast.error('Please select at least one editable KPI to set target values')
      return
    }

    const invalidTargets = toSubmit.filter(
      (t) => t.baseTargetValue === null || t.baseTargetValue === undefined || t.baseTargetValue < 0
    )

    if (invalidTargets.length > 0) {
      toast.error(
        `Please set valid non-negative base targets for: ${invalidTargets.map((t) => t.kpiCode || t.kpiName).join(', ')}`
      )
      return
    }

    onComplete(toSubmit)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Define Base KPI Targets</h2>
        <p className="text-sm text-blue-700">
          Select active KPIs and set their base target values. These targets will be distributed
          to offices in the next steps for negotiation and finalization.
        </p>
      </div>

      {/* Draft KPI Alert Banner */}
      {draftCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-full text-amber-700">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {draftCount} Draft KPI{draftCount > 1 ? 's' : ''} Require Target Setup
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Draft KPIs are highlighted in yellow and listed at the top. Please enter their base targets before proceeding.
              </p>
            </div>
          </div>
          <Badge className="bg-amber-200 text-amber-900 border-amber-400 font-bold px-3 py-1 text-xs">
            Action Required
          </Badge>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{targets.length}</div>
          <div className="text-xs text-blue-700 font-medium">Total Active KPIs</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{selectedTargets.length}</div>
          <div className="text-xs text-green-700 font-medium">Selected for Targeting</div>
        </Card>
        <Card className={`p-3 border ${draftCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-2xl font-bold ${draftCount > 0 ? 'text-amber-600' : 'text-gray-600'}`}>{draftCount}</div>
          <div className={`text-xs font-medium ${draftCount > 0 ? 'text-amber-800' : 'text-gray-600'}`}>
            Draft KPIs (Needs Target)
          </div>
        </Card>
      </div>

      {/* Base Targets Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 w-8">
                  <Checkbox
                    checked={isAllEditableSelected}
                    disabled={editableTargets.length === 0}
                    onCheckedChange={() => {
                      const nextState = !isAllEditableSelected
                      targets.forEach((t) => {
                        if (isTargetEditable(t)) {
                          updateTarget(t.kpiId, { isSelected: nextState })
                        }
                      })
                    }}
                  />
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">KPI Code</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">KPI Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Aggregation</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Base Target</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q1</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q2</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q3</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q4</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                    No active KPIs available
                  </td>
                </tr>
              ) : (
                targets.map((target, idx) => {
                  const isDraftRow = target.isDraft
                  return (
                    <tr
                      key={target.kpiId}
                      className={`border-b transition-colors ${
                        isDraftRow
                          ? 'bg-amber-50/80 hover:bg-amber-100/80 border-l-4 border-l-amber-500'
                          : target.isSelected
                            ? 'bg-blue-50/60'
                            : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50'
                      }`}
                    >
                      {/* Select */}
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isTargetEditable(target) && target.isSelected}
                          onCheckedChange={() => toggleKPI(target.kpiId)}
                          disabled={!isTargetEditable(target)}
                        />
                      </td>

                      {/* KPI Code */}
                      <td className="px-4 py-3 font-semibold text-gray-900">{target.kpiCode}</td>

                      {/* KPI Name */}
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{target.kpiName}</td>

                      {/* Aggregation */}
                      <td className="px-4 py-3 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isMustDistribute(target)
                              ? 'bg-orange-50 border-orange-300 text-orange-700'
                              : ''
                          }`}
                        >
                          {target.aggregationMethod}
                        </Badge>
                        {isMustDistribute(target) && (
                          <Badge className="text-xs bg-orange-100 text-orange-800 border-0">
                            Must Distribute
                          </Badge>
                        )}
                      </td>

                      {/* Base Target */}
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step={isIntegerMeasurementUnit(target.measurementUnit || target.unitOfMeasure) ? "1" : "0.01"}
                          value={target.baseTargetValue ?? ''}
                          onChange={(e) =>
                            updateTarget(target.kpiId, {
                              baseTargetValue:
                                e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          disabled={!isTargetEditable(target)}
                          className={`w-20 text-sm h-8 text-center border-gray-300 disabled:bg-gray-100 disabled:text-gray-900 disabled:opacity-100 disabled:cursor-not-allowed ${
                            isDraftRow ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-50 font-bold text-amber-900 placeholder:text-amber-400' : ''
                          }`}
                          placeholder="0"
                        />
                      </td>

                      {/* Q1-Q4 */}
                      {['q1', 'q2', 'q3', 'q4'].map((quarter) => (
                        <td key={quarter} className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step={isIntegerMeasurementUnit(target.measurementUnit || target.unitOfMeasure) ? "1" : "0.01"}
                            value={target[quarter as 'q1' | 'q2' | 'q3' | 'q4'] ?? ''}
                            onChange={(e) =>
                              updateTarget(target.kpiId, {
                                [quarter]:
                                  e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            disabled={!isTargetEditable(target)}
                            className="w-16 text-sm h-8 text-center border-gray-300 disabled:bg-gray-100 disabled:text-gray-900 disabled:opacity-100 disabled:cursor-not-allowed"
                            placeholder="0"
                          />
                        </td>
                      ))}

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        {isDraftRow ? (
                          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold gap-1 px-2.5 py-1 whitespace-nowrap">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                            Draft (Needs Target)
                          </Badge>
                        ) : (target.status?.toLowerCase() === 'assigned' || target.status?.toLowerCase() === 'established') ? (
                          <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-semibold gap-1 px-2.5 py-1 whitespace-nowrap">
                            <Lock className="w-3.5 h-3.5 text-purple-600 inline" />
                            Assigned (Approved in OPCR)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium px-2 py-0.5 whitespace-nowrap">
                            TargetsSet
                          </Badge>
                        )}
                      </td>

                      {/* Actions Dropdown */}
                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(() => {
                              const origKpi = activeKPIs.find((k) => k.id === target.kpiId || (k as any).kpiId === target.kpiId)
                              const isItemLocked = isFiscalYearLocked || Boolean(origKpi?.isLocked)
                              return (
                                <DropdownMenuItem
                                  onSelect={() => toggleLock(target.kpiId)}
                                  disabled={isItemLocked}
                                  className={
                                    isItemLocked
                                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                                      : target.isLocked
                                        ? 'text-red-600 cursor-pointer'
                                        : 'text-gray-600 cursor-pointer'
                                  }
                                >
                                  {isItemLocked ? (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Locked (Fiscal Year Locked)
                                    </>
                                  ) : target.isLocked ? (
                                    <>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Unlock Target
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Lock Target
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )
                            })()}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Base Target Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Select which KPIs will be included in this performance cycle</li>
              <li>Edit base target values and quarterly distributions anytime</li>
              <li>Lock targets to protect them from accidental changes in later steps</li>
              <li>Selected KPIs will be available for office assignment in the next step</li>
              <li className="text-orange-700 font-medium">
                KPIs marked "Must Distribute" (SUM aggregation with base target &gt; 0) must be assigned to offices, and office totals must equal the base target
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleProceed}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Saving targets...
            </>
          ) : (
            <>
              <span>Continue to Office Assignment</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

