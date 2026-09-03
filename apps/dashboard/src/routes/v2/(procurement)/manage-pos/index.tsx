import { createFileRoute } from '@tanstack/react-router'
import { ProcurementPlaceholderPage } from '@/pages/procurement/ProcurementPlaceholderPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-pos/')({
  component: ManagePosRoute,
})

function ManagePosRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage POS."
    >
      <ProcurementPlaceholderPage
        title="Manage POS"
        description="Purchase orders management placeholder page for procurement."
      />
    </RoutePermissionGuard>
  )
}
