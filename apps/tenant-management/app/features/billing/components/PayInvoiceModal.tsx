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
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { CreditCard, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import type { Invoice, PaymentMethod } from "../types";
import { formatMoney } from "../utils/money";
import { toast } from "sonner";

interface PayInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onPay: (invoiceId: string, paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  onOpenAddMethod: () => void;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  isOpen,
  invoice,
  paymentMethods,
  onClose,
  onPay,
  onOpenAddMethod,
}) => {
  if (!invoice) return null;

  const defaultMethod = paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0];
  const [selectedMethodId, setSelectedMethodId] = useState<string>(defaultMethod?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPay = async () => {
    if (!selectedMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await onPay(invoice.id, selectedMethodId);
      if (result.success) {
        toast.success(
          `Payment of ${formatMoney(invoice.totalCents, invoice.currency)} successfully completed for ${invoice.invoiceNumber}!`
        );
        onClose();
      } else {
        toast.error(result.error || "Payment simulation failed. Invoice remains pending.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasMethods = paymentMethods.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Settle Invoice Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Confirm payment details to settle this outstanding invoice via simulated payment gateway.
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 mt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Invoice:</span>
            <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Plan / Item:</span>
            <span className="text-slate-800 truncate max-w-[200px]">{invoice.planName}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2 font-semibold">
            <span className="text-slate-900">Total Amount Due:</span>
            <span className="text-lg text-blue-600 font-bold">
              {formatMoney(invoice.totalCents, invoice.currency)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3 mt-3">
          <Label className="text-xs font-semibold text-slate-700">
            Select Payment Method
          </Label>

          {hasMethods ? (
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm cursor-pointer transition ${
                    selectedMethodId === pm.id
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={pm.id}
                      checked={selectedMethodId === pm.id}
                      onChange={() => setSelectedMethodId(pm.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 uppercase">
                        {pm.brand || "Card"} •••• {pm.last4}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Exp {String(pm.expiryMonth).padStart(2, "0")}/{pm.expiryYear} &bull; {pm.cardholderName}
                      </p>
                    </div>
                  </div>
                  {pm.isDefault && (
                    <Badge className="text-[10px] bg-blue-100 text-blue-800 border-none">
                      Default
                    </Badge>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-amber-300 bg-amber-50 rounded-lg text-center space-y-2">
              <AlertCircle className="h-6 w-6 text-amber-600 mx-auto" />
              <p className="text-xs text-amber-800 font-medium">
                No payment methods on file for this tenant.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenAddMethod();
                }}
                className="text-xs bg-white text-blue-600 border-blue-200"
              >
                + Add Payment Method
              </Button>
            </div>
          )}
        </div>

        {/* Security / Simulation Assurance */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md mt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Sandbox environment: settles this invoice using your selected test payment method.</span>
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!hasMethods || isProcessing}
            onClick={handleConfirmPay}
            className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ${formatMoney(invoice.totalCents, invoice.currency)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
