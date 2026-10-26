import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DirectContractingDetailPage } from '@/features/procurement/direct-contracting/pages/DirectContractingDetailPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const directContractingDetailSearchSchema = z.object({
  tab: z
    .enum(['quotation', 'bac-project', 'supplier'])
    .catch('quotation')
    .default('quotation'),
})

export type DirectContractingDetailSearch = z.infer<
  typeof directContractingDetailSearchSchema
>

export const Route = createFileRoute(
  '/v2/(procurement)/direct-contracting-request/$id'
)({
  component: DirectContractingDetailRoute,
  validateSearch: directContractingDetailSearchSchema,
})

function DirectContractingDetailRoute() {
  const { id } = Route.useParams()
  const { tab } = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Direct Contracting Requests."
    >
      <DirectContractingDetailPage id={id} tab={tab} />
    </RoutePermissionGuard>
  )
}
