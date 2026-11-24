import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFilteredNavMenus } from './useFilteredNavMenus'
import * as usePermissionsModule from './usePermissions'
import { PERMISSIONS } from '@/constants/permissions'

vi.mock('./usePermissions', () => ({
  usePermissions: vi.fn(),
}))

describe('useFilteredNavMenus', () => {
  it('returns empty lists when permissions are not yet loaded (fail-closed)', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: [],
      isSuperAdmin: false,
      status: 'loading',
      isLoading: true,
      isLoaded: false,
      isError: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => useFilteredNavMenus())
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.classic).toEqual([])
    expect(result.current.modern).toEqual([])
  })

  it('returns all navigation items if isSuperAdmin is true', () => {
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

    const { result } = renderHook(() => useFilteredNavMenus())
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.classic.length).toBeGreaterThan(0)
    expect(result.current.modern.length).toBeGreaterThan(0)
  })

  it('filters out restricted admin menus for dev_preparer (no admin permissions)', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: [
        PERMISSIONS.Planning.Dashboard.ViewGlobal,
        PERMISSIONS.Planning.Lib.View,
        PERMISSIONS.Procurement.Ppmp.View,
      ],
      isSuperAdmin: false,
      status: 'success',
      isLoading: false,
      isLoaded: true,
      isError: false,
      hasPermission: (p: string) =>
        [
          PERMISSIONS.Planning.Dashboard.ViewGlobal,
          PERMISSIONS.Planning.Lib.View,
          PERMISSIONS.Procurement.Ppmp.View,
        ].includes(p),
      hasAnyPermission: (perms: readonly string[]) =>
        perms.some((p) =>
          [
            PERMISSIONS.Planning.Dashboard.ViewGlobal,
            PERMISSIONS.Planning.Lib.View,
            PERMISSIONS.Procurement.Ppmp.View,
          ].includes(p)
        ),
      hasAllPermissions: () => false,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => useFilteredNavMenus())
    expect(result.current.isLoaded).toBe(true)

    // Ensure System Administration parent menu does not appear for dev_preparer
    const classicTitles = result.current.classic.map((item) => item.title)
    expect(classicTitles).not.toContain('System Administration')

    const modernTitles = result.current.modern.map((item) => item.title)
    expect(modernTitles).not.toContain('System Administration')
  })

  it('filters navigation items for Supplier persona to only show Supplier Portal RFQ & Direct Contracting', () => {
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      permissions: [PERMISSIONS.Procurement.Supplier.View],
      isSuperAdmin: false,
      status: 'success',
      isLoading: false,
      isLoaded: true,
      isError: false,
      hasPermission: (p: string) => p === PERMISSIONS.Procurement.Supplier.View,
      hasAnyPermission: (perms: readonly string[]) =>
        perms.some((p) => p === PERMISSIONS.Procurement.Supplier.View),
      hasAllPermissions: () => false,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => useFilteredNavMenus())
    expect(result.current.isLoaded).toBe(true)

    // Classic Navigation
    const classicTitles = result.current.classic.map((item) => item.title)
    expect(classicTitles).not.toContain('Planning')
    expect(classicTitles).not.toContain('System Administration')

    // Modern Navigation
    const modernSupplierPortal = result.current.modern.find(
      (item) => item.title === 'Supplier Portal'
    )
    expect(modernSupplierPortal).toBeDefined()
    const modernSupplierChildTitles = modernSupplierPortal?.child?.map(
      (c) => c.title
    )
    expect(modernSupplierChildTitles).toContain('RFQ Item')
    expect(modernSupplierChildTitles).toContain('Direct Contracting Item')
    expect(modernSupplierChildTitles).not.toContain('Manage Supplier Portal')
  })
})
