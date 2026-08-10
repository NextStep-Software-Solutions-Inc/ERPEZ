import { Outlet } from '@tanstack/react-router'
import { useKeycloak } from '@/providers/KeycloakProvider'

export default function ProtectedLayout() {
  const { isAuthenticated, isInitialized, login } = useKeycloak()

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    login()
    return null
  }

  return <Outlet />
}
