import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import { Button } from "~/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function meta() {
    return [
        { title: "Email Verification - ERPEZ" },
        { name: "description", content: "Email Verification Status" },
    ];
}

export default function VerifyEmailAddressPage() {
    const { isAuthenticated, isSuperAdmin } = useClerkAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isSuperAdmin ? '/super-admin/overview' : '/overview');
        }
    }, [isAuthenticated, isSuperAdmin, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md text-center space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Clerk Account Verification
                </h1>
                <p className="text-sm text-muted-foreground">
                    Email verification is handled securely by Clerk during registration. Once verified, you can proceed to sign in.
                </p>
                <div className="pt-2">
                    <Link to="/sign-in">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                            Return to Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}