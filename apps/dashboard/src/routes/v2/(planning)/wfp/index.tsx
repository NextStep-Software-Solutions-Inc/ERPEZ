import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import WFPPage from '@/pages/planning/wfp/WFPPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  search: z.string().optional(),
  wfpSearch: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  create: z.boolean().optional(),
  delete: z.boolean().optional(),
  update: z.boolean().optional(),
  edit: z.boolean().optional(),
})

export const Route = createFileRoute('/v2/(planning)/wfp/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Wfp.View}
      message="You do not have permission to view Work and Financial Plans."
    >
      <WFPPage />
    </RoutePermissionGuard>
  )
}
