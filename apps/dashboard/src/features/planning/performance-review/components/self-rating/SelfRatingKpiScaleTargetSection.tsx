import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { KPILineItem } from '../../types'
import { CATEGORY_DOT, TARGET_FIELDS, formatTargetDisplay } from '../../utils/selfRating'

function getRatingBadgeColor(level: number) {
  switch (level) {
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
      return 'secondary'
  }
}

function formatRange(min?: number | null, max?: number | null) {
  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min} - ${max}`
  }

  if (min !== null && min !== undefined) {
    return `${min}+`
  }

  if (max !== null && max !== undefined) {
    return `<= ${max}`
  }

  return '—'
}

export function SelfRatingKpiScaleTargetSection({
  item,
}: {
  item: KPILineItem
}) {
  const hasTargetInfo =
    !!item.targetInfo &&
    Object.values(item.targetInfo).some(
      (val) => val !== null && val !== undefined,
    )

  const ratingLevels = [...item.ratingLevels].sort((a, b) => b.level - a.level)

  return (
    <div className="px-4 py-3 border-t border-b bg-muted/10 space-y-4">
      <div className="rounded-lg border bg-background p-3 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Rating Scale
            </p>
            <p className="text-sm font-semibold text-slate-900 break-words">
              {item.ratingScaleLabel || '—'}
            </p>
          </div>
          <Badge
            variant="soft"
            color={item.scaleType === 'FIXED' ? 'info' : 'warning'}
            className="shrink-0"
          >
            {item.scaleType === 'FIXED' ? 'Fixed' : 'Non-Fixed'}
          </Badge>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table wrapperClass="overflow-x-auto">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-auto px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Level
                </TableHead>
                <TableHead className="h-auto px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="h-auto px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Range
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratingLevels.map((level) => (
                <TableRow key={level.level}>
                  <TableCell className="px-3 py-2 align-top">
                    <Badge
                      color={getRatingBadgeColor(level.level)}
                      variant="soft"
                      className="min-w-10 justify-center"
                    >
                      {level.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-sm text-slate-900">
                    {level.description || '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-right text-xs text-muted-foreground">
                    {formatRange(level.min, level.max)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Configured MOVs
          </Label>
          {item.configuredMOVs && item.configuredMOVs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {item.configuredMOVs.map((mov, index) => (
                <Badge
                  key={`${item.id}-configured-mov-${index}`}
                  variant="outline"
                  className="text-[11px] font-normal bg-slate-50 text-slate-700"
                >
                  {mov}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No configured MOVs available.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-background p-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[item.category]}`} />
          <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Target
          </Label>
        </div>

        {hasTargetInfo ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TARGET_FIELDS.map((field) => (
              <div
                key={`${item.id}-${field.key}`}
                className="rounded-lg border bg-primary/5 border-primary/20 px-3 py-2 min-h-[58px]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {formatTargetDisplay(item.targetInfo?.[field.key])}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base border rounded-lg px-4 py-3 bg-primary/5 border-primary/20 leading-relaxed">
            {item.target}
          </p>
        )}
      </div>
    </div>
  )
}
