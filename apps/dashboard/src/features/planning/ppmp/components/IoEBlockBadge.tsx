/**
 * IoEBlockBadge Component
 * Visual indicator for IoE block type (Procurable / Non-Procurable)
 * Placed in IoE block header for at-a-glance identification
 */

import { Badge } from '@/components/ui/badge'

export interface IoEBlockBadgeProps {
  /** True if block contains procurable items */
  isProcurable?: boolean
  /** CSS class for custom styling */
  className?: string
}

/**
 * Renders a colored badge indicating the IoE block type
 * - Procurable: Green badge with "Procurable" text
 * - Non-Procurable: Gray badge with "Non-Procurable" text
 */
export function IoEBlockBadge({
  isProcurable = false,
  className = '',
}: IoEBlockBadgeProps) {
  if (isProcurable) {
    return (
      <Badge
        className={`bg-green-100 text-green-700 hover:bg-green-200 ${className}`}
      >
        🟢 Procurable
      </Badge>
    )
  }

  return (
    <Badge
      className={`bg-gray-100 text-gray-700 hover:bg-gray-200 ${className}`}
    >
      ⚪ Non-Procurable
    </Badge>
  )
}
