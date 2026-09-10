import {
  FunctionCategory,
  type MasterKPI,
  TargetDistributionBehavior,
} from '../types'
import { getDistributionBehaviorLabel } from '../types'

export type MasterKpiStatusFilter = 'all' | 'active' | 'inactive'
export type MasterKpiHierarchyFilter = 'all' | 'parent' | 'sub'
export type MasterKpiCardSortBy =
  | 'name'
  | 'code'
  | 'category'
  | 'status'
  | 'dateAdded'
export type MasterKpiTableSorting = Array<{ id: string; desc: boolean }>

export interface MasterKpiAdvancedFilterMap {
  kpi_type?: string[]
  isOptIn?: string[]
  uom?: string[]
  sdg?: string[]
  target_distribution?: string[]
}

export interface MasterKpiListFilterState {
  search?: string
  statusFilter?: string
  functionCategoryFilter?: string
  hierarchyFilter?: MasterKpiHierarchyFilter
  advancedFilters?: MasterKpiAdvancedFilterMap
}

export const masterKpiFunctionCategoryOptions = Object.values(
  FunctionCategory,
).map((category) => ({
  value: category,
  label: category,
}))

export const masterKpiStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const masterKpiHierarchyOptions = [
  { value: 'all', label: 'All Indicators' },
  { value: 'parent', label: 'Parent KPI' },
  { value: 'sub', label: 'Sub-KPI' },
]

export const masterKpiTargetDistributionOptions = [
  {
    value: TargetDistributionBehavior.SUMMATION,
    label: getDistributionBehaviorLabel(TargetDistributionBehavior.SUMMATION),
  },
  {
    value: TargetDistributionBehavior.UNIFORM_AVERAGE,
    label: getDistributionBehaviorLabel(
      TargetDistributionBehavior.UNIFORM_AVERAGE,
    ),
  },
  {
    value: TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE,
    label: getDistributionBehaviorLabel(
      TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE,
    ),
  },
  {
    value: TargetDistributionBehavior.MAXIMUM,
    label: getDistributionBehaviorLabel(TargetDistributionBehavior.MAXIMUM),
  },
  {
    value: TargetDistributionBehavior.MINIMUM,
    label: getDistributionBehaviorLabel(TargetDistributionBehavior.MINIMUM),
  },
]

const normalizeText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, ' ')

export function normalizeStatusFilter(
  value?: string | null,
): MasterKpiStatusFilter {
  const normalized = normalizeText(value ?? '')
  if (normalized === 'active' || normalized === 'true') return 'active'
  if (normalized === 'inactive' || normalized === 'false') return 'inactive'
  return 'all'
}

export function parseAdvancedFilters(
  value?: string,
): MasterKpiAdvancedFilterMap {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>

    return Object.entries(parsed).reduce<MasterKpiAdvancedFilterMap>(
      (acc, [key, rawValue]) => {
        if (!Array.isArray(rawValue)) return acc

        const values = rawValue
          .filter((item): item is string => typeof item === 'string')
          .filter((item) => item.trim().length > 0)

        if (values.length > 0) {
          acc[key as keyof MasterKpiAdvancedFilterMap] = values
        }

        return acc
      },
      {},
    )
  } catch {
    return {}
  }
}

function matchesTargetDistributionFilter(
  kpi: MasterKPI,
  selectedValues: string[],
) {
  if (selectedValues.length === 0) return true

  const currentValue = kpi.targetDistributionBehavior ?? ''
  const currentLabel = currentValue
    ? getDistributionBehaviorLabel(currentValue)
    : ''

  return selectedValues.some((selected) => {
    const normalizedSelected = normalizeText(selected)
    return (
      normalizedSelected === normalizeText(currentValue) ||
      normalizedSelected === normalizeText(currentLabel)
    )
  })
}

function getTableSortValue(kpi: MasterKPI, columnId: string) {
  switch (columnId) {
    case 'code':
      return kpi.code
    case 'name':
      return kpi.name
    case 'monitoringFrequency':
      return kpi.monitoringFrequency
    case 'measurementUnit':
      return kpi.measurementUnit
    case 'isGAD':
      return kpi.isGAD ? 1 : 0
    case 'complianceTags':
      return (kpi.complianceTags ?? []).join(', ')
    case 'isActive':
      return kpi.isActive ? 1 : 0
    case 'parentKPIId':
      return kpi.parentKPIId ?? ''
    case 'mfopapId':
      return kpi.mfopapId ?? ''
    case 'functionCategory':
      return kpi.functionCategory
    case 'isOptIn':
      return kpi.isOptIn ? 1 : 0
    case 'developmentGoals':
      return (kpi.SDGs ?? []).map((goal) => goal.name ?? '').join(', ')
    case 'targetDistributionBehavior':
      return kpi.targetDistributionBehavior ?? ''
    default:
      return ''
  }
}

