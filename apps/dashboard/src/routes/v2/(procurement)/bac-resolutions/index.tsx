import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BacResolutionsPage } from '@/features/procurement/bac-resolution/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  id: z.string().optional(),
})

export const Route = createFileRoute('/v2/(procurement)/bac-resolutions/')({
  validateSearch: searchSchema,
  component: BacResolutionsRoute,
})

function BacResolutionsRoute() {
  const search = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view BAC Resolutions."
    >
      <BacResolutionsPage selectedId={search.id} />
    </RoutePermissionGuard>
  )
}
