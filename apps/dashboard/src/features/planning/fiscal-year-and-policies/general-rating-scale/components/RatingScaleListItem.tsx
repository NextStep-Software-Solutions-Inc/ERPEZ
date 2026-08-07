import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import {
  decimalToPercentage,
  formatDecimalScore,
} from '@/lib/fiscal-year-and-policies/utils'

interface RatingScaleListItemProps {
  scale: GeneralRatingScale
  canEdit: boolean
  onEditClick: (scaleId: string) => void
  onDeleteClick?: (scaleId: string) => void
}

/**
 * RatingScaleListItem - Presentational component for a single rating scale row
 *
 * Responsibilities:
 * - Display scale name, score ranges (decimal + %), and description
 * - Render edit and delete buttons
 * - Convert and display decimal as percentage
 *
 * Does NOT contain:
 * - Edit/delete logic
 * - State management
 */
export default function RatingScaleListItem({
  scale,
  canEdit,
  onEditClick,
  onDeleteClick,
}: RatingScaleListItemProps) {
  const minPercentage = decimalToPercentage(scale.minScore)
  const maxPercentage = decimalToPercentage(scale.maxScore)

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-gray-900">
          {scale.adjectivalRatingName}
        </p>
      </td>
      <td className="px-4 py-3 font-mono text-gray-700">
        {formatDecimalScore(scale.minScore)}–
        {formatDecimalScore(scale.maxScore)}
      </td>
      <td className="px-4 py-3 font-mono text-gray-700">
        {Math.round(minPercentage)}–{Math.round(maxPercentage)}%
      </td>
      <td className="px-4 py-3 text-gray-600">
        <p className="truncate max-w-xs" title={scale.description}>
          {scale.description}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            onClick={() => onEditClick(scale.id)}
            disabled={!canEdit}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            aria-label={`Edit ${scale.adjectivalRatingName} rating scale`}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {onDeleteClick && (
            <Button
              onClick={() => onDeleteClick(scale.id)}
              disabled={!canEdit}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-destructive hover:text-destructive"
              aria-label={`Delete ${scale.adjectivalRatingName} rating scale`}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
