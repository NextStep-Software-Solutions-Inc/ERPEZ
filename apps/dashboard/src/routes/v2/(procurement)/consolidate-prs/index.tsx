import { createFileRoute } from '@tanstack/react-router'
import ConsolidatePrsPage from '@/pages/procurement/ConsolidatePrsPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/consolidate-prs/')({
  component: ConsolidatePrsRoute,
})

function ConsolidatePrsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Manage}
      message="You do not have permission to consolidate Purchase Requests."
    >
      <ConsolidatePrsPage />
    </RoutePermissionGuard>
  )
}
