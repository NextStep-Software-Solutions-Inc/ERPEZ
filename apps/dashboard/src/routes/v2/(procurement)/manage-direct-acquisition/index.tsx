import { createFileRoute } from '@tanstack/react-router'
import ManageDirectAcquisitionPage from '@/features/procurement/direct-acquisition/pages/ManageDirectAcquisitionPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-direct-acquisition/')({
  component: ManageDirectAcquisitionRoute,
})

function ManageDirectAcquisitionRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage Direct Acquisitions."
    >
      <ManageDirectAcquisitionPage />
    </RoutePermissionGuard>
  )
}
