import { useEffect } from "react";
import { ArrowLeft, Building2, Mail, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import GradientEllipses from "~/components/design/GradientEllipse";
import GridLines from "~/components/design/GridLines";
import { Button } from "~/components/ui/button";

export default function NoTenantEmptyState() {
    const navigate = useNavigate();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const pendingToken = sessionStorage.getItem("pending_invitation_token");
            if (pendingToken) {
                navigate(`/accept-invitation?token=${encodeURIComponent(pendingToken)}`, { replace: true });
            }
        }
    }, [navigate]);

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-slate-50/50">
            <GridLines />
            <GradientEllipses numEllipses={4} opacityRange={[0.12, 0.16]} />

            {/* Top Navigation Bar */}
            <div className="w-full max-w-6xl px-6 py-6 flex items-center justify-between z-20">
                <img
                    src="/image/Logo1.png"
                    alt="ERPEZ Logo"
                    width={126}
                    height={60}
                    className="cursor-pointer"
                    onClick={() => navigate("/")}
                />
                <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer z-20"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Center Empty State Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 z-20 w-full max-w-md">
                <div className="w-full backdrop-blur-md bg-white/70 shadow-xl rounded-2xl border border-white/60 p-8 flex flex-col items-center text-center transition-all">
                    {/* Visual Icon Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-6 shadow-xs">
                        <Building2 className="w-8 h-8 stroke-[1.75]" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        No tenant registered yet
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        You don't have an active workspace registered under this account yet.
                    </p>

                    {/* Actions */}
                    <div className="w-full flex flex-col gap-3 mt-6">
                        <Button
                            onClick={() => navigate("/register-tenant")}
                            className="w-full bg-[#10B981] hover:bg-[#0a5139] text-white font-medium py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Register New Tenant
                        </Button>

                        <Button
                            onClick={handleBack}
                            variant="outline"
                            className="w-full border-slate-200 text-slate-700 hover:bg-slate-100/60 rounded-lg py-2.5 cursor-pointer transition-all"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Invitation Note */}
                    <div className="mt-6 pt-5 border-t border-slate-200/70 w-full text-left">
                        <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>
                                <strong>Invited to an existing workspace?</strong> Open the workspace invitation link provided by your administrator to accept and access your organization.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    );
}
