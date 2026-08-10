import {
  BadgeCheck,
  CalendarDays,
  CircleSlash2,
  GitBranch,
  Hash,
  LockKeyhole,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  ToggleRight,
  Wrench,
} from 'lucide-react'
import {
  FunctionCategory,
  MeasurementUnit,
  MonitoringFrequency,
} from '../types'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface KpiBadgeVisual {
  label: string
  title: string
  className: string
  icon: LucideIcon
}

export function KpiValueBadge({
  label,
  title,
  className,
  icon: Icon,
}: KpiBadgeVisual) {
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        'gap-1.5 px-1.5 py-0 text-[10px] font-medium whitespace-nowrap',
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </Badge>
  )
}

export function getFunctionCategoryBadge(
  category: FunctionCategory,
): KpiBadgeVisual {
  switch (category) {
    case FunctionCategory.STRATEGIC:
      return {
        label: 'Strategic',
        title: 'Function category: Strategic',
        icon: Target,
        className:
          'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
      }
    case FunctionCategory.CORE:
      return {
        label: 'Core',
        title: 'Function category: Core',
        icon: ShieldCheck,
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
      }
    case FunctionCategory.SUPPORT:
      return {
        label: 'Support',
        title: 'Function category: Support',
        icon: Wrench,
        className:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
      }
    default:
      return {
        label: category,
        title: `Function category: ${category}`,
        icon: ShieldCheck,
        className:
          'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-200',
      }
  }
}

export function getMonitoringFrequencyBadge(
  frequency: MonitoringFrequency,
): KpiBadgeVisual {
  switch (frequency) {
    case MonitoringFrequency.MONTHLY:
      return {
        label: 'Monthly',
        title: 'Monitoring frequency: Monthly',
        icon: CalendarDays,
        className:
          'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
      }
    case MonitoringFrequency.SEMI_ANNUAL:
      return {
        label: 'Semi-Annual',
        title: 'Monitoring frequency: Semi-Annual',
        icon: CalendarDays,
        className:
          'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200',
      }
    case MonitoringFrequency.ANNUAL:
      return {
        label: 'Annual',
        title: 'Monitoring frequency: Annual',
        icon: CalendarDays,
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
      }
    case MonitoringFrequency.QUARTERLY:
    default:
      return {
        label: 'Quarterly',
        title: 'Monitoring frequency: Quarterly',
        icon: CalendarDays,
        className:
          'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
      }
  }
}

export function getMeasurementUnitBadge(
  measurementUnit: MeasurementUnit,
): KpiBadgeVisual {
  switch (measurementUnit) {
    case MeasurementUnit.PERCENTAGE:
      return {
        label: 'Percentage',
        title: 'Measurement unit: Percentage',
        icon: Hash,
        className:
          'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
      }
    case MeasurementUnit.NUMBER:
    default:
      return {
        label: 'Number',
        title: 'Measurement unit: Number',
        icon: Ruler,
        className:
          'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200',
      }
  }
}

export function getGadBadge(isGad: boolean): KpiBadgeVisual {
  return isGad
    ? {
        label: 'GAD',
        title: 'This KPI is tagged as Gender & Development',
        icon: Sparkles,
        className:
          'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-200',
      }
    : {
        label: 'Non-GAD',
        title: 'This KPI is not tagged as Gender & Development',
        icon: CircleSlash2,
        className:
          'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
      }
}

export function getOptInBadge(isOptIn: boolean): KpiBadgeVisual {
  return isOptIn
    ? {
        label: 'Opt-in',
        title: 'This KPI is available for opt-in',
        icon: ToggleRight,
        className:
          'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
      }
    : {
        label: 'Restricted',
        title: 'This KPI is not available for opt-in',
        icon: LockKeyhole,
        className:
          'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
      }
}

export function getHierarchyBadge(
  parentKpiId?: string | null,
  parentKpiCode?: string | null,
): KpiBadgeVisual {
  if (parentKpiId) {
    const label = parentKpiCode ? `Sub-KPI of ${parentKpiCode}` : 'Sub-KPI'
    const title = parentKpiCode
      ? `This KPI is nested under ${parentKpiCode}`
      : 'This KPI is nested under another indicator'

    return {
      label,
      title,
      icon: GitBranch,
      className:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
    }
  }

  return {
    label: 'Parent KPI',
    title: 'This KPI is a top-level parent indicator',
    icon: BadgeCheck,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  }
}

export function getActivityBadge(isActive: boolean): KpiBadgeVisual {
  return isActive
    ? {
        label: 'Active',
        title: 'This KPI is active',
        icon: BadgeCheck,
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
      }
    : {
        label: 'Inactive',
        title: 'This KPI is inactive',
        icon: CircleSlash2,
        className:
          'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
      }
}
