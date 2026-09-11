import React from "react";
import type { PaymentMethod } from "../types";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CreditCard, Trash2, CheckCircle2 } from "lucide-react";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isOnlyMethod: boolean;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isOnlyMethod,
  onSetDefault,
  onDelete,
}) => {
  const brandLabel = method.brand ? method.brand.toUpperCase() : "CARD";

  return (
    <Card className={`relative border ${method.isDefault ? "border-blue-500 bg-blue-50/20" : "border-slate-200"}`}>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
            {brandLabel === "VISA" ? (
              <span className="text-blue-700 italic font-black">VISA</span>
            ) : brandLabel === "MASTERCARD" ? (
              <span className="text-orange-600 font-black">MC</span>
            ) : brandLabel === "AMEX" ? (
              <span className="text-sky-600 font-bold">AMEX</span>
            ) : (
              <CreditCard className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-slate-900">
                •••• •••• •••• {method.last4}
              </p>
              {method.isDefault && (
                <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Expires {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear} &bull; {method.cardholderName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {!method.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(method.id)}
              className="text-xs h-8 text-slate-700 hover:text-blue-600 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Make Default
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(method.id)}
            disabled={isOnlyMethod}
            title={isOnlyMethod ? "Cannot delete the only payment method" : "Remove payment method"}
            className={`text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 ${
              isOnlyMethod ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
