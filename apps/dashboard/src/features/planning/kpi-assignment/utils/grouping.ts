/**
 * KPI Assignment Grouping Utilities
 * Functions to group and aggregate KPI assignment data
 */

import type { KPIAssignment } from '../types'
import type {
  OfficeGroup,
  FYGroup,
  AggregatedTargets,
  FunctionTypeGroup,
} from './grouping.types'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { normalizeFunctionType } from '@/pages/planning/commitments/utils/functions'

/**
 * Initialize aggregated targets (all zeros)
 */
const initializeTargets = (): AggregatedTargets => ({
  annual: 0,
  q1: 0,
  q2: 0,
  q3: 0,
  q4: 0,
})

/**
 * Add target value to aggregated targets
 */
const addTarget = (
  targets: AggregatedTargets,
  assignment: KPIAssignment,
): AggregatedTargets => ({
  annual: targets.annual + (assignment.assignedTargetAnnual ?? 0),
  q1: targets.q1 + (assignment.assignedTargetQ1 ?? 0),
  q2: targets.q2 + (assignment.assignedTargetQ2 ?? 0),
  q3: targets.q3 + (assignment.assignedTargetQ3 ?? 0),
  q4: targets.q4 + (assignment.assignedTargetQ4 ?? 0),
})

/**
 * Group KPI assignments by office (officeId + officeName)
 * Aggregates targets and metadata for display
 *
 * @param assignments - Array of KPI assignments
 * @returns Sorted array of office groups (A-Z by office name)
 */
