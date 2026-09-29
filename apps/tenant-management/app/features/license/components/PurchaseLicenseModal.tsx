import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  KeyRound,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Loader2,
  Server,
  CreditCard,
  Building,
} from "lucide-react";
import { useTenant } from "~/providers/TenantProvider";
import { useBillingData } from "~/features/billing/hooks/useBillingData";
import { createMutationHookFromTemplate } from "erpez-shared-lib";
import { purchaseLicenseRequest } from "../handlers/purchaseLicenseRequest";
import type { LicenseKey } from "../type/LicenseKey";
import { toast } from "sonner";

const usePurchaseLicense = createMutationHookFromTemplate(purchaseLicenseRequest);

interface PurchaseLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
  onSuccess?: (license: LicenseKey) => void;
}

export function PurchaseLicenseModal({
  isOpen,
  onClose,
  initialPlan = "Professional",
  onSuccess,
}: PurchaseLicenseModalProps) {
  const { tenant } = useTenant();
  const tenantId = tenant?.id || "00000000-0000-0000-0000-000000000001";
  const defaultHost = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const { data: billingData } = useBillingData();
  const paymentMethods = billingData?.paymentMethods || [];
  const defaultMethod = billingData?.defaultPaymentMethod || paymentMethods[0];

  const [selectedTier, setSelectedTier] = useState<"Starter" | "Professional">(
    initialPlan.toLowerCase().includes("starter") ? "Starter" : "Professional"
  );
  const [domain, setDomain] = useState(defaultHost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState<LicenseKey | null>(null);
  const [copied, setCopied] = useState(false);

  const purchaseMutation = usePurchaseLicense();

  const priceAmount = selectedTier === "Starter" ? 1499 : 4999;
  const taxAmount = Math.round(priceAmount * 0.12 * 100) / 100;
  const totalAmount = priceAmount + taxAmount;

  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error("Please enter a valid target server domain or hostname.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await purchaseMutation.mutateAsync({
        pathParams: {},
        payload: {
          tenantId,
          plan: selectedTier,
          billingCycle: "Yearly",
          isAirGapped: true,
          allowedDomain: domain.trim(),
          paymentMethodId: defaultMethod?.id,
        },
      });

      if (response.data) {
        setPurchasedKey(response.data);
        toast.success(
          `On-Premise ${selectedTier} license purchased successfully! Your cryptographic key is ready.`
        );
        onSuccess?.(response.data);
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (!purchasedKey?.key) return;
    navigator.clipboard.writeText(purchasedKey.key);
    setCopied(true);
    toast.success("License key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLicFile = () => {
    if (!purchasedKey) return;
    const certPayload = {
      product: "ERPez Sovereign On-Premise",
      version: "2.0",
      key: purchasedKey.key,
      prefix: purchasedKey.prefix,
      tenantId: purchasedKey.tenantId,
      boundEmail: purchasedKey.boundEmail,
      plan: purchasedKey.plan,
      allowedDomain: purchasedKey.allowedDomain,
      maxTenants: purchasedKey.maxTenants,
      maxUsers: purchasedKey.maxUsers,
      issuedAt: purchasedKey.issuedAt,
      expiresAt: purchasedKey.expiresAt,
      isAirGapped: true,
      signature: purchasedKey.signature || "HMAC_VERIFIED",
    };

    const blob = new Blob([JSON.stringify(certPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `erpez_${selectedTier.toLowerCase()}_license.lic`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Cryptographic .lic certificate downloaded!");
  };

  const handleClose = () => {
    setPurchasedKey(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        {purchasedKey ? (
          // Post-Purchase Success View
          <div className="space-y-5 py-2">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
                <DialogTitle className="text-xl font-bold text-slate-900">
                  License Purchased Successfully!
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600">
                Your sovereign air-gapped cryptographic license key has been generated and signed.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Plan Tier:</span>
                <Badge className="bg-emerald-600 text-white font-bold">{purchasedKey.plan}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Bound Domain:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {purchasedKey.allowedDomain}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Validity Period:</span>
                <span className="font-semibold text-slate-800">365 Days (1 Year)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                CRYPTOGRAPHIC LICENSE KEY
              </Label>
              <div className="flex gap-2">
                <Input
                  value={purchasedKey.key}
                  readOnly
                  className="font-mono text-xs bg-slate-50 font-semibold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  title="Copy Key"
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={handleDownloadLicFile}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold gap-2"
              >
                <Download className="w-4 h-4" />
                Download .lic File
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Pre-Purchase Checkout Form
          <form onSubmit={handleExecutePurchase} className="space-y-4 py-2">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Buy On-Premise License
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600">
                Self-service purchase for air-gapped sovereign deployment on your local hardware.
              </DialogDescription>
            </DialogHeader>

            {/* Plan Tier Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select License Tier</Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedTier("Starter")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTier === "Starter"
                      ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900">Foundation</p>
                  <p className="text-xs text-slate-500 mt-0.5">AMS + SAMS</p>
                  <p className="font-extrabold text-blue-600 mt-2 text-base">$1,499/yr</p>
                </div>
                <div
                  onClick={() => setSelectedTier("Professional")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTier === "Professional"
                      ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-slate-900">Professional</p>
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] py-0">Popular</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">AMS + SAMS + PMS</p>
                  <p className="font-extrabold text-blue-600 mt-2 text-base">$4,999/yr</p>
                </div>
              </div>
            </div>

            {/* Target Server Host / Domain */}
            <div className="space-y-1.5">
              <Label htmlFor="targetDomain" className="text-xs font-semibold">
                Target Server Domain or IP *
              </Label>
              <Input
                id="targetDomain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. localhost, erp.internal.corp, or *.corp.internal"
                className="font-mono text-xs"
                required
              />
              <p className="text-[11px] text-slate-500">
                The cryptographic HMAC signature will be locked to this host. Wildcards (*.domain.com) supported.
              </p>
            </div>

            {/* Payment Method Preview */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Tenant:</span>
                <span className="font-semibold text-slate-800">{tenant?.name || "Current Tenant"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  {defaultMethod
                    ? `${defaultMethod.brand?.toUpperCase() || "Card"} ending in ${defaultMethod.last4}`
                    : "Default Stored Method"}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-900">Total Billed Today:</span>
                <span className="text-blue-600">${totalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !domain.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Minting License Key...
                  </>
                ) : (
                  `Pay $${totalAmount.toFixed(2)} & Generate Key`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
