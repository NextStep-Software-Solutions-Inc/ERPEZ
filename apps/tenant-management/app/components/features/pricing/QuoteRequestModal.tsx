import React, { useState, useEffect } from "react";
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
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Copy,
  FileText,
  Loader2,
  Mail,
  Server,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import { api } from "~/services/api";
import type { PlanItem } from "~/data/plans";

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanItem | null;
  deploymentType: "saas" | "on-premise";
}

interface QuoteResult {
  referenceCode: string;
  planName: string;
  tier: string;
  deploymentType: string;
  estimatedDelivery: string;
  scopeSummary: string;
  includedModules: string[];
  message: string;
}

const AVAILABLE_MODULES = [
  { id: "ams", name: "AMS (Account Management)", desc: "Identity, audit logs, and organization hierarchies", defaultChecked: true },
  { id: "pbms", name: "PBMS (Planning & Budget)", desc: "Budget calls, WFP, OPCR, and line item ceilings", defaultChecked: true },
  { id: "pms", name: "PMS (Procurement Management)", desc: "Purchase requests, BAC bidding, and purchase orders", defaultChecked: true },
];

export function QuoteRequestModal({
  isOpen,
  onClose,
  plan,
  deploymentType,
}: QuoteRequestModalProps) {
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [teamSize, setTeamSize] = useState("16-50");
  const [selectedModules, setSelectedModules] = useState<string[]>(["ams", "pbms", "pms"]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize selected modules based on the plan tier
  useEffect(() => {
    if (plan) {
      const tier = plan.tier || "Starter";
      if (tier === "Starter") {
        setSelectedModules(["ams", "pbms"]);
      } else {
        setSelectedModules(["ams", "pbms", "pms"]);
      }
    }
  }, [plan]);

  const handleModuleToggle = (moduleId: string) => {
    if (moduleId === "ams") return; // AMS is foundational and required
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactName.trim() || !organizationName.trim() || !email.trim()) {
      toast.error("Please fill in your name, organization, and work email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please provide a valid work email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        planName: plan?.name || "Professional",
        tier: plan?.tier || "Professional",
        deploymentType,
        contactName: contactName.trim(),
        email: email.trim(),
        organizationName: organizationName.trim(),
        teamSize,
        requestedModules: selectedModules,
        notes: notes.trim() || undefined,
      };

      const response = await api.post<{ succeeded: boolean; data: QuoteResult; message?: string }>(
        "/inquiries/quote",
        payload
      );

      if (response.data?.succeeded && response.data.data) {
        setResult(response.data.data);
        toast.success(`Quote request submitted! Reference: ${response.data.data.referenceCode}`);
      } else {
        toast.error(response.data?.message || "Failed to submit quote request.");
      }
    } catch {
      toast.error("Could not submit quote request. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (result?.referenceCode) {
      navigator.clipboard.writeText(result.referenceCode);
      setCopied(true);
      toast.success("Quote reference copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setResult(null);
    setContactName("");
    setEmail("");
    setOrganizationName("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {!result ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="space-y-2 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Request a Customized Scope Quote
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Tailored commercial terms and deployment architecture for your agency or enterprise.
                  </DialogDescription>
                </div>
              </div>

              {plan && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{plan.name}</p>
                    <p className="text-[11px] text-slate-500">{plan.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white text-blue-700 border-blue-200 flex items-center gap-1 font-semibold">
                    {deploymentType === "saas" ? <Cloud className="w-3 h-3" /> : <Server className="w-3 h-3" />}
                    {deploymentType === "saas" ? "Cloud SaaS" : "Air-Gapped"}
                  </Badge>
                </div>
              )}
            </DialogHeader>

            <div className="space-y-4 py-3 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contactName" className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="e.g. Maria Santos"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Work Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. maria@agency.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="organizationName" className="text-xs font-medium text-slate-700">
                    Organization / Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    placeholder="e.g. Department of Energy"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="teamSize" className="text-xs font-medium text-slate-700">
                    Estimated User Count
                  </Label>
                  <select
                    id="teamSize"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-15">1 – 15 Users (Team Scope)</option>
                    <option value="16-50">16 – 50 Users (Department Scope)</option>
                    <option value="51-150">51 – 150 Users (Institutional Scope)</option>
                    <option value="150+">150+ Users (Enterprise Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">
                  Required System Modules
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = selectedModules.includes(mod.id);
                    const isMandatory = mod.id === "ams";
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleModuleToggle(mod.id)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50/70 border-blue-300"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isChecked}
                            disabled={isMandatory}
                            onCheckedChange={() => handleModuleToggle(mod.id)}
                            className="size-3.5"
                          />
                          <span className="text-xs font-bold text-slate-900">{mod.id.toUpperCase()}</span>
                          {isMandatory && (
                            <span className="text-[10px] text-slate-500 font-normal">(Core)</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{mod.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-medium text-slate-700">
                  Special Requirements or RFP Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Specific fiscal year kickoff, sovereign air-gapped infrastructure, or custom roles"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting Quote...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Scope Quote
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 text-center space-y-5">
            <div className="size-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Scope Quote Request Received!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {result.message}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-500">Quote Reference:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {result.referenceCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                    title="Copy Reference"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Selected Plan:</span>
                  <p className="font-semibold text-slate-800">{result.planName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Deployment:</span>
                  <p className="font-semibold text-slate-800">{result.deploymentType}</p>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-slate-500 text-[11px]">Delivery Expectation:</span>
                <p className="font-medium text-slate-700">{result.estimatedDelivery}</p>
              </div>

              <div className="text-xs pt-1">
                <span className="text-slate-500 text-[11px]">Scope Summary:</span>
                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200 mt-0.5">
                  {result.scopeSummary}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link to="/sign-up" className="w-full sm:w-auto">
                <Button className="w-full bg-[#10B981] hover:bg-[#0a5139] text-white text-xs font-semibold gap-1.5 h-9">
                  <Sparkles className="w-3.5 h-3.5" />
                  Start 30-Day Free Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
