/**
 * Organizational Structure Layout Route
 * URL prefix: /v2/_planning/organization/
 * 
 * Shared layout wrapper for all organizational structure routes
 * This is a layout route that wraps child routes while keeping the URL clean.
 * 
 * Route Hierarchy:
 * - /v2/planning/organizational-structure/ (index route)
 * - All child routes rendered within this layout
 * 
 * File structure: src/routes/v2/planning/organizational-structure/layout.tsx
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * Layout Route Configuration
 * 
 * This creates a layout route without adding to the URL path.
 * All child routes in this directory will be wrapped by this layout component.
 */
export const Route = createFileRoute('/v2/_planning/organization/layout')({
  component: OrganizationalStructureLayout,
})

/**
 * Organizational Structure Layout Component
 * 
 * Provides the shared layout structure for all organizational structure routes
 * Renders child routes via <Outlet />
 */
function OrganizationalStructureLayout() {
  return (
    <div>
      {/* Child routes render here via Outlet */}
      <Outlet />
    </div>
  )
}
