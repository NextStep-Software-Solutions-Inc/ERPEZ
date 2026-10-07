import { ArrowLeft, KeyRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";

export function meta() {
  return [
    { title: "Sign In - ERPEZ Tenant Management" },
    { name: "description", content: "Sign In with Clerk Identity Services" },
  ];
}

export default function SignInPage() {
  const { isAuthenticated, isSuperAdmin, login, isClerkLive } = useClerkAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const pendingToken = typeof window !== "undefined" ? sessionStorage.getItem("pending_invitation_token") : null;
  const redirectTarget = redirectParam || (pendingToken ? `/accept-invitation?token=${encodeURIComponent(pendingToken)}` : (isSuperAdmin ? "/super-admin/overview" : "/overview"));

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, navigate]);

  return (
    <div className="flex h-screen w-full">
      {/* Sign In Form Section */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md space-y-6 pt-12 lg:pt-0">
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome to ERPEZ
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your tenant control plane and organization settings
            </p>
          </div>

          <div className="space-y-4">
            {isClerkLive ? (
              <div className="flex justify-center">
                <SignIn routing="hash" fallbackRedirectUrl={redirectTarget} />
              </div>
            ) : (
              <Button
                onClick={() => login()}
                className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
              >
                Sign In with Clerk
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Illustration Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-emerald-500 text-white p-10 relative">
        <h1 className="text-4xl font-extrabold mb-4 leading-tight text-center">
          Enterprise Resource Planning <br />
          <span className="text-blue-100">Tenant & Identity Management</span>
        </h1>
        <p className="text-blue-50 text-sm max-w-md text-center mb-8">
          Seamless multi-tenant orchestration, licensing, and role-based access control powered by Clerk.
        </p>
        <img
          src="/image/SignIn.png"
          alt="ERP Illustration"
          className="max-w-md drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
