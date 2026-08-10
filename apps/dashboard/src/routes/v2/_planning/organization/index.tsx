/**
 * Organizational Structure Index Route
 * URL: /v2/_planning/organization/  (handled by the file router)
 *
 * Primary entry point for organization management and structure. Rendered
 * inside the `organization/layout.tsx` layout so the tabs and navigation
 * persist across child routes.
 *
 * Features included:
 * - Tab navigation (Structural Management, Staffing & Plantilla,
 *   Personnel Reporting, Settings)
 * - Search and filter parameters
 * - Pagination and sorting
 *
 * File location: src/routes/v2/_planning/organization/index.tsx
 */

import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import OrganizationLayout from '@/pages/planning/organization/OrganizationLayout'
import OrganizationStructurePage from '@/pages/planning/organization/OrganizationStructurePage'

/**
 * Search Parameters Schema
 * 
 * Defines all valid query parameters for the organizational structure route.
 * Includes pagination, sorting, tab selection, and tab-specific search fields.
 */
const searchSchema = z.object({
  // Pagination
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),

  // Generic search
  search: z.string().optional(),

  // Tab-specific search fields
  staffingSearch: z.string().optional(),
  plantillaSearch: z.string().optional(),
  structuralSearch: z.string().optional(),

  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

  // Tab selection
  tab: z
    .enum(['structural-management', 'staffing-and-plantilla', 'personnel-reporting', 'settings'])
    .optional()
    .default('structural-management'),
})

/**
 * Route Configuration
 * 
 * Defines the route path and validates search parameters using Zod schema.
 * Integrates with TanStack Router's route generation system.
 */
export const Route = createFileRoute('/v2/_planning/organization/')({
  component: OrganizationalStructureIndexRoute,
  validateSearch: searchSchema,
})

/**
 * Organizational Structure Index Route Component
 * 
 * Renders the main organizational structure management interface with:
 * - Tab-based navigation
 * - Content area for current tab
 * - Search and filter capabilities
 */
function OrganizationalStructureIndexRoute() {
  return (
    <OrganizationLayout>
      <OrganizationStructurePage />
    </OrganizationLayout>
  )
}
