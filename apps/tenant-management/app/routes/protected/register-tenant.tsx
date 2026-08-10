import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate, } from "react-router";
import TenantChecker from "~/components/TenantChecker";
import CreateTenantForm from "~/features/tenant/forms/CreateTenantForm";
import GradientEllipses from "~/components/design/GradientEllipse";
import { Button } from "~/components/ui/button";

export function meta() {
    return [
        { title: "Register Tenant" },
        { name: "description", content: "Register a new tenant in the system" },
    ];
}

export default function RegisterTenantPage() {
    const navigate = useNavigate();
    return (
        <TenantChecker inverted fallback={(<Navigate to="/overview" replace />)}>
            <GradientEllipses numEllipses={4} opacityRange={[0.15, 0.18]} />
            <div className="pt-10 px-14 lg:px-24 md:px-20 h-screen flex flex-col items-center ">
                <div className=" w-full flex flex-row justify-between items-center mb-16">
                    <img src="/image/Logo1.png"
                        alt="ERPEZ Logo"
                        width={126}
                        height={60}
                    />
                    <Button
                        onClick={() => navigate(-1)}
                        variant={"ghost"}
                        className="flex items-center text-[var(--button-blue)] hover:text-gray-800 z-50"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        Back
                    </Button>
                </div>
                <div className=" flex-1 flex flex-col items-center px-14 lg:px-24 md:px-20 ">
                    <div className="justify-center items-center min-h-[60vh] border border-white/20 w-md flex flex-col gap-8 p-4 backdrop-blur-md bg-white/10 shadow-lg rounded-lg">
                        <div className="flex flex-col gap-4 items-center justify-center">
                            <h2 className="text-2xl font-bold text-gray-900">Register Tenant</h2>
                            <p className="text-bg">Please provide your Tenant Details to get started</p>
                        </div>
                        <CreateTenantForm gradientButton />
                    </div>
                </div>
            </div>
        </TenantChecker>
    );
}

