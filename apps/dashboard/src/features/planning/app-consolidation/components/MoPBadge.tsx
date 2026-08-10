import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ModeOfProcurement } from '../constants'

/**
 * Mode of Procurement Badge
 *
 * Displays MoP as a color-coded badge
 * Based on Philippine Procurement Regulations (RA 9184)
 */

const MOP_BADGE_COLORS: Record<ModeOfProcurement | 'N/A', { bg: string; text: string }> = {
  'Competitive Bidding': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Utility Recontracting': { bg: 'bg-green-100', text: 'text-green-800' },
  'Agency-to-Agency': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Shopping': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Direct Contracting': { bg: 'bg-red-100', text: 'text-red-800' },
  'N/A': { bg: 'bg-gray-100', text: 'text-gray-600' },
}

interface MoPBadgeProps {
  mop?: ModeOfProcurement | 'N/A'
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export function MoPBadge({
  mop = 'N/A',
  className,
  variant = 'secondary',
}: MoPBadgeProps) {
  const colors = MOP_BADGE_COLORS[mop] || MOP_BADGE_COLORS['N/A']

  return (
    <Badge
      color={variant === 'outline' ? undefined : variant}
      variant={variant === 'outline' ? 'outline' : undefined}
      className={cn(colors.bg, colors.text, 'cursor-default', className)}
    >
      {mop}
    </Badge>
  )
}
