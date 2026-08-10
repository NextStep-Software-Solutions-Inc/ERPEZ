/**
 * Market Scoping Activity Types Management Route
 * URL: /v2/market-scoping/manage/activities
 * 
 * CRUD interface for managing market research activity types
 */

import { createFileRoute } from '@tanstack/react-router'
import ManageActivityTypesPage from '@/pages/planning/market-scoping/ManageActivityTypesPage'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/manage/activities'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManageActivityTypesPage />
}
