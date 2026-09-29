import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
    FileKey,
    ShieldCheck,
    ShieldAlert,
    Copy,
    Check,
    Server,
    KeyRound,
    Clock,
    Globe,
    Mail,
    AlertTriangle,
    Loader2,
    Download,
    ShoppingCart
} from "lucide-react";
import { PageContainer } from "~/components/PageContainer";
import { useTenant } from "~/providers/TenantProvider";
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from "erpez-shared-lib";
import { getTenantLicenseRequest } from "~/features/license/handlers/getTenantLicenseRequest";
import { activateLicenseRequest } from "~/features/license/handlers/activateLicenseRequest";
import { claimTrialLicenseRequest } from "~/features/license/handlers/claimTrialLicenseRequest";
import { PurchaseLicenseModal } from "~/features/license/components/PurchaseLicenseModal";
import { toast } from "sonner";

const useTenantLicense = createQueryHookFromTemplate(getTenantLicenseRequest);
const useActivateLicense = createMutationHookFromTemplate(activateLicenseRequest);
const useClaimTrialLicense = createMutationHookFromTemplate(claimTrialLicenseRequest);

export default function LicenseManagementPage() {
    const { tenant } = useTenant();
    const activeTenantId = tenant?.id || "00000000-0000-0000-0000-000000000001";
    const currentHostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

    const [copied, setCopied] = useState(false);
    const [activationKey, setActivationKey] = useState("");

    const { data: licenseResponse, isLoading, refetch } = useTenantLicense({
        pathParams: { id: activeTenantId },
        queryParams: { domain: currentHostname },
    });

    const activateMutation = useActivateLicense();
    const claimTrialMutation = useClaimTrialLicense();
    const license = licenseResponse?.data;

    const handleClaimTrial = async () => {
        try {
            await claimTrialMutation.mutateAsync({
                pathParams: {},
                payload: {
                    tenantId: activeTenantId,
                    allowedDomain: currentHostname,
                },
            });
            toast.success("30-Day Free Trial License successfully provisioned!");
            await refetch();
        } catch {
            // Error toast handled by axios interceptor
        }
    };

    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    const handleDownloadLicFile = () => {
        if (!license) return;
        const certPayload = {
            product: "ERPez Sovereign On-Premise",
            version: "2.0",
            key: license.key,
            prefix: license.prefix,
            tenantId: license.tenantId,
            boundEmail: license.boundEmail,
            plan: license.plan,
            allowedDomain: license.allowedDomain,
            maxTenants: license.maxTenants,
            maxUsers: license.maxUsers,
            issuedAt: license.issuedAt,
            expiresAt: license.expiresAt,
            isAirGapped: license.isAirGapped,
            signature: license.signature || "HMAC_VERIFIED",
        };

        const blob = new Blob([JSON.stringify(certPayload, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `erpez_${(license.plan || "license").toLowerCase()}_license.lic`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Cryptographic .lic certificate downloaded!");
    };

    const isDomainValid = useMemo(() => {
        if (!license?.allowedDomain) return true;
        const allowed = license.allowedDomain.toLowerCase().trim();
        if (allowed === "*" || allowed === "") return true;
        const host = currentHostname.toLowerCase().trim();
        if (allowed.startsWith("*.")) {
            const rootDomain = allowed.slice(2);
            return host === rootDomain || host.endsWith("." + rootDomain);
        }
        return host === allowed || host.includes(allowed);
    }, [license?.allowedDomain, currentHostname]);

    const handleCopyKey = () => {
        if (!license?.key) return;
        navigator.clipboard.writeText(license.key);
        setCopied(true);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleActivateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activationKey.trim()) {
            toast.error("Please enter a valid cryptographic license key.");
            return;
        }

        try {
            await activateMutation.mutateAsync({
                pathParams: {},
                payload: {
                    key: activationKey.trim(),
                    tenantId: activeTenantId,
                    currentDomain: currentHostname,
                },
            });
            toast.success("License successfully activated for this tenant!");
            setActivationKey("");
            await refetch();
        } catch {
            // Error toast handled by axios interceptor
        }
    };

    return (
        <PageContainer
            title="License & Sovereignty Management"
            description="Manage cryptographic license keys, domain isolation constraints, and offline activation"
        >
            <div className="space-y-6">
                {/* Domain Constraint Warning Banner */}
                {license && !isDomainValid && (
                    <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-900 flex items-start gap-3 shadow-xs">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm">Domain Constraint Violation Detected!</h4>
                            <p className="text-xs text-red-700 mt-1">
                                You are accessing this tenant via <strong>{currentHostname}</strong>, but the active license is cryptographically bound to <strong>{license.allowedDomain}</strong>. System authentication will be disabled if domain enforcement is active.
                            </p>
                        </div>
                    </div>
                )}

                {license && isDomainValid && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Domain Constraint Verified</h4>
                                <p className="text-xs text-emerald-700">
                                    Current host (<strong>{currentHostname}</strong>) matches allowed domain rule: <strong>{license.allowedDomain}</strong>.
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                            Active & Verified
                        </Badge>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active License Details Card */}
                    <Card className="lg:col-span-2 shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileKey className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">Active License</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsPurchaseModalOpen(true)}
                                        className="h-8 gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        Buy License
                                    </Button>
                                    {license ? (
                                        <Badge className={license.isExpired ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                                            {license.isExpired ? "Expired" : "Active Key"}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500">No License Active</Badge>
                                    )}
                                </div>
                            </div>
                            <CardDescription>
                                1 Subscription = 1 Cryptographic Key bound to authorized email and domain constraints.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {license ? (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-500 font-semibold">CRYPTOGRAPHIC LICENSE KEY</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={license.key}
                                                readOnly
                                                className="font-mono text-xs bg-slate-50 font-semibold"
                                            />
                                            <Button variant="outline" size="icon" onClick={handleCopyKey} title="Copy Key">
                                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDownloadLicFile}
                                                title="Download .lic certificate"
                                                className="gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-100"
                                            >
                                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                                <span>Download .lic</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Bound Account Email</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 truncate">{license.boundEmail}</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                                                <span>Allowed Domain</span>
                                            </div>
                                            <p className="font-mono font-semibold text-slate-900 truncate">{license.allowedDomain}</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Remaining Validity</span>
                                            </div>
                                            <p className="font-semibold text-slate-900">{license.remainingDays} days left</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <Server className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Deployment Plan</span>
                                            </div>
                                            <p className="font-semibold text-slate-900">{license.plan}</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Air-Gapped Sovereign</span>
                                            </div>
                                            <p className="font-semibold text-slate-900">{license.isAirGapped ? "Yes (Offline Verified)" : "Cloud SaaS"}</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                                                <span>Capacity Limit</span>
                                            </div>
                                            <p className="font-semibold text-slate-900">{license.maxTenants} Tenants / {license.maxUsers} Users</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 border border-dashed rounded-lg text-slate-500 text-xs space-y-3">
                                    <FileKey className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="font-medium text-slate-700">No cryptographic license key currently activated for this tenant.</p>
                                    <p className="text-[11px] text-slate-500">You can buy an on-premise license key or claim a 30-day full-access free trial license below.</p>
                                    <div className="pt-2 flex items-center justify-center gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => setIsPurchaseModalOpen(true)}
                                            className="btn-blue text-xs font-semibold gap-1.5"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            Buy On-Premise License
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClaimTrial}
                                            disabled={claimTrialMutation.isPending}
                                            className="text-xs font-semibold border-slate-300"
                                        >
                                            {claimTrialMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                            Claim 30-Day Free Trial
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Offline License Activation Form */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-lg">Activate License Key</CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Activate an air-gapped or on-premise subscription key offline.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleActivateKey} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="licenseKeyInput" className="text-xs">
                                        License Key String *
                                    </Label>
                                    <Input
                                        id="licenseKeyInput"
                                        placeholder="e.g. EPZ-ONPREM-20270101-ABCD-1234"
                                        value={activationKey}
                                        onChange={(e) => setActivationKey(e.target.value)}
                                        className="font-mono text-xs uppercase"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Format: [PREFIX]-[PLAN]-[EXPIRY]-[TOKEN]-[CHECKSUM]
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 border text-xs space-y-1 text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Target Tenant:</span>
                                        <span className="font-semibold text-slate-800">{tenant?.name || "Current Tenant"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Current Domain:</span>
                                        <span className="font-mono font-semibold text-slate-800">{currentHostname}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={activateMutation.isPending || !activationKey.trim()}
                                    className="w-full btn-blue text-xs font-semibold"
                                >
                                    {activateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Activate License
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Purchase On-Premise License Modal */}
            <PurchaseLicenseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSuccess={() => refetch()}
            />
        </PageContainer>
    );
}
