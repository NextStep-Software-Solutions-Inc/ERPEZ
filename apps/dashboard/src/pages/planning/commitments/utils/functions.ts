import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { Target, ShieldCheck, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
/**
 * Normalize function type values from API to FunctionCategory enum
 * Handles both old format (lowercase strings) and new format (enum values)
 */
export function normalizeFunctionType(
  value: string | FunctionCategory | undefined,
): FunctionCategory {
  if (!value) return FunctionCategory.CORE

  const normalized = String(value).toLowerCase().trim()

  // Map old format strings to new enum
  switch (normalized) {
    case 'strategic':
    case 'strategic function':
      return FunctionCategory.STRATEGIC
    case 'core':
    case 'core function':
      return FunctionCategory.CORE
    case 'support':
    case 'support function':
    case 'mandatory':
    case 'mandatory function':
      return FunctionCategory.SUPPORT
    default:
      // If value is already in the new format or doesn't match, try direct comparison
      return Object.values(FunctionCategory).includes(value as FunctionCategory)
        ? (value as FunctionCategory)
        : FunctionCategory.CORE
  }
}

// Count KPIs per function type
// Map function categories to visual properties
export const getCategoryVisuals = (
  category: FunctionCategory,
): {
  title: string
  description: string
  icon: LucideIcon
  leftBorderColor: string
  iconColor: string
  iconBgColor: string
  badgeBgColor: string
  badgeTextColor: string
  badgeBorderColor: string
} => {
  switch (category) {
    case FunctionCategory.STRATEGIC:
      return {
        title: 'Strategic Function',
        description: 'Key strategic objectives and long-term goals',
        icon: Target,
        leftBorderColor: 'border-l-blue-500',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBgColor: 'bg-blue-100 dark:bg-blue-500/15',
        badgeBgColor: 'bg-blue-50 dark:bg-blue-500/15',
        badgeTextColor: 'text-blue-700 dark:text-blue-300',
        badgeBorderColor: 'border-blue-200 dark:border-blue-500/35',
      }
    case FunctionCategory.CORE:
      return {
        title: 'Core Function',
        description: 'Essential operational functions and processes',
        icon: ShieldCheck,
        leftBorderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/15',
        badgeBgColor: 'bg-emerald-50 dark:bg-emerald-500/15',
        badgeTextColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBorderColor: 'border-emerald-200 dark:border-emerald-500/35',
      }
    case FunctionCategory.SUPPORT:
      return {
        title: 'Support Function',
        description: 'Supporting and enabling functions',
        icon: Wrench,
        leftBorderColor: 'border-l-amber-500',
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBgColor: 'bg-amber-100 dark:bg-amber-500/15',
        badgeBgColor: 'bg-amber-50 dark:bg-amber-500/15',
        badgeTextColor: 'text-amber-700 dark:text-amber-300',
        badgeBorderColor: 'border-amber-200 dark:border-amber-500/35',
      }
  }
}
