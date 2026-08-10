import { getMockBiddingDocumentDatabase } from '../../bidding-documents/data/mockBiddingDocumentsData'
import { useBiddingDocumentsStore } from '../../bidding-documents/store/biddingDocumentsStore'
import { getMockBiddingScheduleDatabase } from '../../bidding-schedule/data/mockBiddingScheduleData'
import { useBiddingScheduleStore } from '../../bidding-schedule/store/biddingScheduleStore'
import { resolveBacExecutionState } from '../utils/bacResolutionWorkflow'
import type { BacResolution } from '../types'
import { Badge } from '@/components/ui/badge'

interface BacResolutionExecutionBadgesProps {
  resolution: BacResolution
  helperTextClassName?: string
}

export function BacResolutionExecutionBadges({
  resolution,
  helperTextClassName = 'text-xs text-muted-foreground',
}: BacResolutionExecutionBadgesProps) {
  const schedule = useBiddingScheduleStore(
    (state) =>
      state.schedules.find(
        (candidate) => candidate.bacResolutionId === resolution.id,
      ) ?? null,
  )
  const biddingDocument = useBiddingDocumentsStore(
    (state) =>
      state.documents.find(
        (candidate) => candidate.bacResolutionId === resolution.id,
      ) ?? null,
  )
  const fallbackSchedule =
    schedule ??
    getMockBiddingScheduleDatabase().find(
      (candidate) => candidate.bacResolutionId === resolution.id,
    ) ??
    null
  const fallbackBiddingDocument =
    biddingDocument ??
    getMockBiddingDocumentDatabase().find(
      (candidate) => candidate.bacResolutionId === resolution.id,
    ) ??
    null
  const executionState = resolveBacExecutionState({
    resolution,
    schedule: fallbackSchedule,
    biddingDocumentStatus: fallbackBiddingDocument?.status ?? null,
  })

  if (!executionState.primaryLabel && !executionState.secondaryLabel) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {executionState.primaryLabel ? (
          <Badge variant="outline" color="info">
            {executionState.primaryLabel}
          </Badge>
        ) : null}
        {executionState.secondaryLabel ? (
          <Badge variant="outline" color="success">
            {executionState.secondaryLabel}
          </Badge>
        ) : null}
      </div>
      {executionState.helperText ? (
        <p className={helperTextClassName}>{executionState.helperText}</p>
      ) : null}
    </div>
  )
}
