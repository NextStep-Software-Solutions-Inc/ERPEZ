import { createFileRoute } from '@tanstack/react-router'
import { ManageContractsPage } from '@/features/procurement/contract'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-contracts/')({
  component: ManageContractsRoute,
})

function ManageContractsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage Contracts."
    >
      <ManageContractsPage />
    </RoutePermissionGuard>
  )
}
