import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Wallet, ShieldAlert, ShieldCheck } from "lucide-react";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { PaymentMethodCard } from "~/features/billing/components/PaymentMethodCard";
import { AddPaymentMethodModal } from "~/features/billing/components/AddPaymentMethodModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";

export default function BillingPaymentTab() {
  const {
    data,
    isLoading,
    error,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
  } = useBillingData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-lg" />
        <div className="h-40 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 text-sm">
        <p className="font-bold">Error loading payment methods</p>
        <p className="text-xs mt-1">{error?.message || "Please refresh and try again."}</p>
      </div>
    );
  }

  const { paymentMethods } = data;
  const isOnlyMethod = paymentMethods.length <= 1;

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      toast.success("Default payment method updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed updating default method");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    if (isOnlyMethod) {
      toast.error("Cannot remove your only payment method. Please add another method first.");
      setDeletingId(null);
      return;
    }

    try {
      const result = await deletePaymentMethod(deletingId);
      if (result.promotedDefaultId) {
        toast.info("Previous default removed. Another payment method has been promoted to default.");
      } else {
        toast.success("Payment method removed successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed removing payment method");
    } finally {
      setDeletingId(null);
    }
  };

  const methodToDelete = paymentMethods.find((pm) => pm.id === deletingId);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payment Methods</h2>
          <p className="text-xs text-muted-foreground">
            Manage your payment credentials for recurring subscriptions and automated invoicing
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Prominent Sandbox Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-950">Developer Sandbox / Test Billing Mode</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            This environment uses a simulated billing gateway for testing subscription and invoice workflows. Do not enter real credit or debit card credentials—use the test card presets provided in the Add Payment Method dialog.
          </p>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <PaymentMethodCard
              key={pm.id}
              method={pm}
              isOnlyMethod={isOnlyMethod}
              onSetDefault={handleSetDefault}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-base font-semibold text-slate-800">No Payment Methods Configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a credit or debit card to manage automated renewals
              </p>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Info Card */}
      <Card className="bg-slate-50/50 border-slate-200">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Automated Billing Protection</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Your default payment method will be used for automated subscription renewals on your scheduled billing date. You can update or switch payment methods at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        hasExistingMethods={paymentMethods.length > 0}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (input) => {
          await addPaymentMethod(input);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Remove Payment Method</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove the card ending in{" "}
              <span className="font-mono font-bold text-slate-800">{methodToDelete?.last4}</span>?
              {methodToDelete?.isDefault && (
                <span className="block mt-1 text-amber-600 font-medium">
                  Note: This is currently your default payment method. Another method will automatically be promoted to default.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Remove Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}