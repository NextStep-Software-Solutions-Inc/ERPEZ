import { createFileRoute } from '@tanstack/react-router'
import { ManageAPRsAdminPage } from '@/pages/procurement/apr/ManageAPRsAdminPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-aprs/')({
  component: ManageAprsRoute,
})

function ManageAprsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Manage}
      message="You do not have permission to manage APRs."
    >
      <ManageAPRsAdminPage />
    </RoutePermissionGuard>
  )
}
