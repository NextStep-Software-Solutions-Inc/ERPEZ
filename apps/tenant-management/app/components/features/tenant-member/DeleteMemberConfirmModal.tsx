import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { type TenantMember } from "./table/types";

interface DeleteMemberConfirmModalProps {
  isOpen: boolean;
  member: TenantMember | null;
  onClose: () => void;
  onConfirm: (memberId: string) => Promise<void>;
  isDeleting: boolean;
  isSelf?: boolean;
}

export function DeleteMemberConfirmModal({
  isOpen,
  member,
  onClose,
  onConfirm,
  isDeleting,
  isSelf = false,
}: DeleteMemberConfirmModalProps) {
  if (!member) return null;

  const handleConfirm = async () => {
    if (isSelf) return;
    await onConfirm(member.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Remove Tenant Member
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                This will immediately revoke their access to this tenant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <p className="font-semibold text-slate-900">{member.name}</p>
            <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{member.email}</p>
          </div>

          {isSelf ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              <strong>Self-removal blocked:</strong> You cannot delete your own tenant membership while logged in.
            </div>
          ) : (
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Are you sure you want to proceed? Any assigned roles will be unassigned and the user will lose access to all modules and tenant resources immediately.
            </p>
          )}
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          {!isSelf && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 flex items-center gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Remove Member
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
