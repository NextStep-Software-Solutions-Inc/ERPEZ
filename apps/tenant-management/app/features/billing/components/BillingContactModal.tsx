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
import { Building2 } from "lucide-react";
import type { BillingContact } from "../types";
import { toast } from "sonner";

interface BillingContactModalProps {
  isOpen: boolean;
  contact: BillingContact;
  onClose: () => void;
  onSave: (contact: BillingContact) => Promise<void>;
}

export const BillingContactModal: React.FC<BillingContactModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<BillingContact>(contact);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(contact);
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!formData.billingEmail.trim()) {
      toast.error("Billing email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success("Billing contact details updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed updating contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-blue-600" />
            Edit Billing Information
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            This information will appear on your generated invoices and receipts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-xs font-semibold">
              Company / Legal Entity Name
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="billingEmail" className="text-xs font-semibold">
              Billing Email Address
            </Label>
            <Input
              id="billingEmail"
              type="email"
              value={formData.billingEmail}
              onChange={(e) =>
                setFormData({ ...formData, billingEmail: e.target.value })
              }
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs font-semibold">
              Billing Street Address
            </Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="e.g. 100 Enterprise Way, Suite 400"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="city" className="text-xs font-semibold">
                City
              </Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="postalCode" className="text-xs font-semibold">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="country" className="text-xs font-semibold">
                Country
              </Label>
              <Input
                id="country"
                value={formData.country || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taxId" className="text-xs font-semibold">
                Tax ID / TIN / VAT
              </Label>
              <Input
                id="taxId"
                value={formData.taxId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
                placeholder="e.g. TIN-00123"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