export const groupByOffice = (assignments: KPIAssignment[]): OfficeGroup[] => {
  const officeMap = new Map<string, OfficeGroup>()

  assignments.forEach((assignment) => {
    const officeId = assignment.officeId
    const officeName = assignment.officeName ?? 'Unknown Office'

    if (!officeMap.has(officeId)) {
      officeMap.set(officeId, {
        id: officeId,
        name: officeName,
        assignmentCount: 0,
        kpiNames: [],
        aggregatedTargets: initializeTargets(),
        lockedCount: 0,
        unlockedCount: 0,
      })
    }

    const office = officeMap.get(officeId)!

    // Increment counters
    office.assignmentCount += 1
    if (assignment.isLocked) {
      office.lockedCount += 1
    } else {
      office.unlockedCount += 1
    }

    // Add KPI name if not already present
    const kpiName = assignment.fyActiveKPI?.name
    if (kpiName && !office.kpiNames.includes(kpiName)) {
      office.kpiNames.push(kpiName)
    }

    // Aggregate targets
    office.aggregatedTargets = addTarget(office.aggregatedTargets, assignment)
  })

  // Convert to array and sort A-Z by office name
  return Array.from(officeMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

/**
 * Group KPI assignments by fiscal year (from fyActiveKPI.fiscalYearId)
 * Aggregates targets and metadata for display
 *
 * @param assignments - Array of KPI assignments (pre-filtered by officeId if needed)
 * @returns Array of fiscal year groups
 */
export const groupByFiscalYear = (assignments: KPIAssignment[]): FYGroup[] => {
  const fyMap = new Map<string, FYGroup>()
  const uniqueKpisPerFY = new Map<string, Set<string>>()

  assignments.forEach((assignment) => {
    const fiscalYearId = assignment.fyActiveKPI?.fiscalYearId ?? 'unknown'

    if (!fyMap.has(fiscalYearId)) {
      fyMap.set(fiscalYearId, {
        fiscalYearId,
        kpiCount: 0,
        assignmentCount: 0,
        aggregatedTargets: initializeTargets(),
        lockedCount: 0,
        unlockedCount: 0,
      })
      uniqueKpisPerFY.set(fiscalYearId, new Set())
    }

    const fy = fyMap.get(fiscalYearId)!

    // Increment counters
    fy.assignmentCount += 1
    if (assignment.isLocked) {
      fy.lockedCount += 1
    } else {
      fy.unlockedCount += 1
    }

    // Count unique KPIs (by fyActiveKPIId)
    const kpiId = assignment.fyActiveKPI?.id
    if (kpiId) {
      uniqueKpisPerFY.get(fiscalYearId)!.add(kpiId)
      fy.kpiCount = uniqueKpisPerFY.get(fiscalYearId)!.size
    }

    // Aggregate targets
    fy.aggregatedTargets = addTarget(fy.aggregatedTargets, assignment)
  })

  // Convert to array - sorted by fiscal year (descending - newest first)
  return Array.from(fyMap.values()).sort((a, b) =>
    b.fiscalYearId.localeCompare(a.fiscalYearId),
  )
}

/**
 * Helper: Get unique KPI count from a list of assignments
 * More accurate count of distinct KPIs
 */
export const getUniqueKpiCount = (assignments: KPIAssignment[]): number => {
  const uniqueKpis = new Set(assignments.map((a) => a.fyActiveKPI?.id))
  return uniqueKpis.size
}

/**
 * Helper: Format aggregated targets for display
 * @returns Human-readable string (e.g., "Annual: 100, Q1: 25, Q2: 25, Q3: 25, Q4: 25")
 */
export const formatTargets = (targets: AggregatedTargets): string => {
  return `Annual: ${targets.annual}, Q1: ${targets.q1}, Q2: ${targets.q2}, Q3: ${targets.q3}, Q4: ${targets.q4}`
}

/**
 * Helper: Format lock status badge
 * @returns String like "2 locked / 5 total" or "5 unlocked" if none locked
 */
export const formatLockStatus = (
  lockedCount: number,
  totalCount: number,
): string => {
  if (lockedCount === 0) {
    return `${totalCount} unlocked`
  }
  return `${lockedCount} locked / ${totalCount} total`
}

/**
 * Group KPI assignments by function category
 * Used for Level 3 display - groups by function type with proper type-safe enums
 * Ensures all three function categories are displayed, even with 0 KPIs
 *
 * @param assignments - Array of KPI assignments (pre-filtered by officeId + fiscalYearId)
 * @returns Array of function type groups (always includes all three categories)
 */
export const groupByFunctionType = (
  assignments: KPIAssignment[],
): FunctionTypeGroup[] => {
  // Initialize map with all three function categories
  const ftMap = new Map<FunctionCategory, FunctionTypeGroup>()

  // Start with empty groups for all three categories
  Object.values(FunctionCategory).forEach((category) => {
    ftMap.set(category, {
      functionCategory: category,
      kpiCount: 0,
      assignmentCount: 0,
      kpiNames: [],
      aggregatedTargets: initializeTargets(),
      lockedCount: 0,
      unlockedCount: 0,
    })
  })

  // Process assignments and accumulate into categories
  assignments.forEach((assignment) => {
    // Normalize and type-safe the function category from API value
    const rawCategory = assignment.fyActiveKPI?.functionCategory ?? 'Unknown'
    const category = normalizeFunctionType(rawCategory)

    const ft = ftMap.get(category)
    if (ft) {
      // Increment counters
      ft.assignmentCount += 1
      if (assignment.isLocked) {
        ft.lockedCount += 1
      } else {
        ft.unlockedCount += 1
      }

      // Add KPI name if not already present
      const kpiName = assignment.fyActiveKPI?.name
      if (kpiName && !ft.kpiNames.includes(kpiName)) {
        ft.kpiNames.push(kpiName)
      }

      // Aggregate targets
      ft.aggregatedTargets = addTarget(ft.aggregatedTargets, assignment)
    }
  })

  // Convert to array, ensure kpiCount is set, and sort by function category enum order
  return Array.from(ftMap.values())
    .map((ft) => ({
      ...ft,
      kpiCount: ft.kpiNames.length, // Calculate unique KPI count from names
    }))
    .sort((a, b) => a.functionCategory.localeCompare(b.functionCategory))
}
