import type { OPCR, OPCRDetails, OPCRItem } from '../types/type.opcr'

export interface OPCRReadinessResult {
  isReady: boolean
  errors: string[]
  warnings: string[]
  passedChecks: string[]
  kpiCount: number
  activityCount: number
  totalBudget: number
  itemsWithoutActivities: OPCRItem[]
  itemsWithoutTargets: OPCRItem[]
}

/**
 * Evaluates the readiness of an OPCR for submission.
 * Validates that:
 * 1. At least one KPI is assigned.
 * 2. Total activities > 0, and every assigned KPI has at least one activity.
 * 3. Every assigned KPI has quarterly targets set (Q1 + Q2 + Q3 + Q4 > 0).
 */
export function evaluateOPCRReadiness(
  opcr: OPCRDetails | OPCR | undefined | null,
): OPCRReadinessResult {
  const errors: string[] = []
  const warnings: string[] = []
  const passedChecks: string[] = []

  if (!opcr) {
    return {
      isReady: false,
      errors: ['No OPCR data available.'],
      warnings: [],
      passedChecks: [],
      kpiCount: 0,
      activityCount: 0,
      totalBudget: 0,
      itemsWithoutActivities: [],
      itemsWithoutTargets: [],
    }
  }

  const items = (opcr as OPCRDetails).opcrItems || []
  const kpiCount =
    (opcr as OPCRDetails).kpiAssignmentCount ?? items.length ?? 0

  const totalActivities =
    (opcr as OPCRDetails).activityCount ??
    items.reduce((sum, i) => sum + (i.opcrActivities?.length || 0), 0)

  const totalBudget = opcr.totalBudget ?? 0

  // 1. KPI Assignment Check
  if (kpiCount === 0 || items.length === 0) {
    errors.push('At least one KPI must be assigned to this OPCR.')
  } else {
    passedChecks.push(`KPIs assigned (${kpiCount} KPI${kpiCount !== 1 ? 's' : ''}).`)
  }

  // 2. Activity Check
  const itemsWithoutActivities: OPCRItem[] = []
  if (items.length > 0) {
    if (totalActivities === 0) {
      errors.push('At least one activity must be added to this OPCR.')
    }

    items.forEach((item) => {
      const actCount = item.opcrActivities?.length || 0
      if (actCount === 0) {
        itemsWithoutActivities.push(item)
        const name =
          item.kpiAssignment?.fyActiveKPI?.name ||
          item.kpiName ||
          item.KPI?.name ||
          'Assigned KPI'
        errors.push(`KPI "${name}" has no activities assigned.`)
      }
    })

    if (itemsWithoutActivities.length === 0 && totalActivities > 0) {
      passedChecks.push(
        `All assigned KPIs have activities configured (${totalActivities} activit${totalActivities !== 1 ? 'ies' : 'y'}).`,
      )
    }
  }

  // 3. Targets Configuration Check
  const itemsWithoutTargets: OPCRItem[] = []
  if (items.length > 0) {
    items.forEach((item) => {
      const itemQSum =
        (item.q1Target || 0) +
        (item.q2Target || 0) +
        (item.q3Target || 0) +
        (item.q4Target || 0)

      const assignedQSum =
        (item.kpiAssignment?.assignedTargetQ1 || 0) +
        (item.kpiAssignment?.assignedTargetQ2 || 0) +
        (item.kpiAssignment?.assignedTargetQ3 || 0) +
        (item.kpiAssignment?.assignedTargetQ4 || 0)

      const effectiveQuarterSum = Math.max(itemQSum, assignedQSum)

      if (effectiveQuarterSum <= 0) {
        itemsWithoutTargets.push(item)
        const name =
          item.kpiAssignment?.fyActiveKPI?.name ||
          item.kpiName ||
          item.KPI?.name ||
          'Assigned KPI'
        errors.push(
          `KPI "${name}" has no quarterly targets set. Please configure quarterly targets.`,
        )
      }
    })

    if (itemsWithoutTargets.length === 0) {
      passedChecks.push('Quarterly targets configured for all KPIs.')
    }
  }

  return {
    isReady: errors.length === 0,
    errors,
    warnings,
    passedChecks,
    kpiCount,
    activityCount: totalActivities,
    totalBudget,
    itemsWithoutActivities,
    itemsWithoutTargets,
  }
}
