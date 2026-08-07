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

/**
 * Tab definitions for each Domain
 */
export interface PolicyTabConfig {
  id: string
  label: string
  description: string
  domain: PolicyDomain
  icon: LucideIcon
}

export const POLICY_TABS: Record<string, PolicyTabConfig> = {
  // Fiscal Configuration
  'fiscal-year-management': {
    id: 'fiscal-year-management',
    label: 'Fiscal Year Management',
    description: 'Manage fiscal year lifecycles and status',
    domain: 'fiscal-configuration',
    icon: CalendarDays,
  },
  'economic-indicators': {
    id: 'economic-indicators',
    label: 'Economic Indicators',
    description: 'Configuration for taxes and economic data',
    domain: 'fiscal-configuration',
    icon: Percent,
  },
  'data-migrations': {
    id: 'data-migrations',
    label: 'Data Migrations',
    description: 'Year-to-year data rollover and migration tools',
    domain: 'fiscal-configuration',
    icon: History,
  },

  // Financial Planning
  'budget-call': {
    id: 'budget-call',
    label: 'Budget Call',
    description: 'Annual budget call preparation and deadlines',
    domain: 'financial-planning',
    icon: ClipboardList,
  },
  'procurement-thresholds': {
    id: 'procurement-thresholds',
    label: 'Procurement Thresholds',
    description: 'Define limits and modes for procurement',
    domain: 'financial-planning',
    icon: Scale,
  },

  // Governance & Organization
  'workflow-matrices': {
    id: 'workflow-matrices',
    label: 'Workflow Matrices',
    description:
      'Assign approval authorities to workflow routing by fiscal year',
    domain: 'governance-organization',
    icon: Users,
  },
  'spms-function-weights': {
    id: 'spms-function-weights',
    label: 'SPMS Function Weights',
    description: 'Configure weights for performance evaluation',
    domain: 'governance-organization',
    icon: Target,
  },
  'rating-scale': {
    id: 'rating-scale',
    label: 'General Rating Scale',
    description: 'Manage institutional rating criteria',
    domain: 'governance-organization',
    icon: Layout,
  },
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
