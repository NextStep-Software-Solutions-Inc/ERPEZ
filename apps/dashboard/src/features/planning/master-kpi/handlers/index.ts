/**
 * Master KPI API Handlers & Mock Data
 */
import { mockKpiDatabase } from '../data/mockDataKpi'
import {
  MasterKPI,
  MasterKPIFormValues,
  KPITarget,
  FunctionCategory,
  Period,
  QuarterName,
  TargetDistributionBehavior,
  MonitoringFrequency,
  MeasurementUnit,
} from '../types'

/**
 * Mock data generators for testing
 */
export function generateMockKpi(overrides?: Partial<MasterKPI>): MasterKPI {
  const id = `kpi-${Math.random().toString(36).substring(7)}`
  return {
    id,
    code: `KPI-${Math.floor(Math.random() * 10000)}`,
    name: `Sample KPI ${Math.random().toString(36).substring(7)}`,
    operationalDefinition: 'This is a sample KPI operational definition.',
    monitoringFrequency: MonitoringFrequency.QUARTERLY,
    measurementUnit: MeasurementUnit.NUMBER,
    isGAD: Math.random() > 0.5,
    parentKPIId: null,
    mfopapId: `mfo-${Math.random().toString(36).substring(7)}`,
    complianceTags: [],
    targetDistributionBehavior: TargetDistributionBehavior.DIVISIBLE_SUMMATIVE,
    functionCategory: FunctionCategory.CORE,
    isOptIn: Math.random() > 0.5,
    isActive: true,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    ...overrides,
  }
}

/**
 * Handler: Get all KPIs with optional filters
 */
export async function getKpisHandler(filters?: {
  parentKPIId?: string | null
  mfopapId?: string
  functionCategory?: string
  search?: string
  hierarchyFilter?: 'all' | 'parent' | 'sub'
  showArchived?: boolean
  page?: number
  pageSize?: number
  sorting?: { id: string; desc: boolean }[]
  advancedFilters?: Record<string, any>
}) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let results = [...mockKpiDatabase]

  // Apply Advanced Filters first (AND logic)
  if (filters?.advancedFilters) {
    const af = filters.advancedFilters

    // Function Category Filter (kpi_type)
    if (af.kpi_type && Array.isArray(af.kpi_type) && af.kpi_type.length > 0) {
      results = results.filter((kpi) =>
        af.kpi_type.includes(kpi.functionCategory),
      )
    }

    // Opt-In Status Filter (isOptIn)
    if (af.isOptIn && Array.isArray(af.isOptIn) && af.isOptIn.length > 0) {
      // Map string 'true'/'false' back to boolean for filtering
      const booleanValues = af.isOptIn.map((v: string) => v === 'true')
      results = results.filter((kpi) => booleanValues.includes(!!kpi.isOptIn))
    }

    // Measurement Unit Filter (uom)
    if (af.uom && Array.isArray(af.uom) && af.uom.length > 0) {
      results = results.filter((kpi) => af.uom.includes(kpi.measurementUnit))
    }

    // SDG Filter (sdg)
    if (af.sdg && Array.isArray(af.sdg) && af.sdg.length > 0) {
      results = results.filter((kpi) =>
        kpi.SDGs?.some((goal) => af.sdg.includes(goal)),
      )
    }

    // Target Distribution Filter (target_distribution)
    if (
      af.target_distribution &&
      Array.isArray(af.target_distribution) &&
      af.target_distribution.length > 0
    ) {
      results = results.filter((kpi) =>
        af.target_distribution.includes(kpi.targetDistributionBehavior),
      )
    }
  }

  // Filter by search (case-insensitive across multiple fields)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter(
      (kpi) =>
        kpi.code.toLowerCase().includes(searchLower) ||
        kpi.name.toLowerCase().includes(searchLower) ||
        kpi.operationalDefinition?.toLowerCase().includes(searchLower) ||
        kpi.functionCategory?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by archive status
  if (!filters?.showArchived) {
    results = results.filter((kpi) => !kpi.isArchived)
  }

  // Filter by hierarchy Filter (Parent/Sub)
  if (filters?.hierarchyFilter === 'parent') {
    results = results.filter((kpi) => !kpi.parentKPIId)
  } else if (filters?.hierarchyFilter === 'sub') {
    results = results.filter((kpi) => kpi.parentKPIId !== null)
  }

  // Filter by parent ID specifically
  if (filters?.parentKPIId !== undefined) {
    if (filters.parentKPIId === null) {
      results = results.filter((kpi) => !kpi.parentKPIId)
    } else {
      results = results.filter((kpi) => kpi.parentKPIId === filters.parentKPIId)
    }
  }

  // Filter by MFO
  if (filters?.mfopapId && filters.mfopapId !== 'all') {
    results = results.filter((kpi) => kpi.mfopapId === filters.mfopapId)
  }

  // Filter by Function Category
  // Filter by Function Category
  if (filters?.functionCategory && filters.functionCategory !== 'all') {
    results = results.filter(
      (kpi) => kpi.functionCategory === filters.functionCategory,
    )
  }

  // Filter by hierarchyFilter (mapping to kpi_type if that's what we meant or keeping existing logic)
  if (filters?.hierarchyFilter === 'parent') {
    results = results.filter((kpi) => !kpi.parentKPIId)
  } else if (filters?.hierarchyFilter === 'sub') {
    results = results.filter((kpi) => kpi.parentKPIId !== null)
  }

  // Apply Server-side Sorting
  if (filters?.sorting && filters.sorting.length > 0) {
    results.sort((a: any, b: any) => {
      for (const sort of filters.sorting!) {
        const { id, desc } = sort

        // Handle nested properties (e.g., 'tags.functionCategory')
        const getVal = (obj: any, path: string) => {
          return path.split('.').reduce((acc, part) => acc?.[part], obj)
        }

        const valA = getVal(a, id)
        const valB = getVal(b, id)

        if (valA === valB) continue

        const comparison = String(valA || '').localeCompare(
          String(valB || ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          },
        )

        return desc ? -comparison : comparison
      }
      return 0
    })
  }

  // Apply pagination
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 10
  const startIndex = (page - 1) * pageSize
  const paginatedResults = results.slice(startIndex, startIndex + pageSize)

  return {
    data: paginatedResults,
    pageNumber: page,
    pageSize: pageSize,
    totalPageNumber: Math.ceil(results.length / pageSize),
    totalRows: results.length,
  }
}

