import { createFileRoute } from '@tanstack/react-router'
import WFPDetailPage from '@/pages/planning/wfp/WFPDetailPage'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpId } = Route.useParams()
  return <WFPDetailPage wfpId={wfpId} />
}
