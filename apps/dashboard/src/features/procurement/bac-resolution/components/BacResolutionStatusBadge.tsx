import { StatusBadge, type StatusConfig } from '@/components/StatusBadge'
import type { BacResolutionStatus } from '../types'

interface BacResolutionStatusBadgeProps {
  status?: BacResolutionStatus | string | null
  className?: string
  showDot?: boolean
}

const bacResolutionStatusMap: Record<string, StatusConfig> = {
  draft: { color: 'secondary', variant: 'soft', label: 'Draft' },
  'for-approval': { color: 'warning', variant: 'soft', label: 'For Approval' },
  returned: { color: 'destructive', variant: 'soft', label: 'Returned' },
  approved: { color: 'success', variant: 'soft', label: 'Approved' },
}

export function BacResolutionStatusBadge({
  status = 'draft',
  className,
  showDot,
}: BacResolutionStatusBadgeProps) {
  return (
    <StatusBadge
      status={status || 'draft'}
      statusMap={bacResolutionStatusMap}
      className={className}
      showDot={showDot}
    />
  )
}
