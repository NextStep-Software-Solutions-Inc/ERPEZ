import { ShieldCheck, FileSpreadsheet, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function HeroSecondSlide() {
    return (
        <section className="bg-transparent w-full">
            <div className="relative overflow-hidden bg-hero">
                <div className="pointer-events-none absolute inset-0 bg-grid" />
                <div className="pointer-events-none absolute inset-0 bg-glow" />
                <div className="container relative mx-auto flex min-h-[72vh] flex-col items-center justify-center py-20 text-center sm:py-28">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm mb-6">
                        <span>Connected Enterprise & Public-Sector Workflows</span>
                    </div>

                    <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        <span className="block">Unified Governance from</span>
                        <span className="block bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                            Planning to Procurement
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
                        Align organizational hierarchies, fiscal year budget preparation, and procurement execution within one structured, role-governed workspace.
                    </p>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
                        <div className="rounded-xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">1. Access & Governance</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Configure organizational units, offices, and granular role-based permissions across your workspace.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">2. Planning & Budgeting</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Prepare Line Item Budgets (LIB), Work & Financial Plans (WFP), and OPCR performance targets with approval workflows.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">3. Procurement Execution</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Consolidate PPMPs into Annual Procurement Plans, manage Purchase Requests, RFQ canvassing, and Purchase Orders.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#feature">
                            <Button className="btn-blue h-11 px-6 font-semibold flex items-center gap-2">
                                Explore Core Modules
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </a>
                        <a href="#pricing">
                            <Button variant="outline" className="h-11 px-6 font-semibold border-slate-300">
                                View Deployment Plans
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}