import { Users, ClipboardList, ShoppingCart, Check } from "lucide-react";

interface ModuleItem {
    code: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    icon: React.ReactNode;
    topGradient: string;
    badgeBg: string;
    iconBg: string;
    hoverBorder: string;
    accentColor: string;
    features: string[];
}

const modules: ModuleItem[] = [
    {
        code: "AMS",
        title: "Account Management",
        subtitle: "Foundation, Multi-Tenancy & Security",
        description:
            "Centralized identity, organizational hierarchy, and security governance across all branches.",
        category: "Identity & Core",
        icon: <Users className="h-6 w-6 text-blue-600" />,
        topGradient: "from-blue-500 to-indigo-600",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200/60",
        iconBg: "bg-blue-50 text-blue-600",
        hoverBorder: "hover:border-blue-400",
        accentColor: "group-hover:text-blue-600",
        features: [
            "Multi-tenant workspace isolation",
            "Single Sign-On (SSO) & RBAC roles",
            "Offices, departments & suppliers",
            "Granular permission & workspace member controls",
        ],
    },
    {
        code: "PBMS",
        title: "Planning & Budget",
        subtitle: "Strategic Planning & Fund Allocation",
        description:
            "Strategic objective formulation, target indicators, and annual commitment budget controls.",
        category: "Financial Strategy",
        icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
        topGradient: "from-indigo-500 to-purple-600",
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        iconBg: "bg-indigo-50 text-indigo-600",
        hoverBorder: "hover:border-indigo-400",
        accentColor: "group-hover:text-indigo-600",
        features: [
            "Annual budget preparation & ceilings",
            "Strategic performance goals & KPIs",
            "Commitment forms & rating scales",
            "Departmental budget allocation & approval workflows",
        ],
    },
    {
        code: "PMS",
        title: "Procurement Management",
        subtitle: "Purchasing & Vendor Relations",
        description:
            "End-to-end procurement lifecycle from PR consolidation and bidding to BAC awards and purchase orders.",
        category: "Procurement & Bidding",
        icon: <ShoppingCart className="h-6 w-6 text-emerald-600" />,
        topGradient: "from-emerald-500 to-teal-600",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        iconBg: "bg-emerald-50 text-emerald-600",
        hoverBorder: "hover:border-emerald-400",
        accentColor: "group-hover:text-emerald-600",
        features: [
            "Requisition, PR & PO generation",
            "Supplier bidding & quote evaluation",
            "Abstract of Bids (AOB) & BAC resolutions",
            "Notice of Award (NOA) & Notice to Proceed (NTP)",
        ],
    },
];

export const ModulesSection = () => {
    return (
        <section className="w-full py-20 max-w-6xl mx-auto px-6" id="feature">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
                    Enterprise Architecture
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-[42px] lg:leading-[52px] font-bold text-slate-900 tracking-tight">
                    Three Core Modules, One Integrated Platform
                </h2>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-normal tracking-[0.2px]">
                    ERP EZ integrates your critical business functions into a single, unified platform
                    with a shared database for streamlined operations and optimal performance.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {modules.map((mod, index) => (
                    <div
                        key={index}
                        className={`group relative bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-200/80 ${mod.hoverBorder} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs`}
                    >
                        {/* Top Gradient Accent Bar */}
                        <div
                            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.topGradient}`}
                        />

                        <div className="space-y-5">
                            {/* Card Header: Icon & Acronym Badge */}
                            <div className="flex items-center justify-between">
                                <div
                                    className={`w-12 h-12 rounded-xl ${mod.iconBg} flex items-center justify-center font-bold text-lg shadow-2xs group-hover:scale-105 transition-transform`}
                                >
                                    {mod.icon}
                                </div>
                                <span
                                    className={`px-2.5 py-1 text-xs font-bold rounded-md border ${mod.badgeBg} tracking-wide`}
                                >
                                    {mod.code}
                                </span>
                            </div>

                            {/* Titles & Value Proposition */}
                            <div className="text-left">
                                <h3
                                    className={`text-xl font-bold text-slate-900 ${mod.accentColor} transition-colors tracking-tight`}
                                >
                                    {mod.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    {mod.subtitle}
                                </p>
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>

                            {/* Feature Capability List */}
                            <div className="border-t border-slate-100 pt-4 text-left">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Key Capabilities
                                </div>
                                <ul className="space-y-2.5 text-xs text-slate-600">
                                    {mod.features.map((feature, fIndex) => (
                                        <li
                                            key={fIndex}
                                            className="flex items-start gap-2.5"
                                        >
                                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </span>
                                            <span className="leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <span>{mod.category}</span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Module
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ModulesSection;
