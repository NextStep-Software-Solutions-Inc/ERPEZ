import { createFileRoute } from '@tanstack/react-router'
import { NTPDetailsPage } from '@/features/procurement/ntp'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-ntp/$ntpId')({
  component: ManageNtpDetailsRoute,
})

interface ManageNtpDetailsRouteParams {
  ntpId: string
}

function ManageNtpDetailsRoute() {
  const { ntpId } = Route.useParams() as ManageNtpDetailsRouteParams
  
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage this Notice to Proceed."
    >
      <NTPDetailsPage ntpId={ntpId} isAdmin={true} />
    </RoutePermissionGuard>
  )
}