/**
 * Handler: Get single KPI by ID
 */
export async function getKpiByIdHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const kpi = mockKpiDatabase.find((k) => k.id === id)
  if (!kpi) throw new Error(`KPI with ID ${id} not found`)
  return kpi
}

/**
 * Handler: Create KPI
 */
export async function createKpiHandler(data: MasterKPIFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Validation
  if (!data.code || !data.name) throw new Error('Code and Name are required')
  if (mockKpiDatabase.some((k) => k.code === data.code)) {
    throw new Error(`KPI with code ${data.code} already exists`)
  }

  const newKpi: MasterKPI = {
    id: `kpi-${Math.random().toString(36).substring(7)}`,
    code: data.code,
    name: data.name,
    operationalDefinition: data.operationalDefinition,
    monitoringFrequency: data.monitoringFrequency,
    measurementUnit: data.measurementUnit,
    isGAD: data.isGAD,
    parentKPIId: data.parentKPIId || null,
    mfopapId: data.mfopapId || null,
    targetDistributionBehavior: data.targetDistributionBehavior || null,
    isOptIn: data.isOptIn ?? false,
    isActive: true,
    complianceTags: data.complianceTags || [],
    functionCategory: data.functionCategory,
    status: data.status || null,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockKpiDatabase.push(newKpi)
  return newKpi
}

/**
 * Handler: Update KPI
 */
export async function updateKpiHandler(id: string, data: MasterKPIFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const kpiIndex = mockKpiDatabase.findIndex((k) => k.id === id)
  if (kpiIndex === -1) throw new Error(`KPI with ID ${id} not found`)

  const updatedKpi: MasterKPI = {
    ...mockKpiDatabase[kpiIndex],
    code: data.code,
    name: data.name,
    operationalDefinition: data.operationalDefinition,
    monitoringFrequency: data.monitoringFrequency,
    measurementUnit: data.measurementUnit,
    isGAD: data.isGAD,
    parentKPIId: data.parentKPIId || null,
    mfopapId: data.mfopapId || null,
    targetDistributionBehavior: data.targetDistributionBehavior || null,
    isOptIn: data.isOptIn ?? mockKpiDatabase[kpiIndex].isOptIn,
    updatedAt: new Date().toISOString(),
  }

  mockKpiDatabase[kpiIndex] = updatedKpi
  return updatedKpi
}

/**
 * Handler: Archive KPI (Soft Delete)
 */
export async function archiveKpiHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const kpiIndex = mockKpiDatabase.findIndex((k) => k.id === id)
  if (kpiIndex === -1) throw new Error(`KPI with ID ${id} not found`)

  const kpi = mockKpiDatabase[kpiIndex]
  kpi.isArchived = true
  kpi.archivedAt = new Date().toISOString()
  kpi.updatedAt = new Date().toISOString()

  return kpi
}

