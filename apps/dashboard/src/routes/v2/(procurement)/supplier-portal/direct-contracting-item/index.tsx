import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DirectContractingItemPage } from '@/features/procurement/supplier-portal/pages/DirectContractingItemPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

/**
 * Search parameters schema for supplier portal direct-contracting-item route
 */
export const supplierDirectContractingSearchSchema = z.object({
  pageSize: z.coerce.number().min(1).catch(10).default(10),
  pageNumber: z.coerce.number().min(1).catch(1).default(1),
  searchQuery: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  status: z.string().optional().default('all'),
})

export type SupplierDirectContractingSearch = z.infer<
  typeof supplierDirectContractingSearchSchema
>

export const Route = createFileRoute('/v2/(procurement)/supplier-portal/direct-contracting-item/')({
  component: SupplierPortalDCItemRoute,
  validateSearch: supplierDirectContractingSearchSchema,
})

function SupplierPortalDCItemRoute() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Supplier.View,
        PERMISSIONS.Procurement.Po.Manage,
      ]}
      message="You do not have permission to view Direct Contracting items."
    >
      <DirectContractingItemPage />
    </RoutePermissionGuard>
  )
}

