import { createFileRoute } from '@tanstack/react-router'
import OPCRActivitiesExpenditureListPage from '@/pages/planning/wfp/OPCRActivitiesExpenditureListPage'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/opcr/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpId } = Route.useParams()
  return <OPCRActivitiesExpenditureListPage wfpId={wfpId} opcrId="" />
}
