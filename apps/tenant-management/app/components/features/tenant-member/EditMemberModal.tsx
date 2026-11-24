import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Shield, Loader2, User } from "lucide-react";
import { type TenantMember } from "./table/types";
import { toast } from "sonner";

interface AssignableRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole?: boolean;
}

interface EditMemberModalProps {
  isOpen: boolean;
  member: TenantMember | null;
  assignableRoles: AssignableRole[];
  onClose: () => void;
  onSave: (
    memberId: string,
    payload: {
      firstName?: string;
      lastName?: string;
      roleIds: string[];
      concurrencyStamp: string;
    }
  ) => Promise<void>;
  isSaving: boolean;
}

export function EditMemberModal({
  isOpen,
  member,
  assignableRoles,
  onClose,
  onSave,
  isSaving,
}: EditMemberModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  useEffect(() => {
    if (member) {
      const nameParts = (member.name || "").trim().split(" ");
      const initialFirst = member.firstName || nameParts[0] || "";
      const initialLast = member.lastName || nameParts.slice(1).join(" ") || "";
      setFirstName(initialFirst);
      setLastName(initialLast);
      setSelectedRoleId(member.roleIds?.[0] || "");
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error("A role must be assigned to the member.");
      return;
    }

    try {
      await onSave(member.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleIds: [selectedRoleId],
        concurrencyStamp: member.concurrencyStamp,
      });
      onClose();
    } catch {
      // Handled by parent
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <User className="h-5 w-5 text-blue-600" />
              Edit Member Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Update personal profile and role assignments for <strong>{member.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Email Address</Label>
              <Input
                readOnly
                value={member.email || ""}
                className="bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs text-slate-700">
                  First Name
                </Label>
                <Input
                  id="edit-firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName" className="text-xs text-slate-700">
                  Last Name
                </Label>
                <Input
                  id="edit-lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Assigned Role */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Role Assignment *</Label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                {assignableRoles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <label
                      key={role.id}
                      className={`flex items-center p-2 rounded-md transition cursor-pointer text-xs ${
                        isSelected
                          ? "bg-blue-50/80 border border-blue-200 font-medium text-blue-900"
                          : "hover:bg-white hover:border-slate-200 border border-transparent text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setSelectedRoleId(checked ? role.id : "");
                          }}
                        />
                        <span>{role.name}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
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
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
