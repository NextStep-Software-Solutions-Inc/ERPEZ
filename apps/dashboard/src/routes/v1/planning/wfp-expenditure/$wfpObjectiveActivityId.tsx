import { createFileRoute } from '@tanstack/react-router'
import WFPExpenditurePage from '@/pages/planning/wfp/WFPExpenditurePage'

export const Route = createFileRoute(
  '/v1/planning/wfp-expenditure/$wfpObjectiveActivityId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpObjectiveActivityId } = Route.useParams()
  return <WFPExpenditurePage wfpObjectiveActivityId={wfpObjectiveActivityId} />
}

