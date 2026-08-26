import * as React from 'react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusConfig = {
  label?: string
  color?: BadgeProps['color']
  variant?: BadgeProps['variant']
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}

export type StatusMap<T extends string = string> = Partial<Record<T, StatusConfig | string>>

export interface StatusBadgeProps<T extends string = string>
  extends Omit<BadgeProps, 'color'> {
  status?: T | null
  statusMap?: StatusMap<T>
  formatLabel?: (status: T) => React.ReactNode
  showDot?: boolean
  dotClassName?: string
  fallbackStatus?: T
  color?: BadgeProps['color']
}

// Built-in default status mapping for common ERP/Dashtail status terms
const defaultStatusMap: Record<string, StatusConfig> = {
  // Draft / Initial
  draft: { color: 'secondary', variant: 'soft', label: 'Draft' },
  new: { color: 'secondary', variant: 'soft', label: 'New' },
  initial: { color: 'secondary', variant: 'soft', label: 'Initial' },

  // Pending / Review
  pending: { color: 'warning', variant: 'soft', label: 'Pending' },
  'for-approval': { color: 'warning', variant: 'soft', label: 'For Approval' },
  'for-review': { color: 'warning', variant: 'soft', label: 'For Review' },
  submitted: { color: 'info', variant: 'soft', label: 'Submitted' },
  'in-progress': { color: 'info', variant: 'soft', label: 'In Progress' },
  active: { color: 'info', variant: 'soft', label: 'Active' },

  // Approved / Success
  approved: { color: 'success', variant: 'soft', label: 'Approved' },
  completed: { color: 'success', variant: 'soft', label: 'Completed' },
  published: { color: 'success', variant: 'soft', label: 'Published' },
  passed: { color: 'success', variant: 'soft', label: 'Passed' },

  // Returned / Rejected / Failed
  returned: { color: 'destructive', variant: 'soft', label: 'Returned' },
  rejected: { color: 'destructive', variant: 'soft', label: 'Rejected' },
  failed: { color: 'destructive', variant: 'soft', label: 'Failed' },
  cancelled: { color: 'destructive', variant: 'soft', label: 'Cancelled' },
  inactive: { color: 'secondary', variant: 'soft', label: 'Inactive' },
}

export function formatDefaultStatusLabel(status?: string | null): string {
  if (!status) return 'N/A'
  return status
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function StatusBadge<T extends string = string>({
  status,
  statusMap,
  formatLabel,
  showDot = false,
  dotClassName,
  fallbackStatus,
  className,
  color,
  variant = 'soft',
  children,
  ...props
}: StatusBadgeProps<T>) {
  const currentStatus = status || fallbackStatus || 'draft'
  const statusKey = String(currentStatus).toLowerCase()

  // Lookup in custom statusMap first, then defaultStatusMap
  const map = statusMap as Record<string, StatusConfig | string> | undefined
  const customConfig = map?.[currentStatus] || map?.[statusKey]
  const defaultConfig = defaultStatusMap[statusKey]

  let resolvedConfig: StatusConfig = {}

  if (typeof customConfig === 'string') {
    resolvedConfig = { className: customConfig }
  } else if (customConfig) {
    resolvedConfig = customConfig
  } else if (defaultConfig) {
    resolvedConfig = defaultConfig
  }

  const badgeColor = color || resolvedConfig.color || 'default'
  const badgeVariant = variant || resolvedConfig.variant || 'soft'
  const IconComponent = resolvedConfig.icon

  const displayLabel = children ||
    (formatLabel ? formatLabel(currentStatus as T) : undefined) ||
    resolvedConfig.label ||
    formatDefaultStatusLabel(String(currentStatus))

  return (
    <Badge
      variant={badgeVariant}
      color={badgeColor}
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold', resolvedConfig.className, className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full bg-current opacity-80',
            dotClassName,
          )}
        />
      )}
      {IconComponent && <IconComponent className="h-3 w-3" />}
      <span>{displayLabel}</span>
    </Badge>
  )
}

export default StatusBadge
