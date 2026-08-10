/**
 * useCatalogPermissions
 * Returns per-action capability flags derived from the current user's role.
 *
 * Role tiers:
 *  - admin              → full access
 *  - procurement_officer → create / edit / bulk-adjust; delete only unlocked items
 *  - user               → read-only
 */

import { useKeycloak } from '@/providers/KeycloakProvider'

export type CatalogRole = 'admin' | 'procurement_officer' | 'user'

export interface CatalogPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canBulkAdjust: boolean
  canToggleStatus: boolean
  canDuplicate: boolean
  userRole: CatalogRole
}

const WRITE_ROLES: CatalogRole[] = ['admin', 'procurement_officer']

export function useCatalogPermissions(): CatalogPermissions {
  // Keycloak is bypassed in dev — role defaults to 'admin' for local work.
  // In production keycloak.tokenParsed?.realm_access.roles would be used.
  const { isInitialized } = useKeycloak()

  // TODO: replace with real role extraction from keycloak token when auth is wired
  const userRole: CatalogRole = isInitialized ? 'admin' : 'user'

  const isWrite = WRITE_ROLES.includes(userRole)

  return {
    canCreate: isWrite,
    canEdit: isWrite,
    canDelete: isWrite,
    canBulkAdjust: isWrite,
    canToggleStatus: isWrite,
    canDuplicate: isWrite,
    userRole,
  }
}