function compareTableValues(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export function filterMasterKpis(
  kpis: MasterKPI[],
  filters: MasterKpiListFilterState,
): MasterKPI[] {
  const searchLower = filters.search?.trim().toLowerCase() ?? ''
  const statusFilter = normalizeStatusFilter(filters.statusFilter)
  const advancedFilters = filters.advancedFilters ?? {}

  let results = [...kpis]

  // Keep archived records out of the registry by default.
  results = results.filter((kpi) => !kpi.isArchived)

  if (searchLower) {
    results = results.filter((kpi) => {
      const haystack = [
        kpi.code,
        kpi.name,
        kpi.operationalDefinition,
        kpi.functionCategory,
        kpi.status ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchLower)
    })
  }

  if (statusFilter !== 'all') {
    const expectedActive = statusFilter === 'active'
    results = results.filter((kpi) => kpi.isActive === expectedActive)
  }

  if (
    filters.functionCategoryFilter &&
    filters.functionCategoryFilter !== 'all'
  ) {
    results = results.filter(
      (kpi) => kpi.functionCategory === filters.functionCategoryFilter,
    )
  }

  if (filters.hierarchyFilter === 'parent') {
    results = results.filter((kpi) => !kpi.parentKPIId)
  } else if (filters.hierarchyFilter === 'sub') {
    results = results.filter((kpi) => !!kpi.parentKPIId)
  }

  if (advancedFilters.kpi_type?.length) {
    results = results.filter((kpi) =>
      advancedFilters.kpi_type!.includes(kpi.functionCategory),
    )
  }

  if (advancedFilters.isOptIn?.length) {
    const selectedValues = new Set(
      advancedFilters.isOptIn.map((value) => value.toLowerCase() === 'true'),
    )
    results = results.filter((kpi) => selectedValues.has(!!kpi.isOptIn))
  }

  if (advancedFilters.uom?.length) {
    results = results.filter((kpi) =>
      advancedFilters.uom!.includes(kpi.measurementUnit),
    )
  }

  if (advancedFilters.sdg?.length) {
    results = results.filter((kpi) =>
      kpi.SDGs?.some((goal) => advancedFilters.sdg!.includes(goal.name ?? '')),
    )
  }

  if (advancedFilters.target_distribution?.length) {
    results = results.filter((kpi) =>
      matchesTargetDistributionFilter(
        kpi,
        advancedFilters.target_distribution!,
      ),
    )
  }

  return results
}

export function sortMasterKpisForCard(
  kpis: MasterKPI[],
  sortBy: MasterKpiCardSortBy,
): MasterKPI[] {
  const sorted = [...kpis]

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      )
      break
    case 'code':
      sorted.sort((a, b) =>
        a.code.localeCompare(b.code, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      break
    case 'category':
      sorted.sort((a, b) =>
        a.functionCategory.localeCompare(b.functionCategory, undefined, {
          sensitivity: 'base',
        }),
      )
      break
    case 'status':
      sorted.sort((a, b) => {
        if (a.isActive === b.isActive) return 0
        return a.isActive ? -1 : 1
      })
      break
    case 'dateAdded':
    default:
      sorted.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.lastModifiedDate || a.createdAt || a.createdDate || 0).getTime()
        const dateB = new Date(b.updatedAt || b.lastModifiedDate || b.createdAt || b.createdDate || 0).getTime()
        return dateB - dateA
      })
      break
  }

  return sorted
}

export function sortMasterKpisForTable(
  kpis: MasterKPI[],
  sorting: MasterKpiTableSorting,
): MasterKPI[] {
  if (sorting.length === 0) {
    return [...kpis].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.lastModifiedDate || a.createdAt || a.createdDate || 0).getTime()
      const dateB = new Date(b.updatedAt || b.lastModifiedDate || b.createdAt || b.createdDate || 0).getTime()
      return dateB - dateA
    })
  }

  const sorted = [...kpis]

  sorted.sort((a, b) => {
    for (const sort of sorting) {
      const valueA = getTableSortValue(a, sort.id)
      const valueB = getTableSortValue(b, sort.id)
      const comparison = compareTableValues(valueA, valueB)

      if (comparison !== 0) {
        return sort.desc ? -comparison : comparison
      }
    }

    return 0
  })

  return sorted
}

