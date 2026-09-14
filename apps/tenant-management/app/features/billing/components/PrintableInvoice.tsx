import React from "react";
import type { BillingContact, Invoice } from "../types";
import { formatInvoiceDate, getInvoiceStatusBadge } from "../utils/invoice";
import { formatMoney } from "../utils/money";
import { Badge } from "~/components/ui/badge";

interface PrintableInvoiceProps {
  invoice: Invoice;
  contact?: BillingContact;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  contact,
}) => {
  const statusBadge = getInvoiceStatusBadge(invoice.status);

  return (
    <div id="printable-invoice-section" className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 text-slate-900 font-sans">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-section, #printable-invoice-section * {
            visibility: visible;
          }
          #printable-invoice-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 24px !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/image/Logo1.png" alt="ERPEZ" className="h-7 w-auto" />
            <span className="text-xl font-bold tracking-tight text-slate-900">ERPEZ</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Enterprise Cloud & Sovereign Tenant Management</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="flex items-center gap-2 sm:justify-end">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</span>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-1">{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Metadata & Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-sm">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billed To</p>
          <p className="font-bold text-slate-900 mt-1">
            {contact?.companyName || "ERPEZ Dev Sandbox"}
          </p>
          <p className="text-slate-600">{contact?.billingEmail || "dev@erpez.local"}</p>
          {contact?.address && <p className="text-slate-600">{contact.address}</p>}
          {(contact?.city || contact?.country) && (
            <p className="text-slate-600">
              {[contact?.city, contact?.postalCode, contact?.country].filter(Boolean).join(", ")}
            </p>
          )}
          {contact?.taxId && (
            <p className="text-xs text-slate-500 mt-1">Tax ID / TIN: {contact.taxId}</p>
          )}
        </div>

        <div className="sm:text-right space-y-1 text-xs">
          <p className="font-semibold text-slate-400 uppercase tracking-wider">Invoice Details</p>
          <div className="flex justify-between sm:justify-end gap-4">
            <span className="text-slate-500">Invoice Date:</span>
            <span className="font-medium text-slate-900">{formatInvoiceDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex justify-between sm:justify-end gap-4">
            <span className="text-slate-500">Due Date:</span>
            <span className="font-medium text-slate-900">{formatInvoiceDate(invoice.dueDate)}</span>
          </div>
          {invoice.paidDate && (
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-500">Paid Date:</span>
              <span className="font-medium text-emerald-700">{formatInvoiceDate(invoice.paidDate)}</span>
            </div>
          )}
          {invoice.paymentMethodSummary && (
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-medium text-slate-800">{invoice.paymentMethodSummary}</span>
            </div>
          )}
          <div className="flex justify-between sm:justify-end gap-4">
            <span className="text-slate-500">Billing Cycle:</span>
            <span className="font-medium text-slate-800 capitalize">{invoice.billingCycle}</span>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-slate-200 rounded-md overflow-hidden my-6">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200">
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold text-center w-20">Qty</th>
              <th className="py-3 px-4 font-semibold text-right w-28">Unit Price</th>
              <th className="py-3 px-4 font-semibold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {invoice.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  {item.description}
                </td>
                <td className="py-3.5 px-4 text-center">{item.quantity}</td>
                <td className="py-3.5 px-4 text-right">
                  {formatMoney(item.unitPriceCents, invoice.currency)}
                </td>
                <td className="py-3.5 px-4 text-right font-medium">
                  {formatMoney(item.totalCents, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end my-6">
        <div className="w-full sm:w-72 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatMoney(invoice.subtotalCents, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax ({Math.round(invoice.taxRate * 100)}% VAT)</span>
            <span className="font-medium text-slate-900">
              {formatMoney(invoice.taxCents, invoice.currency)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-blue-600">
              {formatMoney(invoice.totalCents, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 text-center sm:text-left">
        <p>Thank you for choosing ERPEZ. For questions or enterprise PO support, contact billing@erpez.dev.</p>
        <p className="mt-0.5 text-[11px] text-slate-400">NextStep Software Solutions Inc. &bull; Sovereign & Multi-Tenant Systems</p>
      </div>
    </div>
  );
};
