/**
 * Market Scoping Parameters Management Route
 * URL: /v2/market-scoping/manage/parameters
 * 
 * CRUD interface for managing NGPA evaluation parameters
 */

import { createFileRoute } from '@tanstack/react-router'
import ManageParametersPage from '@/pages/planning/market-scoping/ManageParametersPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/manage/parameters'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.MarketScoping.Manage}
      message="You do not have permission to manage Market Scoping evaluation parameters."
    >
      <ManageParametersPage />
    </RoutePermissionGuard>
  )
}
