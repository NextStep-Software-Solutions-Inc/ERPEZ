import { ShieldCheck, Server, KeyRound, HardDrive, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function HeroThirdSlide() {
    return (
        <section className="bg-transparent w-full">
            <div className="relative overflow-hidden bg-hero">
                <div className="pointer-events-none absolute inset-0 bg-grid" />
                <div className="pointer-events-none absolute inset-0 bg-glow" />
                <div className="container relative mx-auto flex min-h-[72vh] flex-col items-center justify-center py-20 text-center sm:py-28">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm mb-6">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span>Dedicated & Self-Hosted Enterprise Architecture</span>
                    </div>

                    <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        <span className="block">Flexible Deployment with</span>
                        <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                            Enterprise Data Governance
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
                        Run ERP-EZ in our managed multi-tenant cloud or configure dedicated enterprise environments with cryptographic license verification and strict domain access controls.
                    </p>

                    {/* Architecture Highlights Grid */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
                        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <Server className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Tenant Data Isolation</h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Strict tenant-scoped data boundaries ensuring organizational records and budgets remain isolated.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Cryptographic Licensing</h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Subscription licenses are bound to your organization email and verified via HMAC-SHA256 signatures.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <HardDrive className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Multi-Workspace Control</h3>
                            </div>
                            <p className="text-xs text-slate-600">
                                Manage organizational divisions, roles, and seat allocations within your authorized domain limits.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#pricing">
                            <Button className="btn-blue h-11 px-6 font-semibold flex items-center gap-2">
                                View Plans
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </a>
                        <a href="#contact">
                            <Button variant="outline" className="h-11 px-6 font-semibold border-slate-300">
                                Contact Our Team
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
