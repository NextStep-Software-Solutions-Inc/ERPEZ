import { createFileRoute } from '@tanstack/react-router'
import { NTPDetailsPage } from '@/features/procurement/ntp'

export const Route = createFileRoute('/v2/ntp/$ntpId')({
  component: NoticeToProceedNtpDetailsRoute,
})

interface NTPDetailsRouteParams {
  ntpId: string
}

function NoticeToProceedNtpDetailsRoute() {
  const { ntpId } = Route.useParams() as NTPDetailsRouteParams
  
  return <NTPDetailsPage ntpId={ntpId} />
}
