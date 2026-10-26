import { createFileRoute, redirect } from '@tanstack/react-router'
import { ManageBacResolutionsPage } from '@/features/procurement/bac-resolution/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-bac-resolutions/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/bac-resolutions',
      search: { id: undefined },
      replace: true,
    })
  },
  component: () => null,
})

function ManageBacResolutionsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to manage BAC Resolutions."
    >
      <ManageBacResolutionsPage />
    </RoutePermissionGuard>
  )
}
