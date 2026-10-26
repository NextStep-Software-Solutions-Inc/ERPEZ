import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createMutationHookFromTemplate } from 'erpez-shared-lib';
import { deleteCustomRoleRequest } from '~/features/role/handlers/deleteCustomRoleRequest';
import type { RoleSummary } from '~/features/tenant-member/handlers/getAssignableRolesRequest';

const useDeleteRole = createMutationHookFromTemplate(deleteCustomRoleRequest);

interface DeleteCustomRoleModalProps {
  role: RoleSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tenantId?: string;
}

export function DeleteCustomRoleModal({
  role,
  open,
  onOpenChange,
  onSuccess,
  tenantId,
}: DeleteCustomRoleModalProps) {
  const deleteMutation = useDeleteRole();

  const handleDelete = async () => {
    if (!role) return;

    try {
      await deleteMutation.mutateAsync({
        pathParams: { id: role.id },
        payload: {
          tenantId: role.tenantId || tenantId,
        },
      });

      toast.success(`Role "${role.name}" deleted successfully.`);
      onOpenChange(false);
      onSuccess();
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-slate-900">
            Delete Custom Role
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500">
            Are you sure you want to delete the role <strong className="text-slate-800">{role?.name}</strong>?
            Members with this role will immediately lose associated permissions.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5"
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
