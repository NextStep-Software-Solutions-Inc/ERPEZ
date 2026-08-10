/**
 * Performance Review – QET Input Row
 * Single row input for Q, E, T dimensions with auto-computed average.
 */

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { QETRating } from '../types'
import type { KPILineItem } from '../types'

interface QETInputRowProps {
  item: KPILineItem
  ratingKey: 'selfRating' | 'finalRating'
  onUpdate: (kpiId: string, field: keyof QETRating, value: number | null) => void
  disabled?: boolean
  showAverage?: boolean
}

function RatingInput({
  value,
  onChange,
  disabled,
  placeholder = '0–5',
}: {
  value: number | null
  onChange: (v: number | null) => void
  disabled?: boolean
  placeholder?: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      onChange(null)
      return
    }
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0 && num <= 5) {
      onChange(parseFloat(num.toFixed(1)))
    }
  }

  return (
    <Input
      type="number"
      min="0"
      max="5"
      step="0.1"
      placeholder={placeholder}
      value={value !== null ? value.toString() : ''}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'h-8 w-16 text-center text-xs px-1',
        disabled && 'bg-muted/50 cursor-not-allowed'
      )}
    />
  )
}

export function QETInputRow({ item, ratingKey, onUpdate, disabled, showAverage = true }: QETInputRowProps) {
  const rating = item[ratingKey]
  const hasQ = item.tags.includes('quality')
  const hasE = item.tags.includes('efficiency')
  const hasT = item.tags.includes('timeliness')

  return (
    <div className="flex items-center gap-2">
      {hasQ && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground">Q</span>
          <RatingInput
            value={rating.quality}
            onChange={(v) => onUpdate(item.id, 'quality', v)}
            disabled={disabled}
          />
        </div>
      )}
      {hasE && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground">E</span>
          <RatingInput
            value={rating.efficiency}
            onChange={(v) => onUpdate(item.id, 'efficiency', v)}
            disabled={disabled}
          />
        </div>
      )}
      {hasT && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground">T</span>
          <RatingInput
            value={rating.timeliness}
            onChange={(v) => onUpdate(item.id, 'timeliness', v)}
            disabled={disabled}
          />
        </div>
      )}
      {showAverage && (
        <div className="flex flex-col items-center gap-0.5 ml-1">
          <span className="text-[10px] font-medium text-muted-foreground">Avg</span>
          <div className={cn(
            'h-8 w-16 flex items-center justify-center rounded-md border text-xs font-semibold',
            rating.average !== null ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/30 text-muted-foreground border-muted'
          )}>
            {rating.average !== null ? rating.average.toFixed(2) : '—'}
          </div>
        </div>
      )}
    </div>
  )
}
