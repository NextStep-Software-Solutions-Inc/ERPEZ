import React, { useState } from "react";
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
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/services/api";

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoResult {
  referenceCode: string;
  contactName: string;
  organizationName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  message: string;
}

const DEMO_TOPICS = [
  "Planning & Budget Execution (PBMS / WFP / OPCR)",
  "Procurement & Bidding Workflows (PMS / BAC / PO)",
  "Multi-Tenant Isolation & Role-Based Access Control",
  "Self-Hosted / On-Premise Architecture",
];

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (9:00 AM - 12:00 PM)");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Planning & Budget Execution (PBMS / WFP / OPCR)",
    "Procurement & Bidding Workflows (PMS / BAC / PO)",
  ]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
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
        contactName: contactName.trim(),
        email: email.trim(),
        organizationName: organizationName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        preferredDate: preferredDate || undefined,
        preferredTimeSlot,
        topicsOfInterest: selectedTopics,
        notes: notes.trim() || undefined,
      };

      const response = await api.post<{ succeeded: boolean; data: DemoResult; message?: string }>(
        "/inquiries/demo",
        payload
      );

      if (response.data?.succeeded && response.data.data) {
        setResult(response.data.data);
        toast.success(`Demo scheduled! Reference: ${response.data.data.referenceCode}`);
      } else {
        toast.error(response.data?.message || "Failed to schedule demonstration.");
      }
    } catch {
      toast.error("Could not schedule demonstration. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (result?.referenceCode) {
      navigator.clipboard.writeText(result.referenceCode);
      setCopied(true);
      toast.success("Demo reference copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setResult(null);
    setContactName("");
    setEmail("");
    setOrganizationName("");
    setPhoneNumber("");
    setPreferredDate("");
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
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Schedule a Guided Platform Demo
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Live interactive walkthrough of ERP-EZ with our principal solution architects.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="demoName" className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="demoName"
                    placeholder="e.g. Attorney Juan Dela Cruz"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="demoEmail" className="text-xs font-medium text-slate-700">
                    Work Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="demoEmail"
                    type="email"
                    placeholder="e.g. juan@agency.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="demoOrg" className="text-xs font-medium text-slate-700">
                    Organization / Agency <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="demoOrg"
                    placeholder="e.g. Provincial Government of Bukidnon"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="demoPhone" className="text-xs font-medium text-slate-700">
                    Phone / Mobile (Optional)
                  </Label>
                  <Input
                    id="demoPhone"
                    placeholder="e.g. +63 917 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="demoDate" className="text-xs font-medium text-slate-700">
                    Target Date Preference
                  </Label>
                  <Input
                    id="demoDate"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="demoSlot" className="text-xs font-medium text-slate-700">
                    Preferred Time Slot
                  </Label>
                  <select
                    id="demoSlot"
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                    <option value="Flexible / Any available slot">Flexible / Any available slot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">
                  Focus Topics for Demonstration
                </Label>
                <div className="space-y-1.5">
                  {DEMO_TOPICS.map((topic) => {
                    const isChecked = selectedTopics.includes(topic);
                    return (
                      <div
                        key={topic}
                        onClick={() => handleTopicToggle(topic)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-300 text-slate-900 font-medium"
                            : "bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleTopicToggle(topic)}
                          className="size-3.5"
                        />
                        <span>{topic}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="demoNotes" className="text-xs font-medium text-slate-700">
                  Additional Notes or Specific Workflows to Cover (Optional)
                </Label>
                <Input
                  id="demoNotes"
                  placeholder="e.g. Need to review PhilGEPS integration and COA compliance reporting"
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    Confirm Demo Booking
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
                Demonstration Booked Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {result.message}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-500">Booking Code:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {result.referenceCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Contact:</span>
                  <p className="font-semibold text-slate-800">{result.contactName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Organization:</span>
                  <p className="font-semibold text-slate-800">{result.organizationName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Target Date:</span>
                  <p className="font-medium text-slate-700">{result.preferredDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Time Window:</span>
                  <p className="font-medium text-slate-700">{result.preferredTimeSlot}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAndClose}
                className="text-xs h-9 px-6"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
