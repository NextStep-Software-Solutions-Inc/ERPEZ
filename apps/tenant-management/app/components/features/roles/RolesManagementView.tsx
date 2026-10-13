import React, { useState, useEffect } from 'react';
import {
  createQueryHookFromTemplate,
  type QueryBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';
import { type RoleSummary } from '~/features/tenant-member/handlers/getAssignableRolesRequest';
import { getTenantsRequest } from '~/features/tenant/handlers/getTenantsRequest';
import { api } from '~/services/api';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardDescription } from '~/components/ui/card';
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
} from 'lucide-react';
import { CreateCustomRoleModal } from './CreateCustomRoleModal';
import { EditCustomRoleModal } from './EditCustomRoleModal';
import { DeleteCustomRoleModal } from './DeleteCustomRoleModal';
import { usePermissions } from '~/hooks/usePermissions';

const assignableRolesEndpoint = '/tenant-members/assignable-roles';

type TenantRolesQueryParams = {
  tenantId?: string;
};

const getSuperAdminTenantRolesRequest: QueryBlueprintFromTemplate<
  typeof assignableRolesEndpoint,
  APIResponse<RoleSummary[]>,
  TenantRolesQueryParams
> = {
  endpoint: assignableRolesEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<APIResponse<RoleSummary[]>> => {
    const parsedUrl = new URL(finalUrl, 'http://localhost');
    const tenantId =
      parsedUrl.searchParams.get('tenantId') ||
      (typeof window !== 'undefined' ? localStorage.getItem('erpez_tenant_id') : null);

    if (!tenantId) {
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'No tenant context selected.',
        data: [],
      } as unknown as APIResponse<RoleSummary[]>;
    }

    const response = await api.get<APIResponse<RoleSummary[]>>(assignableRolesEndpoint, {
      signal,
      headers: {
        'X-Tenant-Id': tenantId,
      },
    });
    return response.data;
  },
};

const useAssignableRoles = createQueryHookFromTemplate(getSuperAdminTenantRolesRequest);
const useGetTenants = createQueryHookFromTemplate(getTenantsRequest);

const PLATFORM_SYSTEM_ROLES: RoleSummary[] = [
  {
    id: 'system-platform-administrator',
    name: 'Platform Administrator',
    description:
      'Full administrative authority over platform tenants, subscriptions, silos, and global settings.',
    isSystemRole: true,
    isAssignableToTenant: false,
    permissionKeys: [
      'platform.tenants.view',
      'platform.tenants.manage',
      'platform.users.view',
      'platform.users.manage',
      'platform.settings.view',
      'platform.settings.manage',
      'platform.subscriptions.manage',
      'platform.licenses.manage',
      'platform.audit_logs.view',
      'platform.inquiries.view',
      'platform.inquiries.manage',
      'admin.tenants.manage',
      'admin.system.admin.manage',
      'admin.system.admin.view',
    ],
  },
  {
    id: 'system-platform-auditor',
    name: 'Platform Auditor',
    description:
      'Read-only auditor for cross-tenant fleet health, compliance metrics, and platform audit logs.',
    isSystemRole: true,
    isAssignableToTenant: false,
    permissionKeys: [
      'platform.tenants.view',
      'platform.users.view',
      'platform.settings.view',
      'platform.audit_logs.view',
    ],
  },
  {
    id: 'system-platform-support',
    name: 'Platform Support',
    description:
      'Platform technical support personnel managing tenant licenses and health diagnostics.',
    isSystemRole: true,
    isAssignableToTenant: false,
    permissionKeys: [
      'platform.tenants.view',
      'platform.users.view',
      'platform.settings.view',
      'platform.licenses.manage',
    ],
  },
];

const FALLBACK_TENANT_SYSTEM_ROLES: RoleSummary[] = [
  {
    id: 'system-tenant-administrator',
    name: 'Tenant Administrator',
    description:
      'Tenant-level administrator managing workspace settings, member invitations, billing, and licenses.',
    isSystemRole: true,
    isAssignableToTenant: true,
    permissionKeys: [
      'tenant.workspace.view',
      'tenant.workspace.manage',
      'tenant.members.view',
      'tenant.members.manage',
      'tenant.roles.view',
      'tenant.roles.manage',
      'tenant.billing.view',
      'tenant.billing.manage',
      'tenant.invoices.view',
      'tenant.subscriptions.view',
      'tenant.subscriptions.manage',
      'tenant.licenses.view',
      'tenant.licenses.manage',
      'tenant.modules.view',
      'tenant.modules.manage',
      'admin.roles.manage',
      'admin.members.manage',
      'admin.tenants.manage',
      'admin.users.manage',
      'admin.org_structure.view',
      'admin.org_structure.manage',
      'admin.system.admin.view',
      'admin.system.admin.manage',
      'admin.operational_roles.view',
      'admin.operational_roles.manage',
    ],
  },
  {
    id: 'system-billing-administrator',
    name: 'Billing Administrator',
    description:
      'Manages organization subscription tier, invoices, receipts, and payment methods.',
    isSystemRole: true,
    isAssignableToTenant: true,
    permissionKeys: [
      'tenant.workspace.view',
      'tenant.billing.view',
      'tenant.billing.manage',
      'tenant.invoices.view',
      'tenant.subscriptions.view',
      'tenant.subscriptions.manage',
    ],
  },
  {
    id: 'system-tenant-auditor',
    name: 'Tenant Auditor',
    description:
      'Read-only auditor for tenant workspace configuration, audit logs, and compliance records.',
    isSystemRole: true,
    isAssignableToTenant: true,
    permissionKeys: [
      'tenant.workspace.view',
      'tenant.members.view',
      'tenant.billing.view',
      'tenant.invoices.view',
      'tenant.licenses.view',
      'tenant.modules.view',
    ],
  },
  {
    id: 'system-tenant-member',
    name: 'Tenant Member',
    description: 'Base account membership within the tenant workspace.',
    isSystemRole: true,
    isAssignableToTenant: true,
    permissionKeys: ['tenant.workspace.view'],
  },
];

