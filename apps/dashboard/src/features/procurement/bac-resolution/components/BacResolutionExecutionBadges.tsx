import type { BacResolution } from '../types'
import { Badge } from '@/components/ui/badge'

interface BacResolutionExecutionBadgesProps {
  resolution: BacResolution
  showHelperText?: boolean
  helperTextClassName?: string
}

type ExecutionState = {
  label?: string
  secondaryLabel?: string
  helperText?: string
} | null

export function BacResolutionExecutionBadges({
  resolution: _resolution,
  showHelperText = false,
  helperTextClassName = 'text-xs text-muted-foreground',
}: BacResolutionExecutionBadgesProps) {
  const executionState: ExecutionState = null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {executionState ? (
        <Badge
          variant="outline"
          color="info"
          className="text-[10px] px-1.5 py-0"
        >
          {executionState}
        </Badge>
      ) : null}
      {executionState ? (
        <Badge
          variant="outline"
          color="success"
          className="text-[10px] px-1.5 py-0"
        >
          {executionState.secondaryLabel}
        </Badge>
      ) : null}
      {showHelperText && executionState.helperText ? (
        <p className={helperTextClassName}>{executionState.helperText}</p>
      ) : null}
    </div>
  )
}
