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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { AlertCircle, CreditCard, ShieldAlert } from "lucide-react";
import type { CreatePaymentMethodInput } from "../types";
import {
  detectCardBrand,
  formatCardNumberInput,
} from "../utils/money";
import { toast } from "sonner";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  hasExistingMethods: boolean;
  onClose: () => void;
  onAdd: (input: CreatePaymentMethodInput) => Promise<void>;
  isTrial?: boolean;
  planName?: string;
  planRateText?: string;
  trialEndDate?: string;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  hasExistingMethods,
  onClose,
  onAdd,
  isTrial = false,
  planName = "Starter",
  planRateText,
  trialEndDate,
}) => {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(!hasExistingMethods);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detectedBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumberInput(e.target.value));
  };

  const fillTestCard = (type: "visa" | "mastercard" | "amex") => {
    if (type === "visa") {
      setCardNumber("4242 4242 4242 4242");
      setCardholderName("Sandbox Test User");
      setExpiryMonth("12");
      setExpiryYear("2028");
      setCvc("123");
    } else if (type === "mastercard") {
      setCardNumber("5555 5555 5555 4444");
      setCardholderName("Finance Operations");
      setExpiryMonth("10");
      setExpiryYear("2029");
      setCvc("888");
    } else {
      setCardNumber("3782 8224 6310 005");
      setCardholderName("Enterprise Admin");
      setExpiryMonth("06");
      setExpiryYear("2027");
      setCvc("1234");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardholderName.trim()) {
      toast.error("Cardholder name is required");
      return;
    }

    const cleanCard = cardNumber.replace(/\D/g, "");
    if (cleanCard.length < 15) {
      toast.error("Please enter a valid 15 or 16-digit card number");
      return;
    }

    const monthNum = parseInt(expiryMonth, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      toast.error("Please enter a valid expiry month (01-12)");
      return;
    }

    const currentYear = new Date().getFullYear();
    let yearNum = parseInt(expiryYear, 10);
    if (isNaN(yearNum)) {
      toast.error("Please enter a valid expiry year");
      return;
    }
    if (yearNum < 100) {
      yearNum += 2000;
    }
    if (yearNum < currentYear) {
      toast.error("Card expiration year cannot be in the past");
      return;
    }

    if (cleanCard.length === 0 || cvc.trim().length < 3) {
      toast.error("Please enter a valid CVC security code");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        type: "credit_card",
        cardNumber: cleanCard,
        cardholderName: cardholderName.trim(),
        expiryMonth: monthNum,
        expiryYear: yearNum,
        cvc: cvc.trim(),
        setAsDefault: !hasExistingMethods || setAsDefault,
      });
      if (isTrial) {
        toast.success(
          `Payment method added successfully. Your ${planName} trial remains free${trialEndDate ? ` until ${trialEndDate}` : ""}.`
        );
      } else {
        toast.success("Payment method added successfully");
      }
      onClose();
      // Reset form
      setCardholderName("");
      setCardNumber("");
      setExpiryMonth("");
      setExpiryYear("");
      setCvc("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isTrial
          ? "We couldn't add your payment method. Please try again. No charge was made."
          : "Failed adding payment method"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {isTrial ? "Add a payment method" : "Add Payment Method"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isTrial
              ? `Add a payment method to continue with ${planName} after your free trial ends.`
              : "Add a credit or debit card for subscription billing and one-click invoice settlements."}
          </DialogDescription>
        </DialogHeader>

        {/* Trial Reassurance Banner */}
        {isTrial ? (
          <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1 my-2">
            <p className="font-semibold text-blue-950">Your trial remains free</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              You won't be charged during your free trial. Your payment method will be securely saved on file.
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">No charge is made today.</p>
          </div>
        ) : (
          /* Prominent Sandbox / Simulated Gateway Warning */
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5 my-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Developer Sandbox / Simulated Mode</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                In a production deployment, card entry is tokenized directly via a PCI-DSS certified gateway (e.g. Stripe, Adyen). Do not enter real sensitive payment credentials here. Use the test presets below.
              </p>
            </div>
          </div>
        )}

        {/* Quick Test Card Presets */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Test Card Presets</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillTestCard("visa")}
              className="text-xs h-7 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              Test Visa (4242)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillTestCard("mastercard")}
              className="text-xs h-7 px-2.5 text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              Test MC (5555)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillTestCard("amex")}
              className="text-xs h-7 px-2.5 text-sky-700 border-sky-200 hover:bg-sky-50"
            >
              Test Amex (3782)
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div className="space-y-1.5">
            <Label htmlFor="cardholderName" className="text-xs font-semibold">
              Cardholder Name
            </Label>
            <Input
              id="cardholderName"
              placeholder="e.g. Juan dela Cruz / Acme Corp"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="text-sm h-9"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="cardNumber" className="text-xs font-semibold">
                Card Number
              </Label>
              {detectedBrand !== "other" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {detectedBrand}
                </span>
              )}
            </div>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="text-sm font-mono h-9"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="expiryMonth" className="text-xs font-semibold">
                Month (MM)
              </Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value.slice(0, 2))}
                maxLength={2}
                className="text-sm font-mono h-9 text-center"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiryYear" className="text-xs font-semibold">
                Year (YY / YYYY)
              </Label>
              <Input
                id="expiryYear"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value.slice(0, 4))}
                maxLength={4}
                className="text-sm font-mono h-9 text-center"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cvc" className="text-xs font-semibold">
                CVC / CVV
              </Label>
              <Input
                id="cvc"
                type="password"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                maxLength={4}
                className="text-sm font-mono h-9 text-center"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="defaultCheck"
              checked={!hasExistingMethods || setAsDefault}
              disabled={!hasExistingMethods}
              onCheckedChange={(v) => setSetAsDefault(Boolean(v))}
            />
            <Label
              htmlFor="defaultCheck"
              className="text-xs font-normal text-slate-700 cursor-pointer"
            >
              {!hasExistingMethods
                ? "This will be your default payment method"
                : "Set as default payment method"}
            </Label>
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
              {isSubmitting ? "Adding..." : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
