import { createFileRoute } from '@tanstack/react-router'
import { NTPListPage } from '@/features/procurement/ntp'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/ntp/')({
  component: NoticeToProceedNtpRoute,
})

function NoticeToProceedNtpRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Notice to Proceed (NTP)."
    >
      <NTPListPage />
    </RoutePermissionGuard>
  )
}
