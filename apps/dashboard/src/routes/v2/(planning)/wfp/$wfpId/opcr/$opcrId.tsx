import { createFileRoute } from '@tanstack/react-router'
import OPCRDetailPage from '@/pages/planning/wfp/OPCRDetailPage'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/opcr/$opcrId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpId, opcrId } = Route.useParams()
  return <OPCRDetailPage wfpId={wfpId} opcrId={opcrId} />
}
