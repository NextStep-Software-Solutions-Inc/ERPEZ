import APRDetailsPage from '@/pages/procurement/apr/APRDetailsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/manage-aprs/$aprId')({
  component: ManageAPRDetailsRoute,
})

function ManageAPRDetailsRoute() {
  const { aprId } = Route.useParams()
  return <APRDetailsPage aprId={aprId} isReviewerMode={true} />
}
