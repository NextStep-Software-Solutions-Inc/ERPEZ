import type { Invoice, InvoiceStatus } from "../types";

export interface StatusBadgeConfig {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  className: string;
}

export function getInvoiceStatusBadge(status: InvoiceStatus): StatusBadgeConfig {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        variant: "outline",
        className: "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium",
      };
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-50 text-amber-700 border-amber-300 font-medium",
      };
    case "overdue":
      return {
        label: "Overdue",
        variant: "destructive",
        className: "bg-rose-50 text-rose-700 border-rose-300 font-medium",
      };
    case "void":
      return {
        label: "Void",
        variant: "secondary",
        className: "bg-slate-100 text-slate-500 border-slate-200 font-medium",
      };
    case "draft":
    default:
      return {
        label: "Draft",
        variant: "secondary",
        className: "bg-gray-100 text-gray-700 border-gray-200 font-medium",
      };
  }
}

export function formatInvoiceDate(isoDate: string): string {
  if (!isoDate) return "N/A";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function filterInvoices(
  invoices: Invoice[],
  searchQuery: string,
  statusFilter: string
): Invoice[] {
  const query = searchQuery.trim().toLowerCase();

  return invoices.filter((inv) => {
    // Status filter
    if (statusFilter !== "all" && inv.status !== statusFilter) {
      return false;
    }

    // Search query
    if (!query) return true;

    return (
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.planName.toLowerCase().includes(query) ||
      inv.items.some((item) => item.description.toLowerCase().includes(query)) ||
      inv.status.toLowerCase().includes(query)
    );
  });
}
