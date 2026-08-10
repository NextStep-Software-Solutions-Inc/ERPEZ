import { useEffect, useMemo } from 'react'
import {
  QUARTER_LABELS,
  determineTargetType,
  getQuarterIndex
} from '../types/kpiAssignment.types'
import type {ApiKpiTarget, TargetSummary} from '../types/kpiAssignment.types';
import type { FormType } from './CreateDuKpiAssignmentForm'

interface UseTargetSummariesProps {
  selectedKpiIds: Record<string, string>
  kpiTargets: any // from the query
  kpiAllocabilityMap: Record<string, boolean>
  form: FormType
}

export function useTargetSummaries({
  selectedKpiIds,
  kpiTargets,
  kpiAllocabilityMap,
  form
}: UseTargetSummariesProps) {
  const targetSummaries = useMemo<Record<number, Array<TargetSummary>>>(() => {
    const result: Record<number, Array<TargetSummary>> = {}
    const allTargets = (kpiTargets?.data ?? []) as Array<ApiKpiTarget>

    Object.entries(selectedKpiIds).forEach(([indexStr, kpiId]) => {
      const index = parseInt(indexStr)
      // Filter targets strictly by kpiId - avoid matching partial IDs
      const kpiTargetsList = allTargets.filter((target) => {
        const targetKpiId = target.kpiId ?? target.kpi?.id
        return targetKpiId === kpiId
      })
      const isKpiAllocable = kpiAllocabilityMap[kpiId] !== false
      const sortedTargets = [...kpiTargetsList].sort((a, b) => {
        const aIdx = getQuarterIndex(a.quarterName) ?? 99
        const bIdx = getQuarterIndex(b.quarterName) ?? 99
        return aIdx - bIdx
      })
      result[index] = sortedTargets.map((target, idx) => {
        const targetValue = target.targetValue ?? 0
        const remainingValue = target.remainingTargetValue ?? 0
        const allocatedValue = Math.max(targetValue - remainingValue, 0)
        const progress = targetValue === 0 ? 0 : Math.min(100, Math.round((allocatedValue / targetValue) * 100))
        const targetType = determineTargetType(target.period, target.quarterName)
        const quarterIndex = targetType === 'quarterly' ? (getQuarterIndex(target.quarterName) ?? idx) : undefined
        let label: string
        if (targetType === 'annual') {
          label = 'Annual Target'
        } else if (quarterIndex !== undefined && quarterIndex < 4) {
          label = QUARTER_LABELS[quarterIndex]
        } else {
          label = target.quarterName?.trim() || `Target ${idx + 1}`
        }
          const isReadOnly = !isKpiAllocable

          return {
            id: target.id || `${kpiId}-${idx}`,
            label,
            periodLabel: target.period?.trim() || 'Target',
            targetValue,
            allocatedValue,
            remainingValue,
            progress,
            isReadOnly,
            targetType,
            quarterIndex,
          }
        })
    })
    return result
  }, [selectedKpiIds, kpiTargets?.data, kpiAllocabilityMap])

  useEffect(() => {
    Object.entries(targetSummaries).forEach(([indexStr, summaries]) => {
      const index = parseInt(indexStr)
      const currentKpiTarget = form.getFieldValue(`kpiTargets[${index}]`)
      const currentAllocations = currentKpiTarget.allocations

      if (summaries.length > 0) {
        const needsUpdate = currentAllocations.length !== summaries.length ||
          summaries.some((s, idx) => {
            const currentAlloc = currentAllocations[idx]
            if (currentAlloc.targetId !== s.id) return true
            if (s.isReadOnly && currentAlloc.allocatedTargetValue !== s.remainingValue) return true
            return false
          })

        if (needsUpdate) {
          const newAllocations = summaries.map((s) => {
            const existingAlloc = currentAllocations.find((a: { targetId: string }) => a.targetId === s.id)
            return {
              targetId: s.id,
              allocatedTargetValue: s.isReadOnly
                ? s.remainingValue
                : (existingAlloc?.allocatedTargetValue ?? 0),
            }
          })
          form.setFieldValue(`kpiTargets[${index}].allocations`, newAllocations)
        }
      }
    })
  }, [targetSummaries, form])

  return targetSummaries
}