/**
 * Handler: Restore KPI
 */
export async function restoreKpiHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const kpiIndex = mockKpiDatabase.findIndex((k) => k.id === id)
  if (kpiIndex === -1) throw new Error(`KPI with ID ${id} not found`)

  const kpi = mockKpiDatabase[kpiIndex]
  kpi.isArchived = false
  kpi.archivedAt = null
  kpi.updatedAt = new Date().toISOString()

  return kpi
}

/**
 * Handler: Delete KPI (Hard Delete - keep for admin/cleanup if needed)
 */
export async function deleteKpiHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const kpiIndex = mockKpiDatabase.findIndex((k) => k.id === id)
  if (kpiIndex === -1) throw new Error(`KPI with ID ${id} not found`)

  // Check if KPI has children
  const hasChildren = mockKpiDatabase.some((k) => k.parentKPIId === id)
  if (hasChildren) {
    throw new Error(
      'Cannot delete KPI with child KPIs. Please delete children first.',
    )
  }

  const deletedKpi = mockKpiDatabase[kpiIndex]
  mockKpiDatabase.splice(kpiIndex, 1)
  return deletedKpi
}

/**
 * Handler: Delete multiple KPIs
 */
export async function deleteMultipleKpisHandler(ids: string[]) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const deletedKpis: MasterKPI[] = []
  const remainingIds: string[] = []

  for (const id of ids) {
    const kpiIndex = mockKpiDatabase.findIndex((kpi) => kpi.id === id)
    if (kpiIndex !== -1) {
      // Check for children
      const hasChildren = mockKpiDatabase.some((kpi) => kpi.parentKPIId === id)
      if (!hasChildren) {
        deletedKpis.push(mockKpiDatabase[kpiIndex])
        mockKpiDatabase.splice(kpiIndex, 1)
      } else {
        remainingIds.push(id)
      }
    }
  }

  if (remainingIds.length > 0) {
    throw new Error(
      `Could not delete ${remainingIds.length} KPI(s) because they have sub-KPIs associated with them.`,
    )
  }

  return deletedKpis
}

/**
 * Mock KPI Target database (in-memory)
 */
export const mockKpiTargetDatabase: KPITarget[] = [
  {
    id: 'target-1',
    kpiId: 'kpi-1',
    period: Period.ANNUALLY,
    quarterName: null,
    targetValue: 500,
  },
  {
    id: 'target-2',
    kpiId: 'kpi-1',
    period: Period.QUARTERLY,
    quarterName: QuarterName.FIRST,
    targetValue: 100,
  },
  {
    id: 'target-3',
    kpiId: 'kpi-1',
    period: Period.QUARTERLY,
    quarterName: QuarterName.SECOND,
    targetValue: 120,
  },
  {
    id: 'target-4',
    kpiId: 'kpi-2',
    period: Period.ANNUALLY,
    quarterName: null,
    targetValue: 85.5,
  },
]

/**
 * Handler: Get KPI Targets by KPI ID
 */
export async function getKpiTargetsHandler(kpiId: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const targets = mockKpiTargetDatabase.filter((t) => t.kpiId === kpiId)
  return targets
}

/**
 * Handler: Create KPI Target
 */
export async function createKpiTargetHandler(data: Omit<KPITarget, 'id'>) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newTarget: KPITarget = {
    id: `target-${Math.random().toString(36).substring(7)}`,
    ...data,
  }

  mockKpiTargetDatabase.push(newTarget)
  return newTarget
}

/**
 * Handler: Update KPI Target
 */
export async function updateKpiTargetHandler(
  id: string,
  data: Omit<KPITarget, 'id'>,
) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const targetIndex = mockKpiTargetDatabase.findIndex((t) => t.id === id)
  if (targetIndex === -1) throw new Error(`KPI Target with ID ${id} not found`)

  const updatedTarget: KPITarget = {
    id,
    ...data,
  }

  mockKpiTargetDatabase[targetIndex] = updatedTarget
  return updatedTarget
}

/**
 * Handler: Delete KPI Target
 */
export async function deleteKpiTargetHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const targetIndex = mockKpiTargetDatabase.findIndex((t) => t.id === id)
  if (targetIndex === -1) throw new Error(`KPI Target with ID ${id} not found`)

  const deletedTarget = mockKpiTargetDatabase[targetIndex]
  mockKpiTargetDatabase.splice(targetIndex, 1)
  return deletedTarget
}
export { mockKpiDatabase }
