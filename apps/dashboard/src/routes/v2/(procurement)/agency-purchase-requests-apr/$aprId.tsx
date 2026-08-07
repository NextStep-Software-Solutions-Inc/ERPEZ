import APRDetailsPage from '@/pages/procurement/apr/APRDetailsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v2/(procurement)/agency-purchase-requests-apr/$aprId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { aprId } = Route.useParams()
  return <APRDetailsPage aprId={aprId} />
}
