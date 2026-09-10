import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Wallet2,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  ArrowRight,
  Printer,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { formatMoney } from "~/features/billing/utils/money";
import { formatInvoiceDate, getInvoiceStatusBadge } from "~/features/billing/utils/invoice";
import { BillingContactModal } from "~/features/billing/components/BillingContactModal";
import { InvoiceDetailModal } from "~/features/billing/components/InvoiceDetailModal";
import type { Invoice } from "~/features/billing/types";

interface BillingOverviewTabProps {
  onSwitchToPaymentTab?: () => void;
}

export const BillingOverviewTab: React.FC<BillingOverviewTabProps> = ({
  onSwitchToPaymentTab,
}) => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    updateBillingContact,
  } = useBillingData();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 animate-pulse">
        <div className="h-64 bg-slate-100 rounded-lg" />
        <div className="h-64 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 text-sm">
        <p className="font-bold">Error loading billing information</p>
        <p className="text-xs mt-1">{error?.message || "Please refresh and try again."}</p>
      </div>
    );
  }

  const { subscription, nextInvoice, defaultPaymentMethod, invoices, billingContact } = data;

  const isCancelledOrExpired =
    subscription?.status === "cancelled" || subscription?.status === "expired";

  const statusBadgeVariant =
    subscription?.status === "active"
      ? "bg-emerald-500 text-white"
      : subscription?.status === "past_due"
      ? "bg-amber-500 text-white"
      : "bg-slate-500 text-white";

  const recentInvoices = invoices.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top 2 Cards: Current Plan & Next Invoice */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet2 className="h-5 w-5 text-[var(--button-blue)]" />
                <CardTitle className="text-base font-semibold">Current Plan</CardTitle>
              </div>
              <Badge className={statusBadgeVariant}>
                {subscription ? subscription.status.toUpperCase() : "ACTIVE"}
              </Badge>
            </div>
            <CardDescription>Authoritative active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {subscription?.planName || "Enterprise"}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {subscription?.billingCycle || "Monthly"} Billing Cycle
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-blue-600">
                  {subscription
                    ? `${formatMoney(subscription.amountCents, subscription.currency)}`
                    : "$299.00"}
                  <span className="text-xs font-normal text-slate-500">
                    /{subscription?.billingCycle === "yearly" ? "yr" : "mo"}
                  </span>
                </p>
              </div>
            </div>

            <dl className="grid gap-2 text-sm border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Renewal Status</dt>
                <dd className="font-medium text-slate-800">
                  {subscription?.autoRenew ? "Auto-Renew Enabled" : "Manual Renewal"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Next Billing Date</dt>
                <dd className="font-medium text-slate-800">
                  {isCancelledOrExpired
                    ? "None scheduled"
                    : nextInvoice.dueDate}
                </dd>
              </div>
            </dl>

            <Button
              onClick={() => navigate("/plan")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mt-2"
            >
              Change Plan
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Next Invoice Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base font-semibold">Next Invoice</CardTitle>
              </div>
              {nextInvoice.isApplicable && (
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                  Due {nextInvoice.dueDate}
                </Badge>
              )}
            </div>
            <CardDescription>Upcoming projected billing summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextInvoice.isApplicable ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {formatMoney(nextInvoice.totalCents, nextInvoice.currency)}
                  </p>
                  <span className="text-xs text-slate-500">
                    Includes {Math.round(nextInvoice.taxRate * 100)}% estimated tax
                  </span>
                </div>

                <dl className="grid gap-2 text-sm border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {nextInvoice.planName} ({nextInvoice.billingCycle})
                    </dt>
                    <dd className="font-medium">
                      {formatMoney(nextInvoice.subtotalCents, nextInvoice.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Tax ({Math.round(nextInvoice.taxRate * 100)}% VAT)
                    </dt>
                    <dd className="font-medium">
                      {formatMoney(nextInvoice.taxCents, nextInvoice.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-2 text-slate-900">
                    <dt>Total Estimated Due</dt>
                    <dd className="text-blue-600">
                      {formatMoney(nextInvoice.totalCents, nextInvoice.currency)}
                    </dd>
                  </div>
                </dl>

                <Button
                  variant="outline"
                  onClick={() => navigate("/invoice")}
                  className="w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  View All Invoices
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="font-semibold text-slate-800 text-sm">
                  {nextInvoice.explanation || "No upcoming invoice scheduled"}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your subscription is currently not renewing automatically. Reactive or change plan anytime.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate("/plan")}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Reactivate Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Payment Method Summary & Billing Contact */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Method Summary */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Payment Method</CardTitle>
              </div>
              {onSwitchToPaymentTab && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSwitchToPaymentTab}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Manage &rarr;
                </Button>
              )}
            </div>
            <CardDescription>Primary method for automated charges</CardDescription>
          </CardHeader>
          <CardContent>
            {defaultPaymentMethod ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-10 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] uppercase text-blue-700">
                    {defaultPaymentMethod.brand || "CARD"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      •••• •••• •••• {defaultPaymentMethod.last4}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Exp {String(defaultPaymentMethod.expiryMonth).padStart(2, "0")}/{defaultPaymentMethod.expiryYear} &bull; {defaultPaymentMethod.cardholderName}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-none">
                  Default
                </Badge>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                <p>No default payment method registered.</p>
                {onSwitchToPaymentTab && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onSwitchToPaymentTab}
                    className="mt-2 text-xs"
                  >
                    + Add Payment Method
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Contact & Address */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Billing Details</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContactModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Edit Details
              </Button>
            </div>
            <CardDescription>Recipient information for invoices</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-slate-700">
            <p className="font-semibold text-sm text-slate-900">{billingContact.companyName}</p>
            <p className="text-slate-600">{billingContact.billingEmail}</p>
            {billingContact.address && <p className="text-slate-500">{billingContact.address}</p>}
            {(billingContact.city || billingContact.country) && (
              <p className="text-slate-500">
                {[billingContact.city, billingContact.postalCode, billingContact.country].filter(Boolean).join(", ")}
              </p>
            )}
            {billingContact.taxId && (
              <p className="text-[11px] text-slate-400 font-mono">TIN: {billingContact.taxId}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Snapshot Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/invoice")}
              className="text-xs flex items-center gap-1"
            >
              All Invoices
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <CardDescription>Latest billing statements and payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {recentInvoices.map((inv) => {
              const badge = getInvoiceStatusBadge(inv.status);
              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white hover:bg-slate-50/70 transition gap-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-slate-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{inv.invoiceNumber}</span>
                        <Badge className={`text-[10px] py-0 px-1.5 ${badge.className}`}>{badge.label}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{inv.planName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900">{formatMoney(inv.totalCents, inv.currency)}</p>
                      <p className="text-[10px] text-slate-400">{formatInvoiceDate(inv.invoiceDate)}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(inv)}
                      className="text-xs h-7 px-2 flex items-center gap-1"
                    >
                      <Printer className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Contact Modal */}
      <BillingContactModal
        isOpen={isContactModalOpen}
        contact={billingContact}
        onClose={() => setIsContactModalOpen(false)}
        onSave={async (updated) => {
          await updateBillingContact(updated);
        }}
      />

      {/* Invoice Detail Modal for Quick View */}
      <InvoiceDetailModal
        isOpen={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        contact={billingContact}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};