import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import type {UserRole} from '@/types/roles';
import { ROLE_DISPLAY_NAMES  } from '@/types/roles'

export function AccessDeniedFallback({ role }: { role?: UserRole }) {
  const roleName = role ? ROLE_DISPLAY_NAMES[role] : 'User'

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          {roleName} does not have permission to access this page.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
