import React, { useState } from "react";
import { CheckCircle2, Loader2, Mail, MapPin, Send, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { api } from "~/services/api";
import { ScheduleDemoModal } from "~/components/features/contact/ScheduleDemoModal";

export default function ContactSection() {
    const [email, setEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = email.trim();
        if (!trimmed) {
            toast.error("Please enter your email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            toast.error("Please provide a valid email address.");
            return;
        }

        try {
            setIsSubscribing(true);
            const response = await api.post<{ succeeded: boolean; message?: string }>(
                "/inquiries/subscribe",
                { email: trimmed }
            );

            if (response.data?.succeeded) {
                setIsSubscribed(true);
                toast.success(response.data.message || "Thank you for subscribing to ERP-EZ updates!");
            } else {
                toast.error(response.data?.message || "Failed to register subscription.");
            }
        } catch {
            toast.error("Could not register subscription. Please verify your connection.");
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <section className="py-20 px-6 lg:px-20 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6]" id="contact">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full flex items-center gap-1 font-medium">
                            <Mail className="w-4 h-4" />
                            Stay Updated
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-slate-900">Contact Us</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Join organizations and government agencies across the Philippines using ERP-EZ to streamline their
                        planning, budgeting, and procurement workflows. Get product announcements, security advisories,
                        and compliance bulletins delivered directly to your inbox.
                    </p>

                    {!isSubscribed ? (
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    type="email"
                                    placeholder="Enter your work email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubscribing}
                                    required
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
                                >
                                    {isSubscribing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Subscribing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Subscribe
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                By subscribing, you consent to receive periodic ERP-EZ product releases and regulatory updates.
                            </p>
                        </form>
                    ) : (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-900">
                                    Subscription Active!
                                </p>
                                <p className="text-xs text-emerald-700 mt-0.5">
                                    We've registered <strong>{email}</strong>. You'll receive our next product release notes and regulatory advisories.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white z-1 shadow-lg rounded-xl p-8 border border-slate-200">
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">Get in Touch</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        Ready to see ERP-EZ in action? Our solutions architects are ready to guide your team through a dedicated live walkthrough.
                    </p>
                    <ul className="space-y-5 mb-6">
                        <li className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-1.5 text-sm">Email Us</p>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400 w-16 shrink-0">General:</span>
                                        <a
                                            href="mailto:connect@nextstep-software.com?subject=ERPEZ%20General%20Inquiry"
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors break-all sm:break-normal"
                                        >
                                            connect@nextstep-software.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400 w-16 shrink-0">Sales:</span>
                                        <a
                                            href="mailto:sales@nextstep-software.com?subject=ERPEZ%20Sales%20and%20Procurement%20Inquiry"
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors break-all sm:break-normal"
                                        >
                                            sales@nextstep-software.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-slate-900">Visit Us</p>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-0.5">
                                    Door #5, Cuerquis Apartment, San Miguel Street, Camaman-an, Cagayan de Oro City, Philippines 9000
                                </p>
                            </div>
                        </li>
                    </ul>

                    <Button
                        type="button"
                        onClick={() => setIsDemoModalOpen(true)}
                        className="w-full bg-blue-600 text-white py-3 hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Schedule a Demo →
                    </Button>
                </div>
            </div>

            <ScheduleDemoModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
            />
        </section>
    );
}
