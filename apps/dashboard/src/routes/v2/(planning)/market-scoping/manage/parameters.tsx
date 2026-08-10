/**
 * Market Scoping Parameters Management Route
 * URL: /v2/market-scoping/manage/parameters
 * 
 * CRUD interface for managing NGPA evaluation parameters
 */

import { createFileRoute } from '@tanstack/react-router'
import ManageParametersPage from '@/pages/planning/market-scoping/ManageParametersPage'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/manage/parameters'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManageParametersPage />
}
