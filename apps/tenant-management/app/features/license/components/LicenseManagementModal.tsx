import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { KeyRound, ShieldCheck, Copy, Check, Loader2 } from "lucide-react";
import { createMutationHookFromTemplate } from "erpez-shared-lib";
import { generateLicenseRequest } from "../handlers/generateLicenseRequest";
import { type LicenseKey } from "../type/LicenseKey";
import { toast } from "sonner";
import { planLabel } from "~/lib/tenant";

const useGenerateLicense = createMutationHookFromTemplate(generateLicenseRequest);

interface LicenseManagementModalProps {
    tenantId?: string;
    tenantName?: string;
    onSuccess?: (license: LicenseKey) => void;
    triggerButton?: React.ReactNode;
}

export function LicenseManagementModal({
    tenantId,
    tenantName,
    onSuccess,
    triggerButton,
}: LicenseManagementModalProps) {
    const [open, setOpen] = useState(false);
    const [prefix, setPrefix] = useState("EPZ");
    const [boundEmail, setBoundEmail] = useState("");
    const [plan, setPlan] = useState<number>(4); // 4 = OnPremise
    const [allowedDomain, setAllowedDomain] = useState("localhost");
    const [maxTenants, setMaxTenants] = useState<number>(5);
    const [maxUsers, setMaxUsers] = useState<number>(50);
    const [expirationMonths, setExpirationMonths] = useState<number>(12);
    const [isAirGapped, setIsAirGapped] = useState<boolean>(true);
    const [notes, setNotes] = useState("");

    const [generatedKey, setGeneratedKey] = useState<LicenseKey | null>(null);
    const [copied, setCopied] = useState(false);

    const generateMutation = useGenerateLicense();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boundEmail.trim()) {
            toast.error("Account bound email is required.");
            return;
        }

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expirationMonths);

        try {
            const response = await generateMutation.mutateAsync({
                pathParams: {},
                payload: {
                    prefix: prefix.trim().toUpperCase() || "EPZ",
                    boundEmail: boundEmail.trim().toLowerCase(),
                    plan,
                    allowedDomain: allowedDomain.trim().toLowerCase() || "*",
                    maxTenants: Number(maxTenants) || 1,
                    maxUsers: Number(maxUsers) || 10,
                    expiresAt: expiryDate.toISOString(),
                    isAirGapped,
                    tenantId: tenantId || undefined,
                    notes: notes.trim() || undefined,
                },
            });

            if (response.data) {
                setGeneratedKey(response.data);
                toast.success("License key generated successfully!");
                onSuccess?.(response.data);
            }
        } catch (err: any) {
            // Error toast handled by axios interceptor
        }
    };

    const handleCopyKey = () => {
        if (!generatedKey?.key) return;
        navigator.clipboard.writeText(generatedKey.key);
        setCopied(true);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setGeneratedKey(null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setGeneratedKey(null);
        }}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button className="btn-blue flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Generate License Key
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue-600" />
                        Issue Sovereign License Key
                    </DialogTitle>
                    <DialogDescription>
                        {tenantName
                            ? `Generate an offline cryptographic license key bound to ${tenantName}.`
                            : "Issue a standalone air-gapped or on-premise subscription key."}
                    </DialogDescription>
                </DialogHeader>

                {generatedKey ? (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
                            <div className="flex items-center gap-2 font-semibold text-sm">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                Cryptographic License Key Generated
                            </div>
                            <div className="mt-3 flex items-center justify-between bg-white border border-emerald-300 rounded p-2.5 font-mono text-xs break-all">
                                <span>{generatedKey.key}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 shrink-0 ml-2"
                                    onClick={handleCopyKey}
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded border">
                            <p><strong className="text-slate-800">Bound Email:</strong> {generatedKey.boundEmail}</p>
                            <p><strong className="text-slate-800">Allowed Domain:</strong> {generatedKey.allowedDomain}</p>
                            <p><strong className="text-slate-800">Plan:</strong> {planLabel(generatedKey.plan)}</p>
                            <p><strong className="text-slate-800">Max Local Tenants:</strong> {generatedKey.maxTenants}</p>
                            <p><strong className="text-slate-800">Expires:</strong> {new Date(generatedKey.expiresAt).toLocaleDateString()} ({generatedKey.remainingDays} days)</p>
                            <p><strong className="text-slate-800">Air-Gapped:</strong> {generatedKey.isAirGapped ? "Yes (Offline validation)" : "No"}</p>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleReset} className="w-full btn-blue">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate}>
                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="prefix">Key Prefix</Label>
                                    <Input
                                        id="prefix"
                                        placeholder="e.g. EPZ, ACME"
                                        maxLength={10}
                                        value={prefix}
                                        onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                    />
                                    <p className="text-[11px] text-slate-400">Custom prefix for key</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="plan">Target Plan</Label>
                                    <Select value={String(plan)} onValueChange={(val) => setPlan(Number(val))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="4">On-Premise Sovereign</SelectItem>
                                            <SelectItem value="3">Enterprise</SelectItem>
                                            <SelectItem value="2">Professional</SelectItem>
                                            <SelectItem value="1">Starter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="boundEmail">Bound Admin Email *</Label>
                                <Input
                                    id="boundEmail"
                                    type="email"
                                    required
                                    placeholder="admin@customer-domain.com"
                                    value={boundEmail}
                                    onChange={(e) => setBoundEmail(e.target.value)}
                                />
                                <p className="text-[11px] text-slate-400">Key is cryptographically locked to this email address</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="allowedDomain">Allowed Domain Constraint *</Label>
                                <Input
                                    id="allowedDomain"
                                    required
                                    placeholder="e.g. erp.internal, localhost, *.domain.com"
                                    value={allowedDomain}
                                    onChange={(e) => setAllowedDomain(e.target.value)}
                                />
                                <p className="text-[11px] text-slate-400">If accessed via any other domain, login will be disabled</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="maxTenants">Max Tenants</Label>
                                    <Input
                                        id="maxTenants"
                                        type="number"
                                        min={1}
                                        value={maxTenants}
                                        onChange={(e) => setMaxTenants(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="maxUsers">Max Users</Label>
                                    <Input
                                        id="maxUsers"
                                        type="number"
                                        min={1}
                                        value={maxUsers}
                                        onChange={(e) => setMaxUsers(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="validity">Duration</Label>
                                    <Select value={String(expirationMonths)} onValueChange={(v) => setExpirationMonths(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Months</SelectItem>
                                            <SelectItem value="6">6 Months</SelectItem>
                                            <SelectItem value="12">1 Year</SelectItem>
                                            <SelectItem value="24">2 Years</SelectItem>
                                            <SelectItem value="36">3 Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                                <div>
                                    <Label className="text-sm font-semibold text-slate-800">Air-Gapped Sovereign Mode</Label>
                                    <p className="text-xs text-slate-500">Allow offline cryptographic activation with zero cloud dependency</p>
                                </div>
                                <Switch
                                    checked={isAirGapped}
                                    onCheckedChange={setIsAirGapped}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="notes">Issuance Notes</Label>
                                <Input
                                    id="notes"
                                    placeholder="Deployment ticket, cluster ID, or organization notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={generateMutation.isPending} className="btn-blue">
                                {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate License Key
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
