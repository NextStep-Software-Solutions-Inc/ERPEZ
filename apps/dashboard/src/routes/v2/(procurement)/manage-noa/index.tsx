import { createFileRoute } from '@tanstack/react-router'
import { ManageNoticeOfAwardsPage } from '@/features/procurement/notice-of-award/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-noa/')({
  component: ManageNoaRoute,
})

function ManageNoaRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to manage Notice of Awards (NOA)."
    >
      <ManageNoticeOfAwardsPage />
    </RoutePermissionGuard>
  )
}
