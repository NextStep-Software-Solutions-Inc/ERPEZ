import { createFileRoute } from '@tanstack/react-router'
import WFPObjectiveDetailPage from '@/pages/planning/wfp/WFPObjectiveDetailPage'

export const Route = createFileRoute('/v1/planning/wfp-objective/$wfpObjectiveId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpObjectiveId } = Route.useParams()
  return <WFPObjectiveDetailPage wfpObjectiveId={wfpObjectiveId} />
}
