/**
 * Deep Copy Logic for KPI Snapshots
 * 
 * When a KPI is activated for a fiscal year, a deep copy (snapshot) is created
 * This allows year-specific modifications without affecting the Master Library
 */

import type { AggregationMethod, ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'

import type { RatingScaleMatrix } from '@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs'

export interface KPISnapshotInput {
  kpiId: string
  kpiName: string
  kpiCode?: string
  description?: string
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  activationType: 'Mandated' | 'AvailableForShopping'
  defaultAggregation: AggregationMethod
  ratingMatrix?: RatingScaleMatrix[]
  assignedBy?: string
}

/**
 * Creates a deep copy (snapshot) of a KPI for a specific fiscal year
 */
export function createKPISnapshot(
  input: KPISnapshotInput,
  fiscalYearId: string,
  overrides?: {
    aggregationMethod?: AggregationMethod
    modificationNotes?: string
    ratingMatrix?: RatingScaleMatrix[]
  }
): ActivatedKPI {
  const aggregationMethod = overrides?.aggregationMethod || input.defaultAggregation

  return {
    id: `snap-${input.kpiId}-${fiscalYearId}-${Date.now()}`,
    fiscalYearId,
    kpiId: input.kpiId,
    kpiName: input.kpiName,
    kpiCode: input.kpiCode,
    description: input.description,
    functionType: input.functionType,
    activationType: input.activationType,
    isLocked: false,
    assignedBy: input.assignedBy,
    assignedAt: new Date().toISOString(),
    allowOfficeOverride: input.activationType === 'AvailableForShopping',
    aggregationMethod,
    ratingMatrix: overrides?.ratingMatrix ? deepCopy(overrides.ratingMatrix) : deepCopy(input.ratingMatrix),
    isModified: aggregationMethod !== input.defaultAggregation || overrides?.modificationNotes !== undefined,
    modificationNotes: overrides?.modificationNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Updates aggregation method on an activated KPI snapshot
 * Marks it as modified if different from default
 */
export function updateKPIAggregationMethod(
  kpi: ActivatedKPI,
  newAggregation: AggregationMethod,
  modificationNotes?: string
): ActivatedKPI {
  const defaultAgg = kpi.aggregationMethod // Store original
  
  return {
    ...kpi,
    aggregationMethod: newAggregation,
    isModified: newAggregation !== defaultAgg || modificationNotes !== undefined,
    modificationNotes: modificationNotes || kpi.modificationNotes,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Deep copy utility for nested objects and arrays
 */
function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    const copy: any[] = []
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i])
    }
    return copy as any
  }

  if (obj instanceof Object) {
    const copy = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        ;(copy as any)[key] = deepCopy((obj as any)[key])
      }
    }
    return copy
  }

  return obj
}

/**
 * Validates if a snapshot differs from the original
 */
export function detectKPIChanges(original: any, snapshot: ActivatedKPI): string[] {
  const changes: string[] = []

  if (original.aggregationMethod !== snapshot.aggregationMethod) {
    changes.push(`Aggregation method changed from ${original.aggregationMethod} to ${snapshot.aggregationMethod}`)
  }

  if (JSON.stringify(original.ratingMatrix) !== JSON.stringify(snapshot.ratingMatrix)) {
    changes.push('Rating matrix modified')
  }

  if (original.description !== snapshot.description) {
    changes.push('Description updated')
  }

  return changes
}
