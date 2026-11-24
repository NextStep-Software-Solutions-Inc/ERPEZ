import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierPortalProjectPage from '@/features/procurement/manage-supplier-portal/pages/ManageSupplierPortalProjectPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/manage-supplier-portal/$projectId',
)({
  component: ManageSupplierPortalProjectRoute,
})

function ManageSupplierPortalProjectRoute() {
  const { projectId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Supplier.Manage}
      message="You do not have permission to manage this Supplier Portal project."
    >
      <ManageSupplierPortalProjectPage projectId={projectId} />
    </RoutePermissionGuard>
  )
}
