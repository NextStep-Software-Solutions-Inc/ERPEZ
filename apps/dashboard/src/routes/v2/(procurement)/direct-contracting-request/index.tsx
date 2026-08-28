import { createFileRoute } from '@tanstack/react-router'
import { DirectContractingRequestPage } from '@/features/procurement/direct-contracting/pages/DirectContractingRequestPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/direct-contracting-request/')({
  component: DirectContractingRequestRoute,
})

function DirectContractingRequestRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Direct Contracting Requests."
    >
      <DirectContractingRequestPage />
    </RoutePermissionGuard>
  )
}
