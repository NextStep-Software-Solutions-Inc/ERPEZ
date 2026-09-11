import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
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

const useTenantLicense = createQueryHookFromTemplate(getTenantLicenseRequest);

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const {
    data: billingData,
    isLoading: isBillingLoading,
    updateSubscription,
  } = useBillingData();

  const sub = tenant?.tenantSubscription || tenant?.tenantSubscriptions?.[0];
  const subscription = billingData?.subscription;
  const nextInvoice = billingData?.nextInvoice;

  // Authoritative subscription properties unified with Billing & Invoice pages
  const planName = subscription?.planName || sub?.plan || "Enterprise";
  const rawStatus = subscription?.status || (sub?.status?.toLowerCase() as string) || "active";
  const status = rawStatus.toLowerCase();
  const billingCycle =
    subscription?.billingCycle ||
    (sub?.billingCycle?.toLowerCase().includes("year") ? "yearly" : "monthly");
  const isYearly = billingCycle === "yearly";
  const autoRenew = subscription?.autoRenew ?? sub?.autoRenew ?? true;
  const amountCents = subscription?.amountCents || (sub?.amount ? Math.round(sub.amount * 100) : 29900);
  const currency = subscription?.currency || "USD";

  // Formatted next billing date aligned with nextInvoice.dueDate
  const nextBillingDate =
    status === "cancelled" || status === "expired"
      ? "None scheduled"
      : nextInvoice?.dueDate ||
        (subscription?.endDate
          ? new Date(subscription.endDate).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : "Ongoing");

  // Calculate monthly vs annual pricing for the current plan
  const monthlyPriceCents = isYearly ? Math.round(amountCents / 10) : amountCents;
  const annualPriceCents = isYearly ? amountCents : monthlyPriceCents * 10;

  // Interactive settings state
  const [emailNotification, setEmailNotification] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);

  // Dialog states
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);

  // License hook
  const { data: licenseResponse } = useTenantLicense({
    pathParams: { id: tenant?.id || "00000000-0000-0000-0000-000000000001" },
    queryParams: { domain: typeof window !== "undefined" ? window.location.hostname : "" },
  });
  const license = licenseResponse?.data;

  // Handle cycle switch
  const handleSelectCycle = async (targetCycle: "monthly" | "yearly") => {
    if (targetCycle === billingCycle) return;
    try {
      await updateSubscription({ billingCycle: targetCycle });
      toast.success(
        targetCycle === "yearly"
          ? "Switched to Annual billing (17% savings applied)"
          : "Switched to Monthly billing"
      );
    } catch {
      toast.error("Failed to change billing frequency");
    }
  };

  // Handle auto renewal toggle
  const handleToggleAutoRenew = async () => {
    try {
      const nextValue = !autoRenew;
      await updateSubscription({ autoRenew: nextValue });
      toast.success(
        nextValue
          ? "Auto-renewal enabled for upcoming billing periods"
          : "Auto-renewal disabled. Subscription will not renew automatically"
      );
    } catch {
      toast.error("Failed to update auto-renewal setting");
    }
  };

  // Handle cancellation confirmation
  const handleConfirmCancel = async () => {
    try {
      await updateSubscription({ status: "cancelled", autoRenew: false });
      setIsCancelDialogOpen(false);
      toast.success("Subscription has been cancelled. Active until end of current cycle.");
    } catch {
      toast.error("Failed to cancel subscription");
    }
  };

  // Handle reactivate confirmation
  const handleConfirmReactivate = async () => {
    try {
      await updateSubscription({ status: "active", autoRenew: true });
      setIsReactivateDialogOpen(false);
      toast.success("Subscription successfully reactivated with auto-renewal enabled.");
    } catch {
      toast.error("Failed to reactivate subscription");
    }
  };

  const statusBadgeVariant =
    status === "active"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : status === "past_due"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <PageContainer
            title="Subscription"
            description="Manage your subscription preferences, sovereign licenses, and billing settings"
        >
            <div className="space-y-6">
        {/* Card 1: Current Subscription */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--button-blue)]" />
                <CardTitle className="text-lg">Current Subscription</CardTitle>
              </div>
              <Badge className={statusBadgeVariant}>
                {status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Your authoritative subscription details synchronized with billing and invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <Badge className={statusBadgeVariant}>
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
                  {formatMoney(amountCents, currency)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /{isYearly ? "year" : "mo"}
                  </span>
                </p>
              </div>
            </div>

            {/* Projected Next Invoice Snapshot */}
            {nextInvoice && nextInvoice.isApplicable && (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Projected Next Invoice Total
                    </span>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] py-0">
                      Due {nextInvoice.dueDate}
                    </Badge>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {formatMoney(nextInvoice.totalCents, nextInvoice.currency)}
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      ({formatMoney(nextInvoice.subtotalCents, nextInvoice.currency)} subtotal +{" "}
                      {formatMoney(nextInvoice.taxCents, nextInvoice.currency)}{" "}
                      {Math.round(nextInvoice.taxRate * 100)}% VAT)
                    </span>
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

                {/* Linked License Key Banner */}
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
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[11px]">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        {license.remainingDays} days remaining
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
        {/* Card 3: Subscription Settings */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--button-blue)]" />
              <CardTitle className="text-lg">Subscription Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your renewal preferences and automated notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900">Auto Renewal</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically renew your subscription at the end of each billing period
                  </p>
                </div>
                <Switch checked={autoRenew} onCheckedChange={handleToggleAutoRenew} />
              </div>
              <Separator className="my-4" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900">Email Notification</p>
                  <p className="text-xs text-muted-foreground">
                    Receive email updates about your subscription and billing
                  </p>
                </div>
                <Switch
                  checked={emailNotification}
                  onCheckedChange={(val) => {
                    setEmailNotification(val);
                    toast.info(`Email notifications ${val ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
              <Separator className="my-4" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900">Usage Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when you’re approaching your usage limits
                  </p>
                </div>
                <Switch
                  checked={usageAlerts}
                  onCheckedChange={(val) => {
                    setUsageAlerts(val);
                    toast.info(`Usage alerts ${val ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
              <Separator className="my-4" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900">Invoice Reminders</p>
                  <p className="text-xs text-muted-foreground">
                    Receive reminders about upcoming and overdue invoices
                  </p>
                </div>
                <Switch
                  checked={invoiceReminders}
                  onCheckedChange={(val) => {
                    setInvoiceReminders(val);
                    toast.info(`Invoice reminders ${val ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Dynamic Billing Cycle aligned with Plan Pricing */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarFold className="h-5 w-5 text-[var(--button-blue)]" />
              <CardTitle className="text-lg">Billing Cycle</CardTitle>
            </div>
            <CardDescription>
              Change your billing frequency for the {planName} plan. Select an option to switch.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px] py-0">
                    Save 17%
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
          </CardContent>
        </Card>

        {/* Card 5: Subscription Actions */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Actions</CardTitle>
            <CardDescription>
              Manage your plan tier, billing statements, or change subscription status
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
              {status === "cancelled" || status === "expired" ? (
                <Button
                  onClick={() => setIsReactivateDialogOpen(true)}
                  className="w-full bg-emerald-600 text-white text-xs py-2.5 px-4 font-medium hover:bg-emerald-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reactivate Subscription
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="w-full bg-white border-rose-200 text-rose-700 text-xs py-2.5 px-4 font-medium hover:bg-rose-50"
                >
                  Cancel Subscription
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/invoice")}
                className="w-full text-xs py-2.5 px-4 text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                View Invoices
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cancelling your subscription will maintain active access until the end of your current billing period, after which your account downgrades to free tier.
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
              <DialogTitle className="text-base font-bold">Cancel Subscription?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              <p>
                Are you sure you want to cancel your <strong>{planName}</strong> subscription?
              </p>
              <p>
                Your service will remain active until <strong>{nextBillingDate}</strong>. After this date, automatic charges will halt and your workspace will transition to the restricted tier.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(false)}
              className="text-xs"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Confirmation Dialog */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
              <DialogTitle className="text-base font-bold">Reactivate Subscription</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 mt-2">
              Reactivating will re-enable automated billing for your <strong>{planName}</strong> plan at{" "}
              <strong>{formatMoney(amountCents, currency)}/{isYearly ? "year" : "mo"}</strong> and resume full enterprise features.
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
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Reactivate Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
