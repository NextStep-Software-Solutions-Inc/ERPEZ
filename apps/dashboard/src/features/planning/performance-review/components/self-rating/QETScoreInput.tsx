import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { ADJECTIVAL_COLOR, getAdjectivalRating } from '../../types'

export function QETScoreInput({
  label,
  value,
  onChange,
  disabled,
  pmtRating,
  pmtRemark,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  disabled: boolean
  pmtRating?: number | null
  pmtRemark?: string | null
}) {
  const adjRating = value !== null ? getAdjectivalRating(value) : null
  const colorClass = adjRating ? ADJECTIVAL_COLOR[adjRating] : ''
  const hasPmt = pmtRating !== undefined && pmtRating !== null

  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px]">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <Input
        type="number"
        min={1}
        max={5}
        step={0.1}
        value={value ?? ''}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          onChange(Number.isNaN(v) ? null : Math.min(5, Math.max(1, v)))
        }}
        disabled={disabled}
        className="h-8 w-14 text-center text-sm font-semibold px-1"
        placeholder="—"
      />
      {value !== null && (
        <span
          className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${colorClass}`}
        >
          {value.toFixed(1)}
        </span>
      )}
      {hasPmt && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] font-semibold px-1 bg-amber-50 text-amber-700 border border-amber-200 rounded cursor-help mt-0.5">
                P: {pmtRating.toFixed(1)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[180px] text-xs">
              <p className="font-semibold mb-0.5">PMT Calibrated Rating</p>
              {pmtRemark ? (
                <p className="text-muted-foreground italic">"{pmtRemark}"</p>
              ) : (
                <p className="text-muted-foreground">No remark provided</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
