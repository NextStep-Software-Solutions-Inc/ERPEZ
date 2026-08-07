/**
 * Performance Review – Adjectival Rating Badge
 */

import { Badge } from '@/components/ui/badge'
import { ADJECTIVAL_COLOR, type AdjectivalRating } from '../types'

interface AdjectivalBadgeProps {
  rating: AdjectivalRating | null
}

export function AdjectivalBadge({ rating }: AdjectivalBadgeProps) {
  if (!rating) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold border ${ADJECTIVAL_COLOR[rating]}`}
    >
      {rating}
    </Badge>
  )
}
