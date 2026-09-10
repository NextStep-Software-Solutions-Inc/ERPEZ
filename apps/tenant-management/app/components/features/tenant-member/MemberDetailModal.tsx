import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit2,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { type TenantMember } from "./table/types";
import { toast } from "sonner";

interface MemberDetailModalProps {
  isOpen: boolean;
  member: TenantMember | null;
  onClose: () => void;
  onEdit?: (member: TenantMember) => void;
  onToggleStatus?: (member: TenantMember) => void;
  onDelete?: (member: TenantMember) => void;
  isSelf?: boolean;
}

export function MemberDetailModal({
  isOpen,
  member,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  isSelf = false,
}: MemberDetailModalProps) {
  const [hasCopiedId, setHasCopiedId] = useState(false);

  if (!member) return null;

  const initials = member.name
    ? member.name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const isPending = member.status === "Pending";
  const isActive = member.status === "Active";

  const copyId = () => {
    if (!member.id) return;
    navigator.clipboard.writeText(member.id);
    setHasCopiedId(true);
    toast.success("Member ID copied to clipboard");
    setTimeout(() => setHasCopiedId(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {member.name}
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200">
                    You
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status & ID Summary */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block mb-1">Account Status</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {isActive && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Active Member
                  </Badge>
                )}
                {isPending && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Invitation Pending
                  </Badge>
                )}
                {member.status === "Disabled" && (
                  <Badge className="bg-rose-100 text-rose-800 border-rose-200 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-rose-600" />
                    Disabled Access
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Member ID</span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-800">
                <span className="truncate">{member.id}</span>
                <button
                  onClick={copyId}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title="Copy ID"
                >
                  {hasCopiedId ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Assigned RBAC Roles */}
          <div className="space-y-1.5">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-slate-700" />
              Assigned Roles
            </span>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-200 bg-white">
              {member.roles && member.roles.length > 0 ? (
                member.roles.map((r, idx) => (
                  <Badge
                    key={idx}
                    variant={r === "Tenant Administrator" ? "default" : "secondary"}
                    className="text-xs py-0.5 px-2 font-medium"
                  >
                    {r}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-400 text-xs italic">No roles assigned</span>
              )}
            </div>
          </div>

          {/* Identity & Technical Metadata */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-slate-400">User Identity (sub):</span>
              <span className="font-mono text-[11px] text-slate-800">
                {member.externalIdentityId || member.userId || "Pending activation"}
              </span>
            </div>
            {isPending && member.invitationExpiresAtUtc && (
              <div className="flex justify-between items-center text-slate-600 border-t pt-2">
                <span className="text-slate-400">Invitation Expires:</span>
                <span className="text-amber-700 font-medium">
                  {new Date(member.invitationExpiresAtUtc).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2 flex-col sm:flex-row">
          <div className="flex items-center gap-2 mr-auto">
            {onDelete && !isSelf && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onDelete(member);
                }}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            )}
            {onToggleStatus && !isSelf && !isPending && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onToggleStatus(member);
                }}
                className="text-xs h-8"
              >
                {isActive ? (
                  <>
                    <UserX className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Activate
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
              Close
            </Button>
            {onEdit && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 flex items-center gap-1"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Member
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
