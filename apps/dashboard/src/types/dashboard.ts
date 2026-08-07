/**
 * Shared Dashboard Types
 *
 * Cross-feature type definitions shared between Planning, Procurement,
 * and any future dashboard modules.
 *
 * @module types/dashboard
 */

// ============================================================================
// Role Types
// ============================================================================

/**
 * Simplified dashboard user role for RBAC filtering.
 * Mapped from Keycloak/application roles by useDashboardRole hook.
 *
 * - PLANNING_USER: Planning office staff — full global data access
 * - OFFICE_USER:   Delivery unit / department staff — scoped to own department
 */
export type UserRole = 'PLANNING_USER' | 'OFFICE_USER'
