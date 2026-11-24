import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import {
  Settings,
  FileText,
  CalendarFold,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Check,
  CreditCard,
  Receipt,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { PageContainer } from "~/components/PageContainer";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useTenant } from "~/providers/TenantProvider";
import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { getTenantLicenseRequest } from "~/features/license/handlers/getTenantLicenseRequest";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { formatMoney } from "~/features/billing/utils/money";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { AddPaymentMethodModal } from "~/features/billing/components/AddPaymentMethodModal";

const useTenantLicense = createQueryHookFromTemplate(getTenantLicenseRequest);

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const {
    data: billingData,
    isLoading: isBillingLoading,
    updateSubscription,
    addPaymentMethod,
  } = useBillingData();

  const sub = tenant?.tenantSubscription || tenant?.tenantSubscriptions?.[0];
  const subscription = billingData?.subscription;
  const nextInvoice = billingData?.nextInvoice;

  // License hook
  const { data: licenseResponse } = useTenantLicense({
    pathParams: { id: tenant?.id || "00000000-0000-0000-0000-000000000001" },
    queryParams: { domain: typeof window !== "undefined" ? window.location.hostname : "" },
  });
  const license = licenseResponse?.data;

  // Authoritative subscription properties unified with Billing & Invoice pages
  const planName = subscription?.planName || sub?.plan || (license?.plan as string) || "Starter";
  const rawStatus = subscription?.status || (sub?.status?.toLowerCase() as string) || "active";
  const status = rawStatus.toLowerCase();
  const billingCycle =
    subscription?.billingCycle ||
    (sub?.billingCycle?.toLowerCase().includes("year") ? "yearly" : "monthly");
  const isYearly = billingCycle === "yearly";
  const autoRenew = subscription?.autoRenew ?? sub?.autoRenew ?? false;
  const amountCents = subscription?.amountCents || (sub?.amount ? Math.round(sub.amount * 100) : 0);
  const currency = subscription?.currency || "PHP";

  // Authoritative Trial Detection
  const isTrial =
    subscription?.isTrial ??
    (rawStatus.includes("trial") ||
      sub?.amount === 0 ||
      license?.prefix === "TRIAL" ||
      license?.key?.startsWith("TRIAL") ||
      ((planName.toLowerCase().includes("starter") || planName.toLowerCase().includes("pro")) &&
        (sub?.amount === 0 || !sub?.autoRenew)));

  const daysRemaining = subscription?.trialDaysRemaining ?? (license?.remainingDays || 30);
  const totalTrialDays = 30;
  const elapsedDays = Math.max(0, totalTrialDays - daysRemaining);
  const trialProgressPercent = Math.min(100, Math.max(7, Math.round((elapsedDays / totalTrialDays) * 100)));

  // Formatted trial end date
  const effectiveEndDate = subscription?.endDate || sub?.endDate;
  const trialEndsAt =
    subscription?.trialEndsAt ||
    nextInvoice?.dueDate ||
    (effectiveEndDate
      ? new Date(effectiveEndDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }));

  const formattedShortEndDate =
    effectiveEndDate
      ? new Date(effectiveEndDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

  const gracePeriodEndsAt =
    subscription?.gracePeriodEndsAt ||
    (effectiveEndDate
      ? new Date(new Date(effectiveEndDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }));

  // Formatted next billing date for paid plans
  const nextBillingDate =
    status === "cancelled" || status === "expired" || (!autoRenew && !isTrial)
      ? "None scheduled"
      : nextInvoice && nextInvoice.isApplicable && nextInvoice.dueDate !== "N/A"
      ? nextInvoice.dueDate
      : effectiveEndDate
      ? new Date(effectiveEndDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "None scheduled";

  // Calculate monthly vs annual pricing for the post-trial rate
  const monthlyPriceCents = isYearly ? Math.round(amountCents / 10) : amountCents;
  const annualPriceCents = isYearly ? amountCents : monthlyPriceCents * 10;

  // Payment method state
  const hasPaymentMethod =
    Boolean(billingData?.paymentMethods && billingData.paymentMethods.length > 0);

  // Dialog & Modal states
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isAutoRenewEnabledModalOpen, setIsAutoRenewEnabledModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Handle cycle switch
  const handleSelectCycle = async (targetCycle: "monthly" | "yearly") => {
    if (targetCycle === billingCycle) return;
    try {
      await updateSubscription({ billingCycle: targetCycle });
      toast.success(
        targetCycle === "yearly"
          ? "Switched to Annual billing"
          : "Switched to Monthly billing"
      );
    } catch {
      toast.error("Failed to change billing frequency");
    }
  };

  // Handle auto renewal toggle
  const handleToggleAutoRenew = async () => {
    if (autoRenew && status !== "cancelled") {
      // Prompt cancellation scheduled dialog
      setIsCancelDialogOpen(true);
    } else {
      try {
        await updateSubscription({ autoRenew: true, status: "active" });
        setIsAutoRenewEnabledModalOpen(true);
        toast.success(`${planName} trial reactivated. Your plan will continue after the trial.`);
      } catch {
        toast.error("Failed to update renewal preference");
      }
    }
  };

  // Handle cancellation confirmation
  const handleConfirmCancel = async () => {
    try {
      await updateSubscription({ status: "cancelled", autoRenew: false });
      setIsCancelDialogOpen(false);
      toast.success(`${planName} trial canceled. You'll keep access until ${formattedShortEndDate}.`);
    } catch {
      toast.error("Failed to cancel trial");
    }
  };

  // Handle reactivate confirmation
  const handleConfirmReactivate = async () => {
    try {
      await updateSubscription({ status: "active", autoRenew: true });
      setIsReactivateDialogOpen(false);
      toast.success(`${planName} trial reactivated. Your plan will continue after the trial.`);
    } catch {
      toast.error("Failed to reactivate trial");
    }
  };

  // Status badge styling
  const statusBadge = isTrial ? (
    status === "cancelled" ? (
      <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-bold px-2.5 py-0.5">
        CANCELED
      </Badge>
    ) : status === "past_due" ? (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold px-2.5 py-0.5">
        ACTION REQUIRED
      </Badge>
    ) : (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold px-2.5 py-0.5">
        TRIAL ACTIVE
      </Badge>
    )
  ) : status === "active" ? (
    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">ACTIVE</Badge>
  ) : status === "past_due" ? (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200">PAST DUE</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-700 border-slate-200">CANCELLED</Badge>
  );

  if (isBillingLoading) {
    return (
      <PageContainer
        title="Subscription"
        description="Manage your plan, trial, billing and license"
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-32 bg-slate-100 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Subscription"
      description="Manage your plan, trial, billing and license"
    >
      <div className="space-y-6">
        {/* Grace Period Banner (Displayed when payment issue arises after trial) */}
        {status === "past_due" && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-amber-950 text-sm">
                      Payment issue — your access is still active
                    </h4>
                    <Badge className="bg-amber-200 text-amber-900 border-amber-400 text-[10px] font-bold">
                      ACTION REQUIRED
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    We couldn't process your payment for {planName}. Update your payment method by{" "}
                    <strong>{gracePeriodEndsAt}</strong> to keep using {planName}.
                  </p>
                  {nextInvoice && nextInvoice.totalCents > 0 ? (
                    <p className="text-[11px] text-amber-700">
                      Your access is still active. Amount due:{" "}
                      <strong>{formatMoney(nextInvoice.totalCents, currency)}</strong>
                      {nextInvoice.subtotalCents > 0 && (
                        <>
                          {" "}({formatMoney(nextInvoice.subtotalCents, currency)} {planName} plan
                          {nextInvoice.taxCents > 0
                            ? ` + ${formatMoney(nextInvoice.taxCents, currency)} estimated tax`
                            : ""}
                          )
                        </>
                      )}
                      .
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-700">
                      Your access is still active. Please update your payment method to resolve this issue.
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 h-9 px-4"
              >
                Update Payment Method
              </Button>
            </div>
          </div>
        )}

        {/* Card 1: Primary Subscription / Trial Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {isTrial ? `${planName} — Free Trial` : planName}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-600">
                  {isTrial
                    ? status === "cancelled"
                      ? `Your trial has been canceled. You'll continue to have access to ${planName} until your trial ends.`
                      : status === "past_due"
                      ? "Your access is still active while you resolve your payment issue."
                      : `You're currently using the ${planName} plan at no cost.`
                    : "Your authoritative subscription details synchronized with billing and invoices"}
                </CardDescription>
              </div>
              <div className="shrink-0">{statusBadge}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Trial Countdown & Visual Progress Bar */}
            {isTrial && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {status === "cancelled"
                        ? `Trial ends ${trialEndsAt}`
                        : daysRemaining === 0
                        ? "Your trial ends today"
                        : daysRemaining === 3
                        ? "Your trial ends in 3 days"
                        : `${daysRemaining} days remaining`}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600">
                    Your trial ends <strong className="text-slate-900">{trialEndsAt}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${trialProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>30-day free trial</span>
                    <span>
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Ends today"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Trial Attributes Grid */}
            {isTrial ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-sm pt-1">
                <div>
                  <p className="text-muted-foreground text-xs">Current cost</p>
                  <p className="font-bold text-emerald-700 mt-0.5 text-base">
                    ₱0{" "}
                    <span className="text-xs font-normal text-slate-500">
                      during your trial
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Trial ends</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-base">{trialEndsAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Trial duration</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    30 days{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({daysRemaining > 0 ? `${daysRemaining} left` : "Ends today"})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Continue after trial</p>
                  <div className="mt-0.5">
                    <Badge
                      className={
                        autoRenew && status !== "cancelled"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold"
                          : "bg-slate-100 text-slate-700 border-slate-200 font-semibold"
                      }
                    >
                      {autoRenew && status !== "cancelled" ? "ON" : "OFF"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Plan Tier</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{planName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Next Billing Date</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{nextBillingDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-0.5">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Auto Renewal</p>
                  <div className="mt-0.5">
                    <Badge
                      className={
                        autoRenew
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }
                    >
                      {autoRenew ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Billing Frequency</p>
                  <p className="font-semibold text-slate-900 mt-0.5 capitalize">
                    {isYearly ? "Annual" : "Monthly"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Base Plan Rate</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {amountCents > 0
                      ? formatMoney(amountCents, currency)
                      : "Quotation / Agreement"}
                    {amountCents > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        /{isYearly ? "year" : "mo"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Trial Payment Readiness Banner */}
            {isTrial && (
              <div className="pt-1">
                {status === "cancelled" || !autoRenew ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2.5 text-xs text-slate-600">
                    <Info className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Your {planName} access will end on {trialEndsAt}. You won't be charged.</span>
                  </div>
                ) : hasPaymentMethod ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2.5 text-xs text-emerald-800">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Payment method on file. Your trial ends on {trialEndsAt}. Contact the ERP-EZ team for subscription options after your trial.
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">
                          Payment method required to continue
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                          Add a payment method before your trial ends to continue with {planName} after{" "}
                          <strong>{trialEndsAt}</strong>.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsAddPaymentModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 h-8 font-medium"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Projected Next Invoice Section (Paid Plans only) */}
            {!isTrial && nextInvoice && nextInvoice.isApplicable && (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Projected Next Invoice Total
                    </span>
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-700 bg-blue-50 text-[10px] py-0"
                    >
                      Due {nextInvoice.dueDate}
                    </Badge>
                  </div>

                  <p className="text-lg font-extrabold text-slate-900">
                    {formatMoney(nextInvoice.totalCents, nextInvoice.currency)}
                    {nextInvoice.subtotalCents > 0 && (
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        ({formatMoney(nextInvoice.subtotalCents, nextInvoice.currency)} plan
                        {nextInvoice.taxCents > 0
                          ? ` + ${formatMoney(nextInvoice.taxCents, nextInvoice.currency)} ${Math.round(nextInvoice.taxRate * 100)}% VAT`
                          : ""}
                        )
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/billing")}
                    className="text-xs h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                    Billing Overview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/invoice")}
                    className="text-xs h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                    All Invoices
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Continue after trial / Settings (Simplified without redundancy) */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {isTrial ? "Continue after trial" : "Subscription Settings"}
                </CardTitle>
              </div>
              {isTrial && (
                <Badge
                  className={
                    autoRenew && status !== "cancelled"
                      ? "bg-emerald-100 text-emerald-800 text-xs py-0.5 px-2.5 font-bold border-emerald-300"
                      : "bg-slate-100 text-slate-700 text-xs py-0.5 px-2.5 font-bold border-slate-300"
                  }
                >
                  {autoRenew && status !== "cancelled" ? "ON" : "OFF"}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-slate-600 mt-1">
              {isTrial ? (
                autoRenew && status !== "cancelled" ? (
                  <>
                    Your trial ends on <strong className="text-slate-900">{trialEndsAt}</strong>. Contact the ERP-EZ team for subscription options after your trial.
                  </>
                ) : (
                  <>
                    Your {planName} access will end on{" "}
                    <strong className="text-slate-900">{trialEndsAt}</strong>. You won't be charged when
                    your trial ends.
                  </>
                )
              ) : (
                "Configure your subscription renewal preferences"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-slate-900">
                  {isTrial ? "Continue after trial" : "Auto Renewal"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isTrial
                    ? autoRenew && status !== "cancelled"
                      ? "Your workspace is configured to continue after the free trial. Contact the ERP-EZ team for subscription options."
                      : `Your account will not continue after the trial ends.`
                    : "Automatically renew your subscription at the end of each billing period"}
                </p>
              </div>
              <Switch
                checked={autoRenew && status !== "cancelled"}
                onCheckedChange={handleToggleAutoRenew}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Linked Sovereign License Key (Countdown Removed) */}
        <Card className="shadow-sm border-slate-200 bg-slate-50/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Linked Sovereign License Key</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/license-management")}
                className="text-xs flex items-center gap-1.5"
              >
                Manage License
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              1 Subscription = 1 Cryptographic Key. Bound to your admin email with domain constraint enforcement.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {license ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border font-mono text-xs">
                <div>
                  <span className="font-bold text-slate-900 block truncate">{license.key}</span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Bound to: {license.boundEmail} &bull; Domain: {license.allowedDomain}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {license.status ? license.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-lg border text-xs text-slate-500 flex items-center justify-between">
                <span>No license key activated for this subscription.</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate("/license-management")}
                  className="text-blue-600 hover:text-blue-700 text-xs h-7"
                >
                  Activate Now &rarr;
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Billing Cycle (Paid Plans only) */}
        {!isTrial && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarFold className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Billing Cycle</CardTitle>
              </div>
              <CardDescription>
                Change your billing frequency for the {planName} plan. Select an option to switch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Monthly Option */}
                <div
                  onClick={() => handleSelectCycle("monthly")}
                  className={`border rounded-xl p-4 flex justify-between items-center transition cursor-pointer ${
                    !isYearly
                      ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-slate-900">Monthly</h3>
                      {!isYearly && (
                        <Badge className="bg-blue-600 text-white text-[10px] py-0 px-2">
                          <Check className="w-3 h-3 mr-1" />
                          Active Cycle
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Billed every month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">
                      {formatMoney(monthlyPriceCents, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                {/* Annual Option */}
                <div
                  onClick={() => handleSelectCycle("yearly")}
                  className={`border rounded-xl p-4 flex justify-between items-center transition cursor-pointer ${
                    isYearly
                      ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-slate-900">Annual</h3>
                      {isYearly && (
                        <Badge className="bg-blue-600 text-white text-[10px] py-0 px-2">
                          <Check className="w-3 h-3 mr-1" />
                          Active Cycle
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px] py-0 font-semibold"
                      >
                        Save {formatMoney(monthlyPriceCents * 2, currency)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Billed yearly (2 months free)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">
                      {formatMoney(annualPriceCents, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">per year</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 5: Trial Actions (Continue after trial clearly visible when OFF) */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {isTrial ? "Trial Actions" : "Subscription Actions"}
            </CardTitle>
            <CardDescription>
              {isTrial
                ? "Manage your trial tier, billing statements, or change trial status"
                : "Manage your plan tier, billing statements, or change subscription status"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Link to="/plan" className="no-underline">
                <Button className="w-full bg-blue-600 text-white rounded-md py-2.5 px-4 text-center text-xs font-medium hover:bg-blue-700">
                  Change Plan
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => navigate("/billing")}
                className="w-full text-xs py-2.5 px-4 text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                Billing & Payment
              </Button>

              {status === "cancelled" || !autoRenew ? (
                <Button
                  onClick={() => setIsReactivateDialogOpen(true)}
                  className="w-full bg-emerald-600 text-white text-xs py-2.5 px-4 font-semibold hover:bg-emerald-700 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Continue with {planName}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="w-full bg-white border-rose-200 text-rose-700 text-xs py-2.5 px-4 font-medium hover:bg-rose-50"
                >
                  {isTrial ? "Cancel Trial" : "Cancel Subscription"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/invoice")}
                className="w-full text-xs py-2.5 px-4 text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                {isTrial ? "View Billing History" : "View Invoices"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isTrial
                ? "Cancel anytime during your trial. You won't be charged if you cancel before the trial ends."
                : "Cancelling your subscription will maintain active access until the end of your current billing period, after which your account downgrades to free tier."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base font-bold">
                {isTrial ? `Cancel your ${planName} trial?` : "Cancel Subscription?"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              {isTrial ? (
                <>
                  <p>
                    You'll keep access to {planName} until <strong>{trialEndsAt}</strong>.
                  </p>
                  <p>
                    After that, your {planName} subscription won't continue and you won't be charged.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to cancel your <strong>{planName}</strong> subscription?
                  </p>
                  <p>
                    Your service will remain active until <strong>{nextBillingDate}</strong>. After this date, automatic charges will halt.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(false)}
              className="text-xs"
            >
              {isTrial ? "Keep Trial" : "Keep Subscription"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isTrial ? "Cancel Trial" : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate / Continue Dialog */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
              <DialogTitle className="text-base font-bold">
                {isTrial ? `Continue with ${planName}` : "Reactivate Subscription"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              {isTrial ? (
                <>
                  <p>
                    Your {planName} plan will continue after <strong>{trialEndsAt}</strong>.
                  </p>
                  <p className="text-xs text-slate-600">
                    Contact the ERP-EZ team for subscription options after your trial ends.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {hasPaymentMethod
                      ? "Payment method registered on file."
                      : "No payment method is registered on file. You can add one anytime before your trial ends."}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Continue after trial: ON
                  </p>
                </>
              ) : (
                <p>
                  Reactivating will re-enable automated billing for your <strong>{planName}</strong> plan at{" "}
                  <strong>{formatMoney(amountCents, currency)}/{isYearly ? "year" : "mo"}</strong> and resume full enterprise features.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReactivateDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReactivate}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isTrial ? "Confirm" : "Reactivate Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Will Continue Dialog (After Enabling Auto-Renew) */}
      <Dialog open={isAutoRenewEnabledModalOpen} onOpenChange={setIsAutoRenewEnabledModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles className="h-5 w-5" />
              <DialogTitle className="text-base font-bold">
                {planName} will continue after your trial
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              <p>
                Your free trial ends on <strong>{trialEndsAt}</strong>. Contact the ERP-EZ team for subscription options after your trial.
              </p>
              <p className="text-[11px] text-slate-500">
                {hasPaymentMethod
                  ? "Payment method registered on file."
                  : "No payment method is registered on file. You can add one anytime before your trial ends."}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              size="sm"
              onClick={() => setIsAutoRenewEnabledModalOpen(false)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddPaymentModalOpen}
        hasExistingMethods={hasPaymentMethod}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onAdd={async (input) => {
          await addPaymentMethod(input);
        }}
        isTrial={isTrial}
        planName={planName}
        planRateText={!isTrial ? `${formatMoney(monthlyPriceCents, currency)}/month + applicable tax` : undefined}
        trialEndDate={trialEndsAt}
      />
    </PageContainer>
  );
}
