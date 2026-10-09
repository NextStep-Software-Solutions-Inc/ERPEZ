import React, { useState } from 'react';
import { createQueryHookFromTemplate } from 'erpez-shared-lib';
import { getAssignableRolesRequest, type RoleSummary } from '~/features/tenant-member/handlers/getAssignableRolesRequest';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
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
  Users,
} from 'lucide-react';
import { CreateCustomRoleModal } from './CreateCustomRoleModal';
import { EditCustomRoleModal } from './EditCustomRoleModal';
import { DeleteCustomRoleModal } from './DeleteCustomRoleModal';
import { usePermissions } from '~/hooks/usePermissions';

const useAssignableRoles = createQueryHookFromTemplate(getAssignableRolesRequest);

export function RolesManagementView() {
  const { hasPermission, isPlatformAdmin } = usePermissions();
  const canManageRoles = isPlatformAdmin || hasPermission('tenant.roles.manage') || hasPermission('platform.settings.manage');

  const { data: rolesResponse, isLoading, refetch } = useAssignableRoles({});
  const roles: RoleSummary[] = rolesResponse?.data || [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleSummary | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  const toggleExpand = (roleId: string) => {
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Configured System & Custom Roles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System and custom roles available for assignment across workspaces.
          </p>
        </div>

        {canManageRoles && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Custom Role
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Loading workspace roles...
        </div>
      ) : roles.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 text-center text-slate-500 text-sm">
            No roles available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const isSystem = role.isSystemRole;
            const isExpanded = expandedRoleId === role.id;
            const perms = role.permissionKeys || [];

            return (
              <Card
                key={role.id}
                className={`border transition-shadow hover:shadow-sm ${
                  isSystem ? 'bg-slate-50/40 border-slate-200' : 'bg-white border-blue-100 shadow-xs'
                }`}
              >
                <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{role.name}</span>
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
                      {role.description || (isSystem ? 'Standardized system governance role.' : 'Custom tenant role.')}
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
                      <div className="text-[11px] font-semibold text-slate-700">Assigned Permission Keys:</div>
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
          })}
        </div>
      )}

      <CreateCustomRoleModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
      />

      <EditCustomRoleModal
        role={editingRole}
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
        onSuccess={() => {
          setEditingRole(null);
          refetch();
        }}
      />

      <DeleteCustomRoleModal
        role={deletingRole}
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        onSuccess={() => {
          setDeletingRole(null);
          refetch();
        }}
      />
    </div>
  );
}
