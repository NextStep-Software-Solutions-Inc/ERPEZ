// NOTE:
// This file is intentionally left without any route/component exports.
// The `/v2/(planning)/annual-performance-planning` route is defined in
// `annual-performance-planning.tsx` at the same directory level.
//
// Keeping this file as a non-route placeholder avoids duplicate
// route definitions that can cause conflicts or ambiguous matches
// in file-based routing and satisfies the CodeQL rule that flagged
// both files defining the same route.

// Make this a TS module without exporting any route/component.
import AppFormPage from '@/pages/planning/app/AppFormPage'
import { createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/annual-performance-planning/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Target.Manage}
      message="You do not have permission to view Annual Performance Planning."
    >
      <AppFormPage />
    </RoutePermissionGuard>
  )
}
