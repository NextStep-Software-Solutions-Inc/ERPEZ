import { createFileRoute } from '@tanstack/react-router'
import { NTPDetailsPage } from '@/features/procurement/ntp'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/notice-to-proceed-ntp/$ntpId'
)({
  component: NoticeToProceedNtpDetailsRoute,
})

interface NTPDetailsRouteParams {
  ntpId: string
}

function NoticeToProceedNtpDetailsRoute() {
  const { ntpId } = Route.useParams() as NTPDetailsRouteParams
  
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Notice to Proceed details."
    >
      <NTPDetailsPage ntpId={ntpId} />
    </RoutePermissionGuard>
  )
}
