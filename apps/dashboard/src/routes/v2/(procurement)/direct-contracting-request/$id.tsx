import { createFileRoute } from '@tanstack/react-router'
import { DirectContractingDetailPage } from '@/features/procurement/direct-contracting/pages/DirectContractingDetailPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/direct-contracting-request/$id'
)({
  component: DirectContractingDetailRoute,
})

function DirectContractingDetailRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Direct Contracting Requests."
    >
      <DirectContractingDetailPage id={id} />
    </RoutePermissionGuard>
  )
}
