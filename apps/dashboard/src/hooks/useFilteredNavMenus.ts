import { useMemo } from 'react'
import { usePermissions } from './usePermissions'
import { menusConfig, type MenuItemProps } from '@/config/menus'

function filterNavMenuItems(
  items: MenuItemProps[],
  hasPermission: (p: string) => boolean,
  hasAnyPermission: (p: readonly string[]) => boolean,
  isSuperAdmin: boolean,
  isLoaded: boolean
): MenuItemProps[] {
  // SuperAdmin sees everything
  if (isSuperAdmin) return items
  // Fail closed until permissions are loaded
  if (!isLoaded) return []

  function isItemPermitted(item: MenuItemProps): boolean {
    const perm = item.permission
    const perms = item.permissions

    if (!perm && !perms) {
      // Propagate to children
      if (item.child && item.child.length > 0) return item.child.some(isItemPermitted)
      if (item.megaMenu && item.megaMenu.length > 0) return item.megaMenu.some(isItemPermitted)
      if (item.multi_menu && item.multi_menu.length > 0) return item.multi_menu.some(isItemPermitted)
      if (item.nested && item.nested.length > 0) return item.nested.some(isItemPermitted)
      return true
    }

    if (perm) {
      if (Array.isArray(perm)) {
        if (!hasAnyPermission(perm as readonly string[])) return false
      } else {
        if (!hasPermission(perm as string)) return false
      }
    }

    if (perms && perms.length > 0) {
      if (!hasAnyPermission(perms)) return false
    }

    return true
  }

  function filterItem(item: MenuItemProps): MenuItemProps | null {
    if (item.isHeader) return item

    if (!isItemPermitted(item)) return null

    const newItem = { ...item }

    if (item.child) {
      const filtered = item.child.map(filterItem).filter((c): c is MenuItemProps => c !== null)
      if (filtered.length === 0 && !item.href) return null
      newItem.child = filtered
    }

    if (item.multi_menu) {
      const filtered = item.multi_menu.map(filterItem).filter((c): c is MenuItemProps => c !== null)
      if (filtered.length === 0 && !item.href) return null
      newItem.multi_menu = filtered
    }

    if (item.nested) {
      const filtered = item.nested.map(filterItem).filter((c): c is MenuItemProps => c !== null)
      if (filtered.length === 0 && !item.href) return null
      newItem.nested = filtered
    }

    return newItem
  }

  const filtered = items.map(filterItem).filter((item): item is MenuItemProps => item !== null)

  // Remove orphan section headers
  const result: MenuItemProps[] = []
  for (let i = 0; i < filtered.length; i++) {
    const curr = filtered[i]
    if (curr.isHeader) {
      let hasContent = false
      for (let j = i + 1; j < filtered.length; j++) {
        if (filtered[j].isHeader) break
        hasContent = true
        break
      }
      if (hasContent) result.push(curr)
    } else {
      result.push(curr)
    }
  }

  return result
}

export function useFilteredNavMenus() {
  const { hasPermission, hasAnyPermission, isSuperAdmin, isLoaded } = usePermissions()

  const classic = useMemo(
    () =>
      filterNavMenuItems(
        (menusConfig?.sidebarNav?.classic || []) as MenuItemProps[],
        hasPermission,
        hasAnyPermission,
        isSuperAdmin ?? false,
        isLoaded
      ),
    [hasPermission, hasAnyPermission, isSuperAdmin, isLoaded]
  )

  const modern = useMemo(
    () =>
      filterNavMenuItems(
        (menusConfig?.sidebarNav?.modern || []) as MenuItemProps[],
        hasPermission,
        hasAnyPermission,
        isSuperAdmin ?? false,
        isLoaded
      ),
    [hasPermission, hasAnyPermission, isSuperAdmin, isLoaded]
  )

  const mainNav = useMemo(
    () =>
      filterNavMenuItems(
        (menusConfig?.mainNav || []) as MenuItemProps[],
        hasPermission,
        hasAnyPermission,
        isSuperAdmin ?? false,
        isLoaded
      ),
    [hasPermission, hasAnyPermission, isSuperAdmin, isLoaded]
  )

  return { classic, modern, mainNav, isLoaded }
}
