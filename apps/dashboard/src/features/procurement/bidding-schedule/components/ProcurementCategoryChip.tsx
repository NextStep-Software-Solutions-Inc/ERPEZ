import { Badge } from '@/components/ui/badge'
import {
  type ProcurementCategory,
  PROCUREMENT_CATEGORY_LABELS,
} from '../types'

interface ProcurementCategoryChipProps {
  category: ProcurementCategory | string
  className?: string
}

export function ProcurementCategoryChip({
  category,
  className,
}: ProcurementCategoryChipProps) {
  const normalizedCategory = category.toLowerCase() as ProcurementCategory
  const label =
    PROCUREMENT_CATEGORY_LABELS[normalizedCategory] ||
    category.toUpperCase()

  let color: 'default' | 'info' | 'secondary' = 'default'
  if (normalizedCategory === 'goods') color = 'default'
  else if (normalizedCategory === 'infrastructure') color = 'info'
  else if (normalizedCategory === 'consulting') color = 'secondary'

  return (
    <Badge variant="outline" color={color} className={className}>
      {label}
    </Badge>
  )
}
