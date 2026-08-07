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
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
        badgeBgColor: 'bg-blue-50',
        badgeTextColor: 'text-blue-700',
        badgeBorderColor: 'border-blue-200',
      }
    case FunctionCategory.CORE:
      return {
        title: 'Core Function',
        description: 'Essential operational functions and processes',
        icon: ShieldCheck,
        leftBorderColor: 'border-l-green-500',
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
        badgeBgColor: 'bg-green-50',
        badgeTextColor: 'text-green-700',
        badgeBorderColor: 'border-green-200',
      }
    case FunctionCategory.SUPPORT:
      return {
        title: 'Support Function',
        description: 'Supporting and enabling functions',
        icon: Wrench,
        leftBorderColor: 'border-l-orange-500',
        iconColor: 'text-orange-600',
        iconBgColor: 'bg-orange-100',
        badgeBgColor: 'bg-orange-50',
        badgeTextColor: 'text-orange-700',
        badgeBorderColor: 'border-orange-200',
      }
  }
}
