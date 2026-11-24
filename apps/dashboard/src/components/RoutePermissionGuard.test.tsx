import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoutePermissionGuard } from './RoutePermissionGuard'
import * as usePermissionsModule from '@/hooks/usePermissions'

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}))

describe('RoutePermissionGuard', () => {
  it('renders children when user has required permission', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: ['finance.uacs.view'],
      isSuperAdmin: false,
      status: 'success',
      isLoading: false,
      isLoaded: true,
      isError: false,
      hasPermission: (p: string) => p === 'finance.uacs.view',
      hasAnyPermission: (perms: readonly string[]) => perms.includes('finance.uacs.view'),
      hasAllPermissions: () => false,
      refetch: vi.fn(),
    } as any)

    render(
      <RoutePermissionGuard permission="finance.uacs.view">
        <div data-testid="protected-content">UACS Library Content</div>
      </RoutePermissionGuard>
    )

    expect(screen.getByTestId('protected-content')).toBeDefined()
    expect(screen.queryByText('Access Denied')).toBeNull()
  })

  it('renders AccessDeniedFallback when user lacks required permission', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: ['planning.dashboard.view_global'],
      isSuperAdmin: false,
      status: 'success',
      isLoading: false,
      isLoaded: true,
      isError: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      refetch: vi.fn(),
    } as any)

    render(
      <RoutePermissionGuard
        permission="finance.uacs.view"
        message="You do not have permission to access the UACS Library."
      >
        <div data-testid="protected-content">UACS Library Content</div>
      </RoutePermissionGuard>
    )

    expect(screen.queryByTestId('protected-content')).toBeNull()
    expect(screen.getByText('Access Denied')).toBeDefined()
    expect(
      screen.getByText('You do not have permission to access the UACS Library.')
    ).toBeDefined()
  })

  it('bypasses permission checks for superadmin', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: [],
      isSuperAdmin: true,
      status: 'success',
      isLoading: false,
      isLoaded: true,
      isError: false,
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      refetch: vi.fn(),
    } as any)

    render(
      <RoutePermissionGuard permission="finance.uacs.view">
        <div data-testid="protected-content">UACS Library Content</div>
      </RoutePermissionGuard>
    )

    expect(screen.getByTestId('protected-content')).toBeDefined()
  })
})
