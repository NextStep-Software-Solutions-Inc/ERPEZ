import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardDetailsPage } from '@/features/procurement/notice-of-award/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-noa/$noaId/')({
  component: ManageNoaDetailsRoute,
})

function ManageNoaDetailsRoute() {
  const { noaId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to manage Notice of Award details."
    >
      <NoticeOfAwardDetailsPage
        noaId={noaId}
        role="hope"
        backTo="/v2/manage-noa"
      />
    </RoutePermissionGuard>
  )
}
