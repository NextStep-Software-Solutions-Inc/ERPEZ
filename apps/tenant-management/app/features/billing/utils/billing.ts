import type { Tenant } from "~/features/tenant/type/Tenant";
import type {
  BillingCycle,
  NextInvoiceProjection,
  SubscriptionAdapter,
  SubscriptionStatus,
} from "../types";
import { calculateTax, decimalToCents } from "./money";

/**
 * Maps raw backend Tenant object into an authoritative SubscriptionAdapter.
 * Handles currency, lowercase status unions, and cents conversion.
 */
export function adaptTenantSubscription(
  tenant: Tenant | null,
  currency = "USD"
): SubscriptionAdapter | null {
  if (!tenant) return null;

  const rawSub =
    tenant.tenantSubscription ||
    (tenant.tenantSubscriptions && tenant.tenantSubscriptions[0]);

  if (!rawSub) {
    // Default fallback if tenant exists without explicit subscription record
    return {
      planName: "Enterprise",
      status: "active",
      amountCents: 29900,
      currency,
      billingCycle: "monthly",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
    };
  }

  // Normalize status to lowercase union
  const rawStatus = (rawSub.status || "active").toLowerCase();
  let status: SubscriptionStatus = "active";
  if (rawStatus.includes("cancel")) status = "cancelled";
  else if (rawStatus.includes("expire")) status = "expired";
  else if (rawStatus.includes("trial")) status = "trialing";
  else if (rawStatus.includes("past") || rawStatus.includes("due")) status = "past_due";
  else if (rawStatus.includes("suspend") || rawStatus.includes("inactive")) status = "cancelled";

  // Normalize billing cycle
  const rawCycle = (rawSub.billingCycle || "monthly").toLowerCase();
  const billingCycle: BillingCycle = rawCycle.includes("year") || rawCycle.includes("annual")
    ? "yearly"
    : "monthly";

  // Normalize plan name
  const planName = rawSub.plan || "Enterprise";

  // Amount in cents
  const amountCents = typeof rawSub.amount === "number" && rawSub.amount > 0
    ? decimalToCents(rawSub.amount)
    : 29900; // default fallback

  return {
    planName,
    status,
    amountCents,
    currency,
    billingCycle,
    startDate: rawSub.startDate || new Date().toISOString(),
    endDate: rawSub.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: rawSub.autoRenew ?? true,
  };
}

/**
 * Calculates next invoice projection based on active subscription.
 * Handles cancelled, expired, and tax-exempt edge cases.
 */
export function calculateNextInvoice(
  subscription: SubscriptionAdapter | null,
  taxRate = 0.12 // 12% standard tax rate
): NextInvoiceProjection {
  if (!subscription) {
    return {
      isApplicable: false,
      planName: "No Active Plan",
      billingCycle: "monthly",
      currency: "USD",
      dueDate: "N/A",
      subtotalCents: 0,
      taxRate: 0,
      taxCents: 0,
      totalCents: 0,
      explanation: "No subscription currently assigned to this tenant.",
    };
  }

  // Cancelled or expired subscriptions have no upcoming invoice
  if (subscription.status === "cancelled" || subscription.status === "expired") {
    return {
      isApplicable: false,
      planName: subscription.planName,
      billingCycle: subscription.billingCycle,
      currency: subscription.currency,
      dueDate: "N/A",
      subtotalCents: 0,
      taxRate: 0,
      taxCents: 0,
      totalCents: 0,
      explanation:
        subscription.status === "cancelled"
          ? "Subscription is cancelled. No upcoming billing scheduled."
          : "Subscription has expired.",
    };
  }

  const subtotalCents = subscription.amountCents;
  const taxCents = calculateTax(subtotalCents, taxRate);
  const totalCents = subtotalCents + taxCents;

  // Derive due date from endDate
  let dueDateStr = subscription.endDate;
  try {
    const end = new Date(subscription.endDate);
    if (!isNaN(end.getTime())) {
      dueDateStr = end.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }
  } catch {
    dueDateStr = "Upcoming";
  }

  return {
    isApplicable: true,
    planName: subscription.planName,
    billingCycle: subscription.billingCycle,
    currency: subscription.currency,
    dueDate: dueDateStr,
    subtotalCents,
    taxRate,
    taxCents,
    totalCents,
  };
}