export function RolesManagementView() {
  const { hasPermission, isPlatformAdmin } = usePermissions();
  const canManageRoles =
    isPlatformAdmin ||
    hasPermission('tenant.roles.manage') ||
    hasPermission('platform.settings.manage');

  const { data: tenantsResponse, isLoading: isLoadingTenants } = useGetTenants({
    pathParams: {},
    queryParams: { pageSize: 100, pageNumber: 1 },
  });
  const tenants = tenantsResponse?.data || [];

  const [selectedTenantId, setSelectedTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('erpez_tenant_id') || '';
    }
    return '';
  });

  useEffect(() => {
    if (!selectedTenantId && tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    } else if (
      selectedTenantId &&
      tenants.length > 0 &&
      !tenants.some((t) => t.id === selectedTenantId)
    ) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const { data: rolesResponse, isLoading, refetch } = useAssignableRoles({
    pathParams: {},
    queryParams: { tenantId: selectedTenantId || undefined },
  });

  const fetchedTenantRoles: RoleSummary[] = rolesResponse?.data || [];
  const tenantRoles: RoleSummary[] =
    fetchedTenantRoles.length > 0 ? fetchedTenantRoles : FALLBACK_TENANT_SYSTEM_ROLES;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleSummary | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  const toggleExpand = (roleId: string) => {
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const renderRoleCard = (role: RoleSummary, scopeLabel: 'Platform' | 'Tenant') => {
    const isSystem = role.isSystemRole;
    const isExpanded = expandedRoleId === role.id;
    const perms = role.permissionKeys || [];

    return (
      <Card
        key={role.id}
        className={`border transition-shadow hover:shadow-sm ${
          scopeLabel === 'Platform'
            ? 'bg-purple-50/20 border-purple-200/80'
            : isSystem
              ? 'bg-slate-50/40 border-slate-200'
              : 'bg-white border-blue-100 shadow-xs'
        }`}
      >
        <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{role.name}</span>
              <Badge
                variant="outline"
                className={
                  scopeLabel === 'Platform'
                    ? 'border-purple-200 bg-purple-50 text-purple-700 text-[10px] font-semibold py-0'
                    : 'border-slate-200 bg-white text-slate-600 text-[10px] font-semibold py-0'
                }
              >
                {scopeLabel} Scope
              </Badge>
              {isSystem ? (
                <Badge
                  variant="secondary"
                  className="bg-slate-200/70 text-slate-700 text-[10px] font-semibold gap-1 py-0"
                >
                  <Lock className="w-2.5 h-2.5" />
                  System
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] font-semibold py-0">
                  Custom Role
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500 line-clamp-2">
              {role.description ||
                (isSystem ? 'Standardized system governance role.' : 'Custom tenant role.')}
            </CardDescription>
          </div>

          {!isSystem && canManageRoles && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-blue-600"
                onClick={() => setEditingRole(role)}
                title="Edit Role"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-600"
                onClick={() => setDeletingRole(role)}
                title="Delete Role"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span className="font-medium">
              {perms.length} permission{perms.length === 1 ? '' : 's'} assigned
            </span>
            <button
              type="button"
              onClick={() => toggleExpand(role.id)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-[11px]"
            >
              {isExpanded ? (
                <>
                  Hide Details <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  View Permissions <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-700">
                Assigned Permission Keys:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-200/60">
                {perms.length > 0 ? (
                  perms.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No permissions mapped.</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Platform Governance Roles */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Platform Governance Roles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Internal Super Admin and platform-wide administrative roles governed by the platform permission registry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLATFORM_SYSTEM_ROLES.map((role) => renderRoleCard(role, 'Platform'))}
        </div>
      </div>

      {/* Section 2: Tenant Workspace System & Custom Roles */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Configured Tenant System & Custom Roles
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Baseline tenant roles and workspace-specific custom roles available for assignment across customer workspaces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {tenants.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
                <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                  Workspace:
                </span>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="text-xs font-medium text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1"
                  aria-label="Select tenant workspace"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canManageRoles && (
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                disabled={!selectedTenantId}
                title={
                  !selectedTenantId
                    ? 'A registered tenant workspace is required to create custom tenant roles'
                    : 'Create a custom role for the selected workspace'
                }
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs shrink-0"
              >
                <Plus className="h-4 w-4" />
                Create Custom Role
              </Button>
            )}
          </div>
        </div>

        {isLoading || isLoadingTenants ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            Loading workspace roles...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantRoles.map((role) => renderRoleCard(role, 'Tenant'))}
          </div>
        )}
      </div>

      <CreateCustomRoleModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
        tenantId={selectedTenantId || undefined}
        tenantName={selectedTenant?.name}
      />

      <EditCustomRoleModal
        role={editingRole}
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
        onSuccess={() => {
          setEditingRole(null);
          refetch();
        }}
        tenantId={selectedTenantId || undefined}
      />

      <DeleteCustomRoleModal
        role={deletingRole}
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        onSuccess={() => {
          setDeletingRole(null);
          refetch();
        }}
        tenantId={selectedTenantId || undefined}
      />
    </div>
  );
}
