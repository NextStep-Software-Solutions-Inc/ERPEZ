import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SupplierDirectContractingDetailPage } from '@/features/procurement/supplier-portal/pages/SupplierDirectContractingDetailPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const supplierDirectContractingDetailSearchSchema = z.object({
  supplierId: z.string().optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/supplier-portal/direct-contracting-item/$id',
)({
  component: SupplierPortalDCItemDetailRoute,
  validateSearch: supplierDirectContractingDetailSearchSchema,
})

function SupplierPortalDCItemDetailRoute() {
  const { id } = Route.useParams()
  const { supplierId } = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Supplier.View,
        PERMISSIONS.Procurement.Po.Manage,
      ]}
      message="You do not have permission to view Direct Contracting items."
    >
      <SupplierDirectContractingDetailPage id={id} supplierId={supplierId} />
    </RoutePermissionGuard>
  )
}

