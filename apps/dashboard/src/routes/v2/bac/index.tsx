import { createFileRoute } from '@tanstack/react-router'
import { BACPublicPortalPage } from '@/features/procurement/bac-public-portal/pages/BACPublicPortalPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/bac/')({
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
  }),
  component: BACPublicPortalRoute,
})

function BACPublicPortalRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to access the BAC Portal."
    >
      <BACPublicPortalPage />
    </RoutePermissionGuard>
  )
}
