/**
 * KPI Library Tab Configuration
 * Centralized constants for tab routing, labels, and validation utilities.
 * Ensures type-safe tab identification and prevents slug mismatches.
 * Uses URL search params (?tab=) for tab routing.
 */

import { z } from 'zod'

export type KpiLibraryTab =
  | 'master-kpi'
  | 'rating-scales'
  | 'kpi-measurement-configurator'

export interface TabConfig {
  id: KpiLibraryTab
  label: string
  path: string
}

export const KPI_LIBRARY_TABS: TabConfig[] = [
  {
    id: 'master-kpi',
    label: 'Master KPI Registry',
    path: '/v2/kpi-library/master-kpi',
  },
  {
    id: 'rating-scales',
    label: 'Rating Scales',
    path: '/v2/kpi-library/rating-scales',
  },
  {
    id: 'kpi-measurement-configurator',
    label: 'KPI Measurement Configurator',
    path: '/v2/kpi-library/kpi-measurement-configurator',
  },
]

export const TAB_SLUGS = KPI_LIBRARY_TABS.map((t) => t.id)

export const TAB_LABELS: Record<KpiLibraryTab, string> =
  KPI_LIBRARY_TABS.reduce(
    (acc, tab) => ({ ...acc, [tab.id]: tab.label }),
    {} as Record<KpiLibraryTab, string>,
  )

/**
 * Zod schema for KPI Library URL search params
 * Validates and provides type-safe access to search parameters
 */
export const kpiLibrarySearchSchema = z.object({
  tab: z
    .enum([
      'master-kpi',
      'rating-scales',
      'kpi-measurement-configurator',
    ] as const)
    .optional()
    .default('master-kpi'),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
  search: z.string().optional(),
  kpi: z.string().optional(),
  dimension: z.string().optional(),
  statusFilter: z.string().optional(),
  functionTypeFilter: z.string().optional(),
  hierarchyFilter: z.enum(['parent', 'sub']).optional(),
  advancedFilters: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export type KpiLibrarySearchParams = z.infer<typeof kpiLibrarySearchSchema>

/**
 * Extract the active KPI Library tab from a pathname.
 * Returns null if no valid KPI tab is found in the pathname.
 * @deprecated Use URL search params instead
 * @example
 * mapPathToTab('/v2/kpi-library/master-kpi') // => 'master-kpi'
 * mapPathToTab('/other/path') // => null
 */
export function mapPathToTab(pathname: string): KpiLibraryTab | null {
  const tab = KPI_LIBRARY_TABS.find((t) => pathname.includes(t.id))?.id
  return tab || null
}

/**
 * Type guard: validate if a string is a valid KpiLibraryTab.
 * Useful for runtime type checking and narrowing.
 * @example
 * if (isValidTab(value)) {
 *   // value is now typed as KpiLibraryTab
 * }
 */
export function isValidTab(value: string): value is KpiLibraryTab {
  return TAB_SLUGS.includes(value as KpiLibraryTab)
}
