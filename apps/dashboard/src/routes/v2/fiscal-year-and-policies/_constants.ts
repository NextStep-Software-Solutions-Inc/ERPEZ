/**
 * Constants and configuration for Fiscal Year & Policies routing
 * Single ?tab= parameter pattern with inferred domains
 */

import { z } from 'zod'
import {
  CalendarDays,
  Percent,
  History,
  ClipboardList,
  Scale,
  Users,
  Layout,
  LucideIcon,
  Target,
} from 'lucide-react'

/**
 * Domain definitions
 */
export const POLICY_DOMAINS = [
  {
    id: 'fiscal-configuration',
    label: 'Fiscal Configuration',
    description: 'Core fiscal year setup and data management',
  },
  {
    id: 'financial-planning',
    label: 'Financial Planning',
    description: 'Budget and procurement planning',
  },
  {
    id: 'governance-organization',
    label: 'Governance & Organization',
    description: 'Policies and organizational settings',
  },
] as const

export type PolicyDomain = (typeof POLICY_DOMAINS)[number]['id']

import { PERMISSIONS } from '@/constants/permissions'

/**
 * Mutually exclusive permission requirements.
 */
export type PermissionRequirement =
  | { anyOf: readonly string[]; allOf?: never }
  | { allOf: readonly string[]; anyOf?: never }

/**
 * Tab definitions for each Domain
 */
export interface PolicyTabConfig {
  id: string
  label: string
  description: string
  domain: PolicyDomain
  icon: LucideIcon
  requiredPermission?: string | PermissionRequirement
}

export interface PermissionChecker {
  hasPermission: (p: string) => boolean
  hasAnyPermission: (p: readonly string[]) => boolean
  hasAllPermissions: (p: readonly string[]) => boolean
}

export const POLICY_TABS: Record<string, PolicyTabConfig> = {
  // Fiscal Configuration
  'fiscal-year-management': {
    id: 'fiscal-year-management',
    label: 'Fiscal Year Management',
    description: 'Manage fiscal year lifecycles and status',
    domain: 'fiscal-configuration',
    icon: CalendarDays,
    requiredPermission: PERMISSIONS.Planning.FiscalYear.View,
  },
  'economic-indicators': {
    id: 'economic-indicators',
    label: 'Economic Indicators',
    description: 'Configuration for taxes and economic data',
    domain: 'fiscal-configuration',
    icon: Percent,
    requiredPermission: {
      anyOf: [
        PERMISSIONS.Planning.EconomicIndicators.Manage,
        PERMISSIONS.Planning.FiscalYear.View,
      ],
    },
  },
  'data-migrations': {
    id: 'data-migrations',
    label: 'Data Migrations',
    description: 'Year-to-year data rollover and migration tools',
    domain: 'fiscal-configuration',
    icon: History,
    requiredPermission: {
      anyOf: [
        PERMISSIONS.Planning.DataMigrations.Manage,
        PERMISSIONS.Admin.Tenants.Manage,
        PERMISSIONS.Admin.Roles.Manage,
      ],
    },
  },

  // Financial Planning
  'budget-call': {
    id: 'budget-call',
    label: 'Budget Call',
    description: 'Annual budget call preparation and deadlines',
    domain: 'financial-planning',
    icon: ClipboardList,
    requiredPermission: PERMISSIONS.Planning.BudgetCall.View,
  },
  'procurement-thresholds': {
    id: 'procurement-thresholds',
    label: 'Procurement Thresholds',
    description: 'Define limits and modes for procurement',
    domain: 'financial-planning',
    icon: Scale,
    requiredPermission: {
      anyOf: [
        PERMISSIONS.Procurement.ProcurementThresholds.Manage,
        PERMISSIONS.Procurement.ProcurementLibrary.View,
      ],
    },
  },

  // Governance & Organization
  'workflow-matrices': {
    id: 'workflow-matrices',
    label: 'Workflow Matrices',
    description:
      'Assign approval authorities to workflow routing by fiscal year',
    domain: 'governance-organization',
    icon: Users,
    requiredPermission: PERMISSIONS.Planning.WorkflowMatrix.Manage,
  },
  'spms-function-weights': {
    id: 'spms-function-weights',
    label: 'SPMS Function Weights',
    description: 'Configure weights for performance evaluation',
    domain: 'governance-organization',
    icon: Target,
    requiredPermission: {
      anyOf: [
        PERMISSIONS.Planning.SpmsFunctionWeights.Manage,
        PERMISSIONS.Planning.Target.Manage,
      ],
    },
  },
  'rating-scale': {
    id: 'rating-scale',
    label: 'General Rating Scale',
    description: 'Manage institutional rating criteria',
    domain: 'governance-organization',
    icon: Layout,
    requiredPermission: PERMISSIONS.Planning.RatingScale.Manage,
  },
}

