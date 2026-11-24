import { createFileRoute } from '@tanstack/react-router'
import { ManageNTPListPage } from '@/features/procurement/ntp'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-ntp/')({
  component: ManageNtpRoute,
})

function ManageNtpRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage Notice to Proceed (NTP)."
    >
      <ManageNTPListPage />
    </RoutePermissionGuard>
  )
}
