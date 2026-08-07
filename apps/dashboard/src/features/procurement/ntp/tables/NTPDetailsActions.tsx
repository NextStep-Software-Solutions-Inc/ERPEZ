/**
 * NTP Details Row Actions
 * Read-only variant - shows that line items are locked/view-only
 * Can be extended in future if editing capabilities are needed
 */

import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface NTPDetailsActionsProps {
  isReadOnly?: boolean
}

export function NTPDetailsActions({ isReadOnly = true }: NTPDetailsActionsProps) {
  // Read-only display - no interactive actions
  if (isReadOnly) {
    return (
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="gap-1 text-xs">
          <Lock className="h-3 w-3" />
          View Only
        </Badge>
      </div>
    )
  }

  // Placeholder for future edit/delete actions if needed
  return null
}
