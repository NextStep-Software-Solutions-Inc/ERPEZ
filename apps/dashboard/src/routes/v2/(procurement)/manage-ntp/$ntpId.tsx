import { createFileRoute } from '@tanstack/react-router'
import { NTPDetailsPage } from '@/features/procurement/ntp'

export const Route = createFileRoute('/v2/(procurement)/manage-ntp/$ntpId')({
  component: ManageNtpDetailsRoute,
})

interface ManageNtpDetailsRouteParams {
  ntpId: string
}

function ManageNtpDetailsRoute() {
  const { ntpId } = Route.useParams() as ManageNtpDetailsRouteParams
  
  return <NTPDetailsPage ntpId={ntpId} isAdmin={true} />
}
