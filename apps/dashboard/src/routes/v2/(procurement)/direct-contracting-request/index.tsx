import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DirectContractingRequestPage } from '@/features/procurement/direct-contracting/pages/DirectContractingRequestPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

/**
 * Search parameters schema for direct-contracting-request route
 * Validates and provides type-safe access to query parameters
 */
export const directContractingRequestSearchSchema = z.object({
  pageSize: z.number().optional().default(10),
  pageNumber: z.number().optional().default(1),
  searchQuery: z.string().optional(),
  status: z.string().optional().default('all'),
})

export type DirectContractingRequestSearch = z.infer<
  typeof directContractingRequestSearchSchema
>

export const Route = createFileRoute('/v2/(procurement)/direct-contracting-request/')({
  component: DirectContractingRequestRoute,
  validateSearch: directContractingRequestSearchSchema,
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

