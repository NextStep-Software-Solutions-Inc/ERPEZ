import { useState, useMemo } from "react";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  FileText,
  Printer,
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Receipt,
  X,
} from "lucide-react";
import { PageContainer } from "~/components/PageContainer";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { formatMoney } from "~/features/billing/utils/money";
import {
  filterInvoices,
  formatInvoiceDate,
  getInvoiceStatusBadge,
} from "~/features/billing/utils/invoice";
import { InvoiceDetailModal } from "~/features/billing/components/InvoiceDetailModal";
import { PayInvoiceModal } from "~/features/billing/components/PayInvoiceModal";
import { AddPaymentMethodModal } from "~/features/billing/components/AddPaymentMethodModal";
import type { Invoice } from "~/features/billing/types";

export default function InvoicePage() {
  const {
    data,
    isLoading,
    error,
    processPayment,
    addPaymentMethod,
  } = useBillingData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);

  const invoices = data?.invoices || [];
  const contact = data?.billingContact;
  const paymentMethods = data?.paymentMethods || [];

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return filterInvoices(invoices, searchQuery, statusFilter);
  }, [invoices, searchQuery, statusFilter]);

  // KPI Metrics calculations
  const metrics = useMemo(() => {
    let totalInvoicedCents = 0;
    let totalPaidCents = 0;
    let totalPendingCents = 0;

    invoices.forEach((inv) => {
      totalInvoicedCents += inv.totalCents;
      if (inv.status === "paid") {
        totalPaidCents += inv.totalCents;
      } else if (inv.status === "pending" || inv.status === "overdue") {
        totalPendingCents += inv.totalCents;
      }
    });

    const currency = invoices[0]?.currency || "PHP";

    return {
      totalInvoiced: formatMoney(totalInvoicedCents, currency),
      totalPaid: formatMoney(totalPaidCents, currency),
      totalPending: formatMoney(totalPendingCents, currency),
      totalCount: invoices.length,
    };
  }, [invoices]);

  const handlePayNow = (inv: Invoice) => {
    setDetailInvoice(null);
    setPayingInvoice(inv);
  };

  const handleOpenPrint = (inv: Invoice) => {
    setDetailInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Invoices"
        description="View and download your billing history and invoices"
      >
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-slate-100 rounded-lg" />
            <div className="h-24 bg-slate-100 rounded-lg" />
            <div className="h-24 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-40 bg-slate-100 rounded-lg" />
          <div className="h-40 bg-slate-100 rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer
        title="Invoices"
        description="View and download your billing history and invoices"
      >
        <div className="p-6 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 text-sm">
          <p className="font-bold">Error loading invoices</p>
          <p className="text-xs mt-1">{error?.message || "Please refresh and try again."}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Invoices"
      description="View and download your billing history and invoices"
    >
      <div className="space-y-6">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Invoiced
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalInvoiced}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{metrics.totalCount} invoices total</p>
              </div>
              <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Receipt className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Paid to Date
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.totalPaid}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Cleared settlements</p>
              </div>
              <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending / Due
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.totalPending}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting payment</p>
              </div>
              <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by invoice #, plan, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Invoices" },
              { id: "paid", label: "Paid" },
              { id: "pending", label: "Pending" },
              { id: "overdue", label: "Overdue" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length > 0 ? (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const badge = getInvoiceStatusBadge(invoice.status);
              const isPayable =
                invoice.status === "pending" || invoice.status === "overdue";

              return (
                <Card
                  key={invoice.id}
                  className="shadow-sm rounded-lg border border-slate-200 hover:border-slate-300 transition"
                >
                  <CardContent className="p-5 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                      {/* Left: Invoice ID & Details */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">
                              {invoice.invoiceNumber}
                            </p>
                            <Badge className={`text-[10px] py-0 px-2 ${badge.className}`}>
                              {badge.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">
                            {invoice.planName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {invoice.items[0]?.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                        <div className="flex sm:flex-col justify-between sm:items-end w-full">
                          <p className="text-base sm:text-lg font-bold text-slate-900">
                            {formatMoney(invoice.totalCents, invoice.currency)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {invoice.paidDate
                              ? `Paid on ${formatInvoiceDate(invoice.paidDate)}`
                              : `Due on ${formatInvoiceDate(invoice.dueDate)}`}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-1 self-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailInvoice(invoice)}
                            className="text-xs h-8 px-2.5 flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPrint(invoice)}
                            className="text-xs h-8 px-2.5 flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print / Save PDF
                          </Button>

                          {isPayable && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(invoice)}
                              className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3 w-full" />

                    {/* Bottom Metadata Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>Invoice Date: {formatInvoiceDate(invoice.invoiceDate)}</span>
                        <span>Due Date: {formatInvoiceDate(invoice.dueDate)}</span>
                        {invoice.paymentMethodSummary && (
                          <span className="font-medium text-slate-700">
                            Payment: {invoice.paymentMethodSummary}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {invoice.id}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-slate-200">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800">No Invoices Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? `No invoices matched your filter criteria "${searchQuery || statusFilter}".`
                : "No billing invoices recorded yet."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={Boolean(detailInvoice)}
        invoice={detailInvoice}
        contact={contact}
        onClose={() => setDetailInvoice(null)}
        onPayNow={handlePayNow}
      />

      {/* Pay Invoice Modal (Simulated Payment Flow) */}
      <PayInvoiceModal
        isOpen={Boolean(payingInvoice)}
        invoice={payingInvoice}
        paymentMethods={paymentMethods}
        onClose={() => setPayingInvoice(null)}
        onPay={async (invoiceId, methodId) => {
          return await processPayment(invoiceId, methodId);
        }}
        onOpenAddMethod={() => setIsAddMethodOpen(true)}
      />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddMethodOpen}
        hasExistingMethods={paymentMethods.length > 0}
        onClose={() => setIsAddMethodOpen(false)}
        onAdd={async (input) => {
          await addPaymentMethod(input);
        }}
      />
    </PageContainer>
  );
}