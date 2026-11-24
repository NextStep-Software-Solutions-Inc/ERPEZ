import { ArrowLeft, Building2, Workflow, Users, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import TenantChecker from "~/components/TenantChecker";
import CreateTenantForm from "~/features/tenant/forms/CreateTenantForm";
import GradientEllipses from "~/components/design/GradientEllipse";
import { Button } from "~/components/ui/button";

export function meta() {
    return [
        { title: "Create Workspace | ERP-EZ" },
        { name: "description", content: "Set up your organization's ERP-EZ workspace" },
    ];
}

export default function RegisterTenantPage() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <TenantChecker inverted fallback={<Navigate to="/overview" replace />}>
            <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-50/80 via-white to-slate-50 overflow-x-hidden flex flex-col justify-between">
                <GradientEllipses numEllipses={4} opacityRange={[0.07, 0.11]} />

                {/* Top Navigation Bar */}
                <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 flex items-center justify-between">
                    <img
                        src="/image/Logo1.png"
                        alt="ERP-EZ Logo"
                        width={132}
                        height={48}
                        className="cursor-pointer transition-opacity hover:opacity-90"
                        onClick={() => navigate("/")}
                    />
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 text-xs sm:text-sm font-medium transition cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </Button>
                </header>

                {/* Main Content: Responsive Two-Column Layout */}
                <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 flex-1 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
                        
                        {/* Left Column: Introduction and Benefits */}
                        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-4">
                            {/* Eyebrow Label */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/70 w-fit shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>WORKSPACE SETUP</span>
                            </div>

                            {/* Heading & Supporting Explanation */}
                            <div className="space-y-3 sm:space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                                    Set up your ERP-EZ workspace.
                                </h1>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                                    A workspace is your organization’s dedicated space in ERP-EZ. It keeps your team, planning and budgeting activities, and procurement workflows organized in one place. Once your workspace is ready, you can configure it for your organization and invite your team as your needs grow.
                                </p>
                            </div>

                            {/* Three Short Benefit Statements */}
                            <div className="space-y-4 sm:space-y-5 pt-1">
                                {/* Benefit 1 */}
                                <div className="flex items-start gap-3.5 sm:gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 mt-0.5 group-hover:bg-blue-100/70 transition-colors">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                                            Dedicated organizational workspace
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                            Keep your organization’s activities and information organized.
                                        </p>
                                    </div>
                                </div>

                                {/* Benefit 2 */}
                                <div className="flex items-start gap-3.5 sm:gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 mt-0.5 group-hover:bg-emerald-100/70 transition-colors">
                                        <Workflow className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                                            Connected business workflows
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                            Manage planning, budgeting, and procurement within the ERP-EZ ecosystem.
                                        </p>
                                    </div>
                                </div>

                                {/* Benefit 3 */}
                                <div className="flex items-start gap-3.5 sm:gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5 group-hover:bg-indigo-100/70 transition-colors">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                                            Built for your team
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                            Establish your workspace first and manage access as your team grows.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Workspace Registration Card */}
                        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                            <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 backdrop-blur-xs transition-all">
                                <div className="space-y-1.5 mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                        Create your workspace
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        Set up your organization’s workspace to start managing your planning, budgeting, and procurement activities.
                                    </p>
                                </div>

                                <CreateTenantForm
                                    gradientButton
                                    submitButtonText="Create Workspace"
                                    className="max-w-none w-full"
                                />
                            </div>
                        </div>

                    </div>
                </main>

                {/* Footer Notice */}
                <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} ERP-EZ. Enterprise Resource Planning simplified.
                </footer>
            </div>
        </TenantChecker>
    );
}

