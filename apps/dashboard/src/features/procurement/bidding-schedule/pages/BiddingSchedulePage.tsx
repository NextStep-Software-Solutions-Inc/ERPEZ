import { BiddingScheduleWorkspace } from '../components/BiddingScheduleWorkspace'
import { PageContainerDashtail } from '@/components/v2'
import { useBacResolution } from '../../bac-resolution/handlers/hooks'
import type { BacResolutionListRoutePath } from '../../bac-resolution/types'

interface BiddingSchedulePageProps {
  bacResolutionId: string
  highlightMilestoneKey?: string
  backTo?: BacResolutionListRoutePath
  backLabel?: string
}

export function BiddingSchedulePage({
  bacResolutionId,
  highlightMilestoneKey,
  backTo = '/v2/bac-resolutions',
  backLabel = 'Back to BAC Resolutions',
}: BiddingSchedulePageProps) {
  const { data: resolutionResponse } = useBacResolution({
    pathParams: { id: bacResolutionId },
    queryParams: {},
  })
  const resolutionNumber =
    resolutionResponse?.data?.resolutionNumber || 'BAC Resolution'

  return (
    <PageContainerDashtail
      title={`${resolutionNumber} — Bidding Schedule`}
      description="Generate and manage the legally compliant bidding calendar for this procurement project."
      headerVariant="branded"
      mode="simple"
      contentType="default"
      backTo={backTo}
      backLabel={backLabel}
      containerClassName="h-full min-h-0"
      contentClassName="space-y-4"
    >
      <BiddingScheduleWorkspace
        bacResolutionId={bacResolutionId}
        highlightMilestoneKey={highlightMilestoneKey}
        bacListRoutePath={backTo}
      />
    </PageContainerDashtail>
  )
}