/**
 * Evaluates whether a given tab is permitted for the current user.
 * Implements strict deny-by-default on malformed requirements.
 */
export function isTabPermitted(
  tab: PolicyTabConfig,
  checker: PermissionChecker
): boolean {
  if (!tab.requiredPermission) return true

  if (typeof tab.requiredPermission === 'string') {
    return checker.hasPermission(tab.requiredPermission)
  }

  if (typeof tab.requiredPermission === 'object') {
    if ('anyOf' in tab.requiredPermission && tab.requiredPermission.anyOf) {
      return tab.requiredPermission.anyOf.length > 0
        ? checker.hasAnyPermission(tab.requiredPermission.anyOf)
        : false
    }
    if ('allOf' in tab.requiredPermission && tab.requiredPermission.allOf) {
      return tab.requiredPermission.allOf.length > 0
        ? checker.hasAllPermissions(tab.requiredPermission.allOf)
        : false
    }
  }

  return false
}

export interface TabResolutionResult {
  resolvedTab: string | null
  isDenied: boolean
}

/**
 * Pure function that deterministically resolves the accessible tab.
 * Precondition: Permissions are already in 'success' (loaded) state.
 */
export function resolveAccessibleTab({
  requestedTab,
  activeDomain,
  checker,
}: {
  requestedTab: string
  activeDomain: PolicyDomain
  checker: PermissionChecker
}): TabResolutionResult {
  const targetConfig = POLICY_TABS[requestedTab]
  if (targetConfig && isTabPermitted(targetConfig, checker)) {
    return { resolvedTab: requestedTab, isDenied: false }
  }

  // 1. Try first accessible sibling in the active domain
  const siblingTabs = getTabsByDomain(activeDomain).filter((t) =>
    isTabPermitted(t, checker)
  )
  if (siblingTabs.length > 0) {
    return { resolvedTab: siblingTabs[0].id, isDenied: false }
  }

  // 2. Try first accessible tab across any domain in the module
  const anyAccessible = Object.values(POLICY_TABS).find((t) =>
    isTabPermitted(t, checker)
  )
  if (anyAccessible) {
    return { resolvedTab: anyAccessible.id, isDenied: false }
  }

  // 3. User has zero accessible tabs in this entire module
  return { resolvedTab: null, isDenied: true }
}

/**
 * Get tabs belonging to a specific domain
 */
export function getTabsByDomain(domain: PolicyDomain): PolicyTabConfig[] {
  return Object.values(POLICY_TABS).filter((tab) => tab.domain === domain)
}

/**
 * Map derived tab value to its parent domain
 */
export function getDomainByTab(tabId: string): PolicyDomain {
  return POLICY_TABS[tabId]?.domain || 'fiscal-configuration'
}

/**
 * Zod search schema for routing
 */
export const fiscalYearPoliciesSearchSchema = z.object({
  tab: z.string().optional().default('fiscal-year-management'),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  fiscalYearId: z.string().optional(),
  minStrategic: z.coerce.number().optional(),
  minCore: z.coerce.number().optional(),
  minSupport: z.coerce.number().optional(),
})

export type FiscalYearPoliciesSearchSchema = z.infer<
  typeof fiscalYearPoliciesSearchSchema
>
export type PolicyTabId = keyof typeof POLICY_TABS
