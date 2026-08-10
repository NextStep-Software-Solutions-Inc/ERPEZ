import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * UACS Library Parent Route
 * Uses v2 layout system (DashboardLayoutProvider) instead of UnifiedLayout
 */
export const Route = createFileRoute('/v2/(planning)/uacs-library')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
