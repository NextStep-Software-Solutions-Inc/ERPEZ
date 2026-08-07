/**
 * Pathless Planning Route Group Layout
 * URL: /v2/* (Planning modules - organization, strategy, etc.)
 * 
 * This is a pathless layout route that groups planning-related routes
 * without adding "/planning/" to the URL. All child routes under this
 * layout maintain clean URLs (e.g., /v2/organization).
 * 
 * Shared Features:
 * - Planning-specific header/sub-navigation
 * - Consistent padding and spacing (Dashtail)
 * - Context and state for planning modules
 * 
 * Route Hierarchy:
 * - /v2/organization (organization management)
 * - /v2/strategy (future: strategy planning)
 * - /v2/roadmap (future: roadmap planning)
 * 
 * File structure: src/routes/v2/_planning.tsx
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * Pathless Layout Route Configuration
 * 
 * The underscore prefix (_planning) indicates a pathless route group.
 * This layout wraps child routes without adding to the URL path.
 * Child routes are rendered via <Outlet />.
 */
export const Route = createFileRoute('/v2/_planning')({
  component: PlanningLayout,
})

/**
 * Planning Layout Component
 * 
 * Provides the shared layout structure for all planning-related routes.
 * Acts as a wrapper that:
 * - Applies consistent spacing and styling
 * - Could contain planning-specific header/navigation
 * - Manages planning-related context (future enhancement)
 * - Renders child routes via <Outlet />
 */
function PlanningLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Planning-specific header/sub-navigation could go here */}
      
      {/* Child routes (organization, strategy, etc.) render here */}
      <Outlet />
    </div>
  )
}
