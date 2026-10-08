/**
 * Centralized role constants and identification utilities for ERPEZ frontend.
 * Eliminates duplicate string literals across switcher, guards, and tables.
 */
export const ROLES = {
  SYSTEM_ADMINISTRATOR: 'System Administrator',
  TENANT_ADMINISTRATOR: 'Tenant Administrator',
  PLATFORM_ADMINISTRATOR: 'Platform Administrator',
  EMPLOYEE_VIEWER: 'Employee / Viewer',

  // Operational Domain Roles
  PLANNING_OFFICER: 'Planning Officer',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  BUDGET_OFFICER: 'Budget Officer',
  BAC_MEMBER: 'BAC Member',
  EXECUTIVE_APPROVER: 'Executive Approver',
  LIB_APPROVER: 'LIB Approver',
  WFP_APPROVER: 'WFP Approver',
  OPCR_APPROVER: 'OPCR Approver',
  PPMP_APPROVER: 'PPMP Approver',
  SUPPLIER: 'Supplier',
  FINANCE_OFFICER: 'Finance Officer',
} as const;

export type AppRoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Checks if the given role name represents a workspace/system administrator.
 */
export function isWorkspaceAdminRole(roleName?: string | null): boolean {
  if (!roleName) return false;
  const lower = roleName.trim().toLowerCase();
  return (
    lower === 'system administrator' ||
    lower === 'dashboard system admin' ||
    lower === 'workspace admin' ||
    lower === 'workspace administrator'
  );
}

/**
 * Checks if the given role name represents a tenant governance administrator.
 */
export function isTenantAdminRole(roleName?: string | null): boolean {
  if (!roleName) return false;
  const lower = roleName.trim().toLowerCase();
  return (
    lower === 'tenant administrator' ||
    lower === 'tenantadmin' ||
    lower === 'admin' ||
    lower === 'org:admin'
  );
}

/**
 * Checks if the given role name represents a platform/super administrator.
 */
export function isPlatformAdminRole(roleName?: string | null): boolean {
  if (!roleName) return false;
  const lower = roleName.trim().toLowerCase();
  return (
    lower === 'platform administrator' ||
    lower === 'superadmin' ||
    lower === 'super-admin' ||
    lower === 'platform_administrator'
  );
}
