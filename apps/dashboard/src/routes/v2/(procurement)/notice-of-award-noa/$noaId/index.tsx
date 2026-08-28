import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardDetailsPage } from '@/features/procurement/notice-of-award/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/notice-of-award-noa/$noaId/',
)({
  component: NoticeOfAwardNoaDetailsRoute,
})

function NoticeOfAwardNoaDetailsRoute() {
  const { noaId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view Notice of Award details."
    >
      <NoticeOfAwardDetailsPage
        noaId={noaId}
        role="procurement-staff"
        backTo="/v2/notice-of-award-noa"
      />
    </RoutePermissionGuard>
  )
}
