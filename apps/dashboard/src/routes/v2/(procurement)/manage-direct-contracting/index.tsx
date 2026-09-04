import { ManageDirectContractingPage } from '@/features/procurement/direct-contracting/pages/ManageDirectContractingPage'
import { createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-direct-contracting/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage Direct Contracting."
    >
      <ManageDirectContractingPage />
    </RoutePermissionGuard>
  )
}
