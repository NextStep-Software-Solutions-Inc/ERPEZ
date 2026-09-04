import { createFileRoute } from '@tanstack/react-router'
import { APPDetailsPage } from '@/pages/planning/app-consolidation/APPDetailsPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/$appId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.App.Manage}
      message="You do not have permission to view APP details."
    >
      <APPDetailsPage />
    </RoutePermissionGuard>
  )
}
