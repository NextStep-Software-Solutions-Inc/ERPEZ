import { createFileRoute } from '@tanstack/react-router'
import ProcurementDashboardPage from '@/features/procurement/dashboard/pages/ProcurementDashboardPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/procurement-dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Ppmp.View,
        PERMISSIONS.Procurement.App.Manage,
        PERMISSIONS.Procurement.Pr.Manage,
      ]}
      message="You do not have permission to view the Procurement Dashboard."
    >
      <ProcurementDashboardPage />
    </RoutePermissionGuard>
  )
}
