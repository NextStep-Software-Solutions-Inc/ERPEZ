import { createFileRoute } from '@tanstack/react-router'
import WFPOPCRActivityExpenditureDetailPage from '@/pages/planning/wfp/WFPOPCRActivityExpenditureDetailPage'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/activity/$activityId/expenditures')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpId, activityId } = Route.useParams()
  return <WFPOPCRActivityExpenditureDetailPage wfpId={wfpId} activityId={activityId} />
}
