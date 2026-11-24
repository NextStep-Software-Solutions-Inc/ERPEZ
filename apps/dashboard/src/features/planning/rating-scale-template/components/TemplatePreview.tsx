/**
 * Rating Scale Template Preview Component
 * Displays the 5-point rubric in a visual table format
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingScaleTemplate, ScaleType } from '../types'

interface TemplatePreviewProps {
  template: RatingScaleTemplate
  compact?: boolean
  hideHeader?: boolean
}

/**
 * Get color based on rating level
 */
function getRatingColor(rating: number) {
  switch (rating) {
    case 5:
      return 'success'
    case 4:
      return 'info'
    case 3:
      return 'warning'
    case 2:
      return 'warning'
    case 1:
      return 'destructive'
    default:
      return 'default'
  }
}

export function TemplatePreview({
  template,
  compact = false,
  hideHeader = false,
}: TemplatePreviewProps) {
  const ratingLevels = [
    template.rating5,
    template.rating4,
    template.rating3,
    template.rating2,
    template.rating1,
  ]

  const showRangeColumn =
    template.scaleType === ScaleType.NON_FIXED

  if (compact) {
    return (
      <div className="space-y-2">
        {ratingLevels.map((level) => (
          <div key={level.rating} className="flex items-center gap-3">
            <Badge
              color={getRatingColor(level.rating)}
              variant="soft"
              className="min-w-10"
            >
              {level.rating}
            </Badge>
            <span className="text-sm">{level.description}</span>
            {showRangeColumn && (
              <span className="text-xs text-muted-foreground ml-auto">
                {level.minRange !== undefined ? level.minRange : '-'}
                {level.maxRange !== undefined ? ` - ${level.maxRange}` : level.minRange !== undefined ? '+' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Template Header Information */}
      {!hideHeader && (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Template Name</p>
            <p className="text-lg font-semibold">
              {template.name || 'Unnamed Template'}
            </p>
          </div>
          {template.description && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{template.description}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Scale Type</p>
            <Badge
              color={template.scaleType === 'Fixed' ? 'info' : 'warning'}
              variant="soft"
            >
              {template.scaleType}
            </Badge>
          </div>
        </div>
      )}

      {/* Rating Levels Table */}
      <Card className="overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16 font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              {showRangeColumn && (
                <TableHead className="w-32 text-right font-semibold">
                  Range
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratingLevels.map((level) => (
              <TableRow key={level.rating}>
                <TableCell>
                  <Badge color={getRatingColor(level.rating)} variant="soft">
                    {level.rating}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{level.description}</TableCell>
                {showRangeColumn && (
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {level.minRange !== undefined || level.maxRange !== undefined ? (
                      <>
                        {level.minRange !== undefined ? level.minRange : ''}
                        {level.maxRange !== undefined
                          ? ` - ${level.maxRange}`
                          : level.minRange !== undefined ? '+' : ''}
                      </>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
