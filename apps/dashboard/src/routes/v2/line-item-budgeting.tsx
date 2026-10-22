import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { z } from 'zod'
import LineItemBudgetingPage from '@/pages/planning/line-item-budgeting/LineItemBudgetingPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

/**
 * Line-Item Budgeting route tabs enumeration
 * Represents all available tab sections in the LIB dashboard
 */
export const lineItemBudgetingTabs = [
  'master-budget',
  'ceiling-management',
  'department-ceiling',
  'line-item-budget',
  // 'subdu-libs',
  'realignment',
] as const

export type LineItemBudgetingTab = (typeof lineItemBudgetingTabs)[number]

/**
 * Search parameters schema for line-item-budgeting route
 * Validates and provides type-safe access to query parameters
 */
export const lineItemBudgetingSearchSchema = z.object({
  tab: z
    .enum(lineItemBudgetingTabs)
    .optional()
    .default('master-budget' as const),
  libId: z.string().optional(),
  libActivityId: z.string().optional(),
  officeId: z.string().optional(),
  wfpObjectiveActivityId: z.string().optional(),
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchQuery: z.string().optional(),
  selectedYear: z.string().optional(),
  selectedStatuses: z.string().optional(),
  selectedSourceTypes: z.string().optional(),
  fiscalYearId: z.string().optional(),
  source: z.enum(['all', 'activity', 'opcr', 'project']).optional(),
  wfpId: z.string().optional(),
})

export type LineItemBudgetingSearch = z.infer<
  typeof lineItemBudgetingSearchSchema
>

export const Route = createFileRoute('/v2/line-item-budgeting')({
  component: RouteComponent,
  validateSearch: lineItemBudgetingSearchSchema,
})

function RouteComponent() {
  const location = useLocation()

  // Check if we're on a child route (detail page)
  // If the pathname includes a libId (e.g., /v2/line-item-budgeting/LIB-002), render Outlet
  // Otherwise, render the main list page
  const isDetailPage = /^\/v2\/line-item-budgeting\/[^/]+$/.test(
    location.pathname,
  )

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Lib.View}
      message="You do not have permission to view Line-Item Budgeting."
    >
      {isDetailPage ? <Outlet /> : <LineItemBudgetingPage />}
    </RoutePermissionGuard>
  )
}
