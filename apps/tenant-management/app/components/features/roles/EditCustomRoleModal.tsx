import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Shield, Loader2, CheckSquare, Square, Info } from 'lucide-react';
import { toast } from 'sonner';
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from 'erpez-shared-lib';
import { updateCustomRoleRequest } from '~/features/role/handlers/updateCustomRoleRequest';
import { getRolePermissionsRequest, type PermissionCategory } from '~/features/role/handlers/getRolePermissionsRequest';
import type { RoleSummary } from '~/features/tenant-member/handlers/getAssignableRolesRequest';

const useUpdateRole = createMutationHookFromTemplate(updateCustomRoleRequest);
const useRolePermissions = createQueryHookFromTemplate(getRolePermissionsRequest);

interface EditCustomRoleModalProps {
  role: RoleSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCustomRoleModal({
  role,
  open,
  onOpenChange,
  onSuccess,
}: EditCustomRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useRolePermissions({});
  const categories: PermissionCategory[] = permissionsResponse?.data || [];

  const updateRoleMutation = useUpdateRole();

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      setSelectedKeys(new Set(role.permissionKeys || []));
    }
  }, [role, open]);

  const handleTogglePermission = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const allKeys = category.permissions.map((p) => p.key);
    const hasAll = allKeys.every((k) => selectedKeys.has(k));

    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (hasAll) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (!name.trim()) {
      toast.error('Role name is required.');
      return;
    }

    if (selectedKeys.size === 0) {
      toast.error('Please select at least one permission.');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        pathParams: { id: role.id },
        payload: {
          name: name.trim(),
          description: description.trim() || undefined,
          permissionKeys: Array.from(selectedKeys),
        },
      });

      toast.success(`Custom role "${name.trim()}" updated successfully.`);
      onOpenChange(false);
      onSuccess();
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Edit Custom Role
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Update role permissions and configuration.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name" className="text-xs font-semibold text-slate-700">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role-desc" className="text-xs font-semibold text-slate-700">
                  Description
                </Label>
                <Input
                  id="edit-role-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Permissions Selection
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedKeys.size} permission{selectedKeys.size === 1 ? '' : 's'} assigned
                  </p>
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="py-12 flex justify-center items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Loading available permissions...
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const allCatKeys = category.permissions.map((p) => p.key);
                    const selectedCatCount = allCatKeys.filter((k) => selectedKeys.has(k)).length;
                    const isAllSelected = allCatKeys.length > 0 && selectedCatCount === allCatKeys.length;

                    return (
                      <div
                        key={category.category}
                        className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs"
                      >
                        <div className="bg-slate-50 px-3.5 py-2 flex items-center justify-between border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(category)}
                              className="text-slate-500 hover:text-slate-900"
                            >
                              {isAllSelected ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400" />
                              )}
                            </button>
                            <span className="text-xs font-bold text-slate-800">
                              {category.category}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {selectedCatCount} / {allCatKeys.length}
                          </span>
                        </div>

                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {category.permissions.map((perm) => {
                            const isChecked = selectedKeys.has(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5"
                                />
                                <div className="space-y-0.5 leading-snug">
                                  <div className="font-semibold">{perm.displayName}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {perm.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex sm:justify-between items-center">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              Changes will apply to members with this role on their next request.
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateRoleMutation.isPending || !name.trim() || selectedKeys.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                {updateRoleMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
