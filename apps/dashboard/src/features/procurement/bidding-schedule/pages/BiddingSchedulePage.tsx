import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import useBiddingScheduleService from '../hooks/useBiddingScheduleService'
import { BiddingScheduleWorkspace } from '../components/BiddingScheduleWorkspace'
import { PageContainerDashtail } from '@/components/v2'
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
  const navigate = useNavigate()
  const service = useBiddingScheduleService(bacResolutionId)
  const { bacResolution } = service

  useEffect(() => {
    if (!bacResolution) {
      void navigate({ to: backTo, replace: true })
    }
  }, [bacResolution, backTo, navigate])

  if (!bacResolution) {
    return null
  }

  return (
    <PageContainerDashtail
      title={`${bacResolution.bacResolutionNumber} — Bidding Schedule`}
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
        service={service}
        highlightMilestoneKey={highlightMilestoneKey}
        bacListRoutePath={backTo}
      />
    </PageContainerDashtail>
  )
}
