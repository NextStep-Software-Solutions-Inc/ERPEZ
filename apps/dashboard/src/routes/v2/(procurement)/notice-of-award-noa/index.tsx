import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardsPage } from '@/features/procurement/notice-of-award/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/notice-of-award-noa/')({
  component: NoticeOfAwardNoaRoute,
})

function NoticeOfAwardNoaRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view Notice of Awards (NOA)."
    >
      <NoticeOfAwardsPage />
    </RoutePermissionGuard>
  )
}
