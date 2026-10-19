import { useState } from "react";
import { saasPlans, onPremisePlans, type PlanItem } from "~/data/plans";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ArrowLeft,
  Check,
  Cloud,
  Server,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTenant } from "~/providers/TenantProvider";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { PurchaseLicenseModal } from "~/features/license/components/PurchaseLicenseModal";
import { toast } from "sonner";

export default function PlanPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const {
    data: billingData,
    isLoading: isBillingLoading,
    updateSubscription,
  } = useBillingData();

  // Deployment architecture tab: SaaS vs On-Premise
  const [deploymentType, setDeploymentType] = useState<"saas" | "on-premise">("saas");

  // Current authoritative subscription state
  const sub = tenant?.tenantSubscription || tenant?.tenantSubscriptions?.[0];
  const subscription = billingData?.subscription;
  const currentPlanName = subscription?.planName || sub?.plan || "Enterprise";
  const currentBillingCycle =
    subscription?.billingCycle ||
    (sub?.billingCycle?.toLowerCase().includes("year") ? "yearly" : "monthly");

  // Pricing cycle toggle (defaults to active tenant billing cycle)
  const [isAnnual, setIsAnnual] = useState(currentBillingCycle === "yearly");

  // Modal interaction state
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [isPurchaseLicenseModalOpen, setIsPurchaseLicenseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enterprise consultation form state
  const [enterpriseCompany, setEnterpriseCompany] = useState(tenant?.name || "");
  const [enterpriseEmail, setEnterpriseEmail] = useState(
    tenant?.tenantSetting?.billingContactEmail || ""
  );
  const [enterpriseTeamSize, setEnterpriseTeamSize] = useState("100+");
  const [enterpriseNote, setEnterpriseNote] = useState("");

  const activePlans = deploymentType === "saas" ? saasPlans : onPremisePlans;

  const isCustom = (val?: string) => {
    if (!val) return false;
    return /custom|contact/i.test(val);
  };

  // Check whether a plan card corresponds to the tenant's current active subscription
  const isCurrentPlan = (plan: PlanItem): boolean => {
    if (deploymentType === "on-premise") return false;
    const cur = currentPlanName.toLowerCase();
    const target = plan.name.toLowerCase();

    if (cur.includes("enterprise") && target.includes("enterprise")) return true;
    if (
      (cur.includes("pro") || cur.includes("prof")) &&
      (target.includes("pro") || target.includes("prof"))
    ) {
      return true;
    }
    if (cur.includes("starter") && target.includes("starter")) return true;
    return cur === target;
  };

  // Determine tier rank for upgrade vs downgrade styling
  const getPlanTier = (name: string): number => {
    const n = name.toLowerCase();
    if (n.includes("starter")) return 1;
    if (n.includes("pro")) return 2;
    if (n.includes("enterprise")) return 3;
    return 2;
  };

  const currentTier = getPlanTier(currentPlanName);

  // Handle plan selection click
  const handleSelectPlan = (plan: PlanItem) => {
    if (isCurrentPlan(plan)) {
      toast.info(`Your tenant is currently subscribed to the ${plan.name} plan.`);
      return;
    }

    if (plan.deployment === "on-premise") {
      if (isCustom(plan.price)) {
        setIsEnterpriseModalOpen(true);
      } else {
        setSelectedPlan(plan);
        setIsPurchaseLicenseModalOpen(true);
      }
      return;
    }

    if (isCustom(plan.price)) {
      setSelectedPlan(plan);
      setIsEnterpriseModalOpen(true);
      return;
    }

    setSelectedPlan(plan);
    setIsConfirmModalOpen(true);
  };

  // Calculate pricing breakdown for confirmation dialog
  const calculatePlanTotals = (plan: PlanItem | null) => {
    if (!plan) return { base: 0, tax: 0, total: 0, baseCents: 0 };
    const baseCents = isAnnual
      ? plan.annualAmountCents || (plan.monthlyAmountCents ? plan.monthlyAmountCents * 10 : 299000)
      : plan.monthlyAmountCents || 29900;
    const taxCents = Math.round(baseCents * 0.12);
    const totalCents = baseCents + taxCents;

    return {
      base: baseCents / 100,
      tax: taxCents / 100,
      total: totalCents / 100,
      baseCents,
    };
  };

  // Perform subscription upgrade / downgrade
  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      const { baseCents } = calculatePlanTotals(selectedPlan);
      const cycle = isAnnual ? "yearly" : "monthly";

      await updateSubscription({
        planName: selectedPlan.name,
        amountCents: baseCents,
        billingCycle: cycle,
        status: "active",
        autoRenew: true,
      });

      toast.success(
        `Subscription successfully changed to ${selectedPlan.name} (${
          isAnnual ? "Annual" : "Monthly"
        })!`
      );
      setIsConfirmModalOpen(false);
      navigate("/billing");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct switch or inquiry for Enterprise
  const handleActivateEnterpriseDirectly = async () => {
    setIsSubmitting(true);
    try {
      const cycle = isAnnual ? "yearly" : "monthly";
      const baseCents = isAnnual ? 499000 : 49900;

      await updateSubscription({
        planName: "SaaS Enterprise",
        amountCents: baseCents,
        billingCycle: cycle,
        status: "active",
        autoRenew: true,
      });

      toast.success("Welcome to SaaS Enterprise! Cloud isolation and dedicated quota activated.");
      setIsEnterpriseModalOpen(false);
      navigate("/billing");
    } catch (err) {
      toast.error("Failed to activate Enterprise plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterpriseConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "Enterprise inquiry submitted! An ERPez Solutions Specialist will contact you within 24 hours."
    );
    setIsEnterpriseModalOpen(false);
  };

  const confirmTotals = calculatePlanTotals(selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-10 px-6 sm:px-12 lg:px-20 pb-20">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/image/Logo1.png" alt="ERPEZ Logo" className="h-8 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-l border-slate-300 pl-3">
            Tenant Subscription
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </button>
      </div>

      {/* Header Section */}
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <Badge
          variant="outline"
          className="mb-3 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200 rounded-full"
        >
          Active Tenant: {tenant?.name || "Dev Sandbox"} • Current Plan: {currentPlanName}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-[42px] leading-tight font-bold text-slate-950 tracking-tight">
          Select Your ERPez Plan
        </h1>
        <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Scale your business seamlessly. Switch plans at any time with automatic proration and instant feature provisioning.
        </p>

        {/* Deployment Architecture Switcher */}
        <div className="mt-8 inline-flex p-1.5 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
          <button
            onClick={() => setDeploymentType("saas")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              deploymentType === "saas"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cloud className="w-4 h-4" />
            Cloud SaaS (Datacenter)
          </button>
          <button
            onClick={() => setDeploymentType("on-premise")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              deploymentType === "on-premise"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Server className="w-4 h-4" />
            Air-Gapped On-Premise
          </button>
        </div>

        {/* SaaS Monthly vs Annual Toggle */}
        {deploymentType === "saas" && (
          <div className="pt-6 flex items-center justify-center gap-3">
            <span
              onClick={() => setIsAnnual(false)}
              className={`text-sm cursor-pointer transition ${
                !isAnnual ? "font-bold text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly Billing
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={(v) => setIsAnnual(Boolean(v))}
              aria-label="Toggle billing frequency"
            />
            <div
              onClick={() => setIsAnnual(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className={`text-sm transition ${
                  isAnnual ? "font-bold text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Annual Billing
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                Save up to 20%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
        {activePlans.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const planTier = getPlanTier(plan.name);
          const isHigher = planTier > currentTier;
          const isLower = planTier < currentTier;

          return (
            <div
              key={plan.name}
              onClick={() => handleSelectPlan(plan)}
              className={`group relative flex flex-col justify-between rounded-2xl bg-white p-7 transition-all duration-300 ease-out cursor-pointer select-none border ${
                isCurrent
                  ? "border-2 border-emerald-500 shadow-lg ring-4 ring-emerald-500/10 bg-emerald-50/10"
                  : plan.popular
                  ? "border-2 border-blue-500 shadow-md hover:shadow-2xl hover:border-blue-600 hover:-translate-y-2"
                  : "border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2"
              }`}
            >
              {/* Badges on Top */}
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-1 font-bold rounded-full shadow-md flex items-center gap-1.5 z-10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Current Active Plan
                </div>
              )}

              {!isCurrent && plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-4 py-1 font-bold rounded-full shadow-md flex items-center gap-1.5 z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              {!isCurrent && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3.5 py-1 font-bold rounded-full shadow-md z-10">
                  {plan.badge}
                </div>
              )}

              {/* Card Header & Pricing */}
              <div>
                <div className="text-center pt-2">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="flex items-baseline justify-center gap-2 mt-5 mb-2">
                    {deploymentType === "saas" && isAnnual ? (
                      plan.annualPrice ? (
                        <>
                          {!isCustom(plan.price) && (
                            <span className="text-sm text-slate-400 line-through">
                              {plan.price}
                            </span>
                          )}
                          <span className="text-4xl font-extrabold text-slate-950">
                            {plan.annualPrice}
                          </span>
                          {!isCustom(plan.annualPrice) && (
                            <span className="text-xs font-medium text-slate-500">/year</span>
                          )}
                        </>
                      ) : (
                        <span className="text-4xl font-extrabold text-slate-950">{plan.price}</span>
                      )
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-slate-950">{plan.price}</span>
                        {!isCustom(plan.price) && (
                          <span className="text-xs font-medium text-slate-500">
                            /{deploymentType === "on-premise" ? "year" : "month"}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {deploymentType === "saas" && isAnnual && plan.annualPriceSave && (
                    <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save {plan.annualPriceSave} annually
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <div className="mt-0.5 rounded-full bg-emerald-100 p-0.5 shrink-0">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full h-11 border-emerald-500 text-emerald-700 bg-emerald-50/50 font-semibold cursor-default"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Current Plan
                  </Button>
                ) : isCustom(plan.price) ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition group-hover:shadow-md"
                  >
                    Contact Enterprise Sales
                  </Button>
                ) : isHigher ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md group-hover:shadow-lg"
                  >
                    Upgrade to {plan.name}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : isLower ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    variant="outline"
                    className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
                  >
                    Downgrade to {plan.name}
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    className={`w-full h-11 font-semibold transition ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    Switch to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Switch Confirmation Dialog */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Confirm Plan Switch
            </DialogTitle>
            <DialogDescription>
              Review your updated plan configuration and recurring billing amount.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              {/* Plan Transition Preview */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Current Plan</span>
                  <span className="text-sm font-semibold text-slate-800">{currentPlanName}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <div className="text-right">
                  <span className="text-xs text-blue-600 font-medium block">New Plan</span>
                  <span className="text-sm font-bold text-blue-700">{selectedPlan.name}</span>
                </div>
              </div>

              {/* Billing Details Summary */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Cycle:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {isAnnual ? "Annual (Save up to 20%)" : "Monthly"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Subscription:</span>
                  <span className="font-semibold text-slate-800">
                    ${confirmTotals.base.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicable Tax (12% VAT):</span>
                  <span className="font-semibold text-slate-800">
                    ${confirmTotals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-950">
                  <span>Estimated Total:</span>
                  <span className="text-blue-600">${confirmTotals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Payment Timing:</span>
                  <Badge variant="outline" className="text-slate-700 bg-slate-50 font-medium text-[11px]">
                    {selectedPlan && getPlanTier(selectedPlan.name) < currentTier
                      ? "Next Billing Date (No charge today)"
                      : "Next Billing Date"}
                  </Badge>
                </div>
              </div>

              {/* Explanatory Callout Box */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                {selectedPlan && getPlanTier(selectedPlan.name) < currentTier ? (
                  <span>
                    <strong>Downgrade Terms:</strong> You will <strong>not</strong> be billed immediately. Because you have already paid for your current cycle, this new rate of <strong>${confirmTotals.total.toFixed(2)}</strong> will take effect on your next scheduled invoice.
                  </span>
                ) : (
                  <span>
                    <strong>Upgrade Terms:</strong> Your new tier features will activate immediately upon confirmation. Your next statement will reflect the updated subscription rate of <strong>${confirmTotals.total.toFixed(2)}</strong>.
                  </span>
                )}
              </div>

              {subscription?.status === "cancelled" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Reactivating Subscription:</strong> Switching to the{" "}
                    <strong>{selectedPlan.name}</strong> plan will reactivate your subscription and
                    restore automated recurring billing.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleConfirmPlanChange}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying Plan...
                </>
              ) : (
                "Confirm & Switch Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SaaS Enterprise / Sales Contact Modal */}
      <Dialog open={isEnterpriseModalOpen} onOpenChange={setIsEnterpriseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              ERPez Enterprise Solutions
            </DialogTitle>
            <DialogDescription>
              Tailored high-performance cloud architecture and dedicated service level agreements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnterpriseConsultationSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold">
                  Company / Organization
                </Label>
                <Input
                  id="companyName"
                  value={enterpriseCompany}
                  onChange={(e) => setEnterpriseCompany(e.target.value)}
                  placeholder="ACME Corp"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="teamSize" className="text-xs font-semibold">
                  Estimated Users
                </Label>
                <Input
                  id="teamSize"
                  value={enterpriseTeamSize}
                  onChange={(e) => setEnterpriseTeamSize(e.target.value)}
                  placeholder="50 - 500+"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs font-semibold">
                Billing / Admin Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={enterpriseEmail}
                onChange={(e) => setEnterpriseEmail(e.target.value)}
                placeholder="admin@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Deployment Requirements & Special Notes
              </Label>
              <Input
                id="notes"
                value={enterpriseNote}
                onChange={(e) => setEnterpriseNote(e.target.value)}
                placeholder="e.g., AI copilot integration, multi-subsidiary isolation, SLA guarantees"
              />
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
              <strong>Instant Activation:</strong> If you prefer to immediately activate the
              Enterprise cloud tier ($499.00/mo) for this sandbox tenant, you can switch right now.
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleActivateEnterpriseDirectly}
                disabled={isSubmitting}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Activate Enterprise Tier Now"
                )}
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                Submit Consultation Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* On-Premise Self-Service License Purchase Modal */}
      <PurchaseLicenseModal
        isOpen={isPurchaseLicenseModalOpen}
        onClose={() => setIsPurchaseLicenseModalOpen(false)}
        initialPlan={
          selectedPlan?.tier ||
          (selectedPlan?.name?.toLowerCase().includes("foundation") ? "Starter" : "Professional")
        }
        onSuccess={() => {
          setIsPurchaseLicenseModalOpen(false);
          navigate("/license-management");
        }}
      />
    </div>
  );
}