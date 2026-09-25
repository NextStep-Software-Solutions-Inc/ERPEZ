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
    const trialDays = 14;
    const now = new Date();
    const endDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    const trialEndsAt = new Date(endDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return {
      planName: "Starter",
      status: "active",
      amountCents: 29900,
      currency,
      billingCycle: "monthly",
      startDate: now.toISOString(),
      endDate,
      autoRenew: false,
      isTrial: true,
      trialDaysRemaining: trialDays,
      trialEndsAt,
      paymentDueAt: trialEndsAt,
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
  const planName = rawSub.plan || "Starter";

  // Detect trial status:
  // 1. rawStatus explicitly includes "trial"
  // 2. rawSub.amount === 0 (or 0.0)
  // 3. Plan is Starter with zero amount or not autoRenew
  const isTrial =
    rawStatus.includes("trial") ||
    rawSub.amount === 0 ||
    (planName.toLowerCase().includes("starter") && (rawSub.amount === 0 || !rawSub.autoRenew));

  // Starter post-trial plan rate is $299/mo (or $2,990/year)
  const amountCents = typeof rawSub.amount === "number" && rawSub.amount > 0
    ? decimalToCents(rawSub.amount)
    : 29900; // Starter post-trial base rate

  const startDate = rawSub.startDate || new Date().toISOString();
  const endDate = rawSub.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const now = new Date();
  const endObj = new Date(endDate);
  const diffMs = endObj.getTime() - now.getTime();
  const trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const trialEndsAt = !isNaN(endObj.getTime())
    ? endObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Upcoming";

  const gracePeriodObj = new Date(endObj.getTime() + 3 * 24 * 60 * 60 * 1000);
  const gracePeriodEndsAt = !isNaN(gracePeriodObj.getTime())
    ? gracePeriodObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  return {
    planName,
    status,
    amountCents,
    currency,
    billingCycle,
    startDate,
    endDate,
    autoRenew: rawSub.autoRenew ?? false,
    isTrial,
    trialDaysRemaining,
    trialEndsAt,
    paymentDueAt: trialEndsAt,
    gracePeriodEndsAt,
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
      isTrial: false,
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
      isTrial: subscription.isTrial,
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
        month: "long",
        day: "numeric",
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
    isTrial: subscription.isTrial,
  };
}
