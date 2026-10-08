import { useState } from "react";
import { saasPlans, onPremisePlans, type PlanItem } from "~/data/plans";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Check, Cloud, Server, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch"; 
import { NavLink } from "react-router";
import { QuoteRequestModal } from "~/components/features/pricing/QuoteRequestModal";

export default function PlanSection() {
    const [deploymentType, setDeploymentType] = useState<"saas" | "on-premise">("saas");
    const [isAnnual, setIsAnnual] = useState(false);

    const [selectedQuotePlan, setSelectedQuotePlan] = useState<PlanItem | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const activePlans = deploymentType === "saas" ? saasPlans : onPremisePlans;

    const handleOpenQuoteModal = (plan: PlanItem) => {
        setSelectedQuotePlan(plan);
        setIsQuoteModalOpen(true);
    };

    return (
        <section className="py-16 mb-12 px-6 sm:px-14 lg:px-24" id="pricing">
            <div className="text-center mb-12 max-w-6xl mx-auto">
                <h2 className="max-w-[1190px] mx-auto text-[36px] sm:text-[42px] leading-[50px] sm:leading-[70px] font-bold text-slate-900 text-center">
                    Flexible Deployment Architectures
                </h2>
                <p className="max-w-3xl mx-auto text-slate-600 mt-4 text-base sm:text-lg leading-6 font-normal text-center">
                    Choose between our turnkey Cloud SaaS hosted in ERPez Datacenters or our Sovereign Air-Gapped On-Premise deployment bundles.
                </p>

                {/* Deployment Architecture Switcher */}
                <div className="mt-8 inline-flex p-1.5 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setDeploymentType("saas")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
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
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            deploymentType === "on-premise"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Server className="w-4 h-4" />
                        Air-Gapped On-Premise
                    </button>
                </div>

                {/* Architecture Subtitle / Context */}
                <div className="mt-4 max-w-2xl mx-auto">
                    {deploymentType === "saas" ? (
                        <p className="text-xs sm:text-sm text-slate-500">
                            Cloud SaaS is hosted in our high-availability ERPez Datacenter. Includes managed backups, automatic updates, and immediate provisioning.
                        </p>
                    ) : (
                        <p className="text-xs sm:text-sm text-slate-500">
                            On-Premise packages include dedicated database bundles, offline cryptographic licensing, and zero external network communication.
                        </p>
                    )}
                </div>

                {/* Billing cycle switch (for SaaS, only if plans define annualPrice) */}
                {deploymentType === "saas" && activePlans.some(p => Boolean(p.annualPrice)) && (
                    <div className="pt-6 flex items-center justify-center gap-4 z-10 relative">
                        <span className={isAnnual ? "text-muted-foreground" : "font-medium"}>Monthly</span>
                        <Switch
                            checked={isAnnual}
                            onCheckedChange={(v) => setIsAnnual(Boolean(v))}
                            aria-label="Toggle pricing period"
                        />
                        <span className={!isAnnual ? "text-muted-foreground" : "font-medium"}>Annual</span>
                    </div>
                )}
            </div>

            <div className={`grid gap-10 max-w-6xl mx-auto ${deploymentType === "saas" ? "lg:grid-cols-3" : "md:grid-cols-2 max-w-4xl"}`}>
                {activePlans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative rounded-2xl shadow-md hover:shadow-xl transition flex flex-col justify-between ${
                            plan.popular ? "border-[2px] border-blue-600 scale-105 bg-[#fcfdff]" : "border-slate-200"
                        }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-4 py-1 font-bold text-xs rounded-full shadow-md">
                                {plan.badge || "Most Popular"}
                            </div>
                        )}
                        {!plan.popular && plan.badge && (
                            <div className="absolute -top-3 left-6 bg-slate-800 text-white px-3 py-0.5 font-medium text-xs rounded-md shadow-sm flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                {plan.badge}
                            </div>
                        )}
                        <CardHeader className="text-center pt-8">
                            <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                            <div className="flex flex-col items-center justify-center mt-4">
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{plan.price}</p>
                                {plan.period && (
                                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">{plan.period}</p>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 flex flex-col justify-between flex-1">
                            <ul className="space-y-2.5 my-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={() => handleOpenQuoteModal(plan)}
                                    className={`w-full text-center ${plan.popular ? "btn-blue" : "btn-green"}`}
                                    variant={plan.buttonVariant as "default" | "secondary"}
                                >
                                    {plan.button}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <QuoteRequestModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                plan={selectedQuotePlan}
                deploymentType={deploymentType}
            />
        </section>
    );
}
