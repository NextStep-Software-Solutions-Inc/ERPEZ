import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { ThresholdBoundary } from '@/lib/fiscal-year-and-policies/types'
import { ProcurementMethodThreshold } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'

interface ThresholdDisplayViewProps {
  threshold: ProcurementMethodThreshold
  boundary: ThresholdBoundary
  methodName: string
  onEditClick: () => void
}

export function ThresholdDisplayView({
  threshold,
  boundary,
  methodName,
  onEditClick,
}: ThresholdDisplayViewProps) {
  const currentMin = threshold.min ?? boundary.min
  const currentMax = threshold.max ?? boundary.max

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-default-50/50 hover:bg-default-50 transition-colors">
      {/* Top Row: Values & Edit Button */}
      <div className="flex items-center justify-between gap-3">
        {/* Display Values */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Min
            </span>
            <span className="text-lg font-semibold text-foreground">
              {currentMin}
            </span>
          </div>
          <div className="h-8 w-1 bg-default-200 rounded-full" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Max
            </span>
            <span className="text-lg font-semibold text-foreground">
              {currentMax}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <Button
          onClick={onEditClick}
          size="sm"
          variant="outline"
          className="text-primary"
          aria-label={`Edit threshold for ${methodName}`}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>

      {/* Disabled Slider Visualization */}
      <div className="space-y-2 pt-2 border-t border-default-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Range Visualization
          </span>
          <span className="text-xs text-muted-foreground">
            {boundary.min} - {boundary.max}
          </span>
        </div>
        <Slider
          min={boundary.min}
          max={boundary.max}
          step={1}
          value={[currentMin, currentMax]}
          disabled
          color="primary"
          size="md"
          radius="md"
          className="w-full opacity-60"
          aria-label="Disabled threshold range visualization"
          aria-valuemin={boundary.min}
          aria-valuemax={boundary.max}
          aria-valuenow={currentMin}
        />
      </div>

      {/* Range Preview */}
      <div className="flex justify-between items-center px-3 py-2 rounded-md bg-background border border-default-200 text-xs">
        <div>
          <span className="text-muted-foreground">Inherited Range: </span>
          <span className="font-semibold text-foreground">{boundary.min}</span>
        </div>
        <div className="text-muted-foreground">to</div>
        <div>
          <span className="font-semibold text-foreground">{boundary.max}</span>
        </div>
      </div>
    </div>
  )
}
