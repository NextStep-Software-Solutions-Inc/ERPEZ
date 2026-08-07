import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'
import { useState, useEffect } from 'react'

interface AmountRangeProgressProps {
  minAmount: number
  maxAmount?: number
  thresholdMin?: number
  thresholdMax?: number
  modeBarColorClass?: string
  thresholdLabel?: string
  barColorClass?: string
  className?: string
  /** Enable interactive slider mode with draggable handles */
  interactive?: boolean
  /** Callback when values change in interactive mode */
  onMinChange?: (value: number) => void
  onMaxChange?: (value: number) => void
  /** Show threshold boundary labels and context */
  showThresholdContext?: boolean
}

function formatPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Displays a horizontal progress-bar style visualization of a min–max PHP amount range.
 * The bar fills proportionally within the threshold range boundaries (0-100% = thresholdMin to thresholdMax).
 * The amount range is positioned within the threshold range as a colored segment.
 */
export function AmountRangeProgress({
  minAmount,
  maxAmount,
  thresholdMin,
  thresholdMax,
  modeBarColorClass,
  thresholdLabel,
  barColorClass = 'bg-primary',
  className,
  interactive = false,
  onMinChange,
  onMaxChange,
  showThresholdContext = false,
}: AmountRangeProgressProps) {
  const [localMin, setLocalMin] = useState(minAmount)
  const [localMax, setLocalMax] = useState(maxAmount)

  // Sync local state with props when they change in non-interactive mode
  useEffect(() => {
    if (!interactive) {
      setLocalMin(minAmount)
    }
  }, [minAmount, interactive])

  useEffect(() => {
    if (!interactive) {
      setLocalMax(maxAmount)
    }
  }, [maxAmount, interactive])
  const isAmountUnlimited = !localMax || localMax === null
  const isThresholdUnlimited = !thresholdMax || thresholdMax === null

  // Threshold range becomes the boundary container (0-100%)
  const boundaryStart = thresholdMin ?? localMin
  const boundaryEnd =
    thresholdMax ??
    (isAmountUnlimited ? localMin + 1 : (localMax ?? localMin + 1))
  const totalBoundary = Math.max(boundaryEnd - boundaryStart, 1)

  // Position the amount range WITHIN the threshold boundaries
  const amountStart = clamp(localMin, boundaryStart, boundaryEnd)
  const amountEnd = clamp(
    isAmountUnlimited ? boundaryEnd : (localMax ?? boundaryEnd),
    amountStart,
    boundaryEnd,
  )

  // Calculate percentage-based positioning within threshold range
  const leftPct =
    totalBoundary > 0
      ? ((amountStart - boundaryStart) / totalBoundary) * 100
      : 0
  const widthPct =
    totalBoundary > 0 ? ((amountEnd - amountStart) / totalBoundary) * 100 : 0

  const policyRangeText = isAmountUnlimited
    ? `${formatPHP(amountStart)} — No limit`
    : `${formatPHP(amountStart)} — ${formatPHP(amountEnd)}`

  const thresholdRangeText = isThresholdUnlimited
    ? `${formatPHP(boundaryStart)} — No limit`
    : `${formatPHP(boundaryStart)} — ${formatPHP(boundaryEnd)}`

  const fallbackThresholdLabel = thresholdRangeText
  const segmentValueText = thresholdLabel ?? fallbackThresholdLabel

  const activeBarColorClass = modeBarColorClass ?? barColorClass

  // Interactive mode with dual-handle slider
  if (interactive && thresholdMin !== undefined) {
    // Use thresholdMax if available, otherwise estimate a reasonable upper bound
    const actualThresholdMax = thresholdMax ?? localMax ?? boundaryEnd

    const handleSliderChange = (values: number[]) => {
      const [newMin, newMax] = values
      setLocalMin(newMin)
      setLocalMax(newMax)
      onMinChange?.(newMin)
      onMaxChange?.(newMax)
    }

    const safeMax = localMax ?? actualThresholdMax

    return (
      <div className={cn('space-y-4', className)}>
        {/* Threshold boundary labels */}
        {showThresholdContext && (
          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">
              Threshold: {formatPHP(boundaryStart)}
            </span>
            {isThresholdUnlimited ? (
              <span className="italic text-foreground font-semibold">
                No max limit
              </span>
            ) : (
              <span className="text-foreground font-semibold">
                {formatPHP(boundaryEnd)}
              </span>
            )}
          </div>
        )}

        {/* Interactive slider */}
        <div className="space-y-2">
          <Slider
            value={[amountStart, safeMax]}
            onValueChange={handleSliderChange}
            min={boundaryStart}
            max={actualThresholdMax}
            step={1}
            className="w-full"
            color="primary"
          />
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>{formatPHP(amountStart)}</span>
            {!isAmountUnlimited && <span>{formatPHP(amountEnd)}</span>}
            {isAmountUnlimited && <span className="italic">No limit</span>}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative h-3 w-full rounded-full bg-default-200 overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-px bg-default-500" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'absolute inset-y-0 rounded-full transition-all duration-300 cursor-pointer',
                  activeBarColorClass,
                  'group-hover:shadow-[0_0_12px_var(--color-primary,rgba(59,130,246,0.6))] group-hover:drop-shadow-sm',
                )}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              color="secondary"
              side="top"
              className="p-0 border-0 bg-transparent shadow-none"
            >
              <div className="rounded-lg border border-border bg-card px-3.5 py-3 shadow-lg backdrop-blur-sm">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                      Threshold Range
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {segmentValueText}
                    </p>
                  </div>
                  <div className="h-px bg-linear-to-r from-border/0 via-border/50 to-border/0" />
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                      Policy Range
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {policyRangeText}
                    </p>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
        <span className="text-foreground font-semibold">
          {formatPHP(boundaryStart)}
        </span>
        {isThresholdUnlimited ? (
          <span className="italic">No max limit</span>
        ) : (
          <span className="text-foreground font-semibold">
            {formatPHP(boundaryEnd)}
          </span>
        )}
      </div>
    </div>
  )
}
