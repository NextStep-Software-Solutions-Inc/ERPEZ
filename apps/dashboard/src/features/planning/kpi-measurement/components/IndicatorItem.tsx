import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import type { Indicator } from '../types'

interface IndicatorItemProps {
  indicator: Indicator
  onEdit: (indicator: Indicator) => void
  onDelete: (indicator: Indicator) => void
  isLoading?: boolean
}

export function IndicatorItem({
  indicator,
  onEdit,
  onDelete,
  isLoading = false,
}: IndicatorItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono text-xs">
              {indicator.code}
            </Badge>
            <span className="font-medium text-sm">{indicator.name}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{indicator.description}</p>

          {/* Dimensions */}
          {indicator.dimensions.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Dimensions:
              </p>
              <div className="flex flex-wrap gap-1">
                {indicator.dimensions.map((dim, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {dim}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Means of Verification */}
          {indicator.mov.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Means of Verification:
              </p>
              <div className="flex flex-wrap gap-1">
                {indicator.mov.map((m, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rating Scale Templates */}
          {indicator.ratingScaleTemplateIds.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Rating Templates:
              </p>
              <div className="flex flex-wrap gap-1">
                {indicator.ratingScaleTemplateIds.map((templateId) => (
                  <Badge
                    key={templateId}
                    variant="outline"
                    className="text-xs bg-blue-50"
                  >
                    {templateId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(indicator)}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(indicator)}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
