import { Outlet, useLocation } from '@tanstack/react-router'
import { AccessDeniedFallback } from '../AccessDeniedFallBack'
import type {UserRole} from '@/types/roles';
import LoadingSpinner from '@/components/LoadingSpinner'
import { useKeycloak } from '@/providers/KeycloakProvider'
import { ALLOWED_ROUTE_PREFIXES  } from '@/types/roles'

export default function PlanningRoleLayout() {
  const { role, isInitialized } = useKeycloak()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Checking user permissions..." />
      </div>
    )
  }

  if (!role) {
    return <AccessDeniedFallback />
  }

  const userRole = role as UserRole
  const allowedPrefixes = ALLOWED_ROUTE_PREFIXES[userRole]
  const currentPath = location.pathname

  // Check if current path matches any allowed prefix exactly or as a proper path segment
  const isAllowed = allowedPrefixes.some(
    (prefix) => currentPath === prefix || currentPath.startsWith(prefix + '/'),
  )

  if (!isAllowed) {
    return <AccessDeniedFallback role={userRole} />
  }

  return <Outlet />
}
