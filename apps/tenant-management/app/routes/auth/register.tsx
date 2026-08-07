import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import CreateTenantForm from "~/features/tenant/forms/CreateTenantForm";
import { type Tenant } from "~/features/tenant/type/Tenant";

export function meta() {
    return [
        { title: "Register Tenant" },
        { name: "description", content: "Register a new tenant in the system" },
    ];
}

export default function RegisterPage() {
    const handleTenantCreated = (tenant: Tenant) => {
        // Handle successful tenant creation
        console.log("Tenant created:", tenant);
        // You might want to redirect to a success page or show a success message
    };

    const handleClose = () => {
        // Handle form close/cancel
        // Maybe redirect back to home or sign-in
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left side illustration (hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-500 to-green-400 text-white p-10">
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                    Register Your <br /> Organization <br />
                    <span className="text-blue-200">Get Started</span>
                </h1>
                <img
                    src="/image/SignUp.png"
                    alt="Registration Illustration"
                    className="max-w-md"
                />
            </div>

            {/* Right side form */}
            <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6">
                <Link
                    to="/"
                    className="absolute top-4 left-4 lg:left-auto lg:right-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Back
                </Link>
                <div className="w-full max-w-md">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Register Your Organization</h2>
                        <p className="text-gray-600 mt-2">Create a new tenant to get started with ERPez</p>
                    </div>
                    <CreateTenantForm
                        onCreated={handleTenantCreated}
                        onClose={handleClose}
                    />
                </div>
            </div>
        </div>
    );
}