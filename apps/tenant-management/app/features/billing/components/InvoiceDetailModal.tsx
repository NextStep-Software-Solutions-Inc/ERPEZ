import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Printer, CreditCard } from "lucide-react";
import type { BillingContact, Invoice } from "../types";
import { PrintableInvoice } from "./PrintableInvoice";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  contact?: BillingContact;
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  contact,
  isOpen,
  onClose,
  onPayNow,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPayable = invoice.status === "pending" || invoice.status === "overdue";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="no-print pb-2">
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span>Invoice Details &bull; {invoice.invoiceNumber}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Document Body */}
        <div className="py-2">
          <PrintableInvoice invoice={invoice} contact={contact} />
        </div>

        <DialogFooter className="no-print flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center gap-1.5 text-slate-700"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>

          {isPayable && onPayNow && (
            <Button
              onClick={() => onPayNow(invoice)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            >
              <CreditCard className="h-4 w-4" />
              Pay Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
