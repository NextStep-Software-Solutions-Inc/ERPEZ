import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { PublicBacResolutionsPage } from '@/features/procurement/bac-resolution/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
  id: z.string().optional(),
  role: z.enum(['procurement-staff', 'bac-chairperson']).optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions-public-bidding/',
)({
  validateSearch: searchSchema,
  component: PublicBacResolutionsRoute,
})

function PublicBacResolutionsRoute() {
  const search = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view Public Bidding BAC Resolutions."
    >
      <PublicBacResolutionsPage
        selectedResolutionId={search.selectedResolutionId}
        role={search.role}
      />
    </RoutePermissionGuard>
  )
}
