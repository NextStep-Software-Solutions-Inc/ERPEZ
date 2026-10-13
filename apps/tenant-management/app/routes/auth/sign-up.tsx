import { ArrowLeft, UserPlus } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";

export function meta() {
  return [
    { title: "Sign Up - ERPEZ" },
    { name: "description", content: "Create an ERPEZ Account with Clerk" },
  ];
}

export default function SignUpPage() {
  const { isAuthenticated, isSuperAdmin, register, isClerkLive } = useClerkAuth();
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
      {/* Left side illustration */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-emerald-500 text-white p-10">
        <h1 className="text-4xl font-extrabold mb-4 leading-tight text-center">
          Enterprise Resource Planning <br />
          <span className="text-blue-100">Made Simple</span>
        </h1>
        <p className="text-blue-50 text-sm max-w-md text-center mb-8">
          Streamline your organization's governance, budgeting, planning, and procurement in one unified platform.
        </p>
        <img
          src="/image/SignUp.png"
          alt="ERP Illustration"
          className="max-w-md drop-shadow-2xl"
        />
      </div>

      {/* Right side form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md space-y-6 text-center pt-12 lg:pt-0">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Register your organization through Clerk Identity Services
          </p>

          <div className="pt-4 space-y-3">
            {isClerkLive ? (
              <div className="flex justify-center">
                <SignUp routing="hash" fallbackRedirectUrl={redirectTarget} />
              </div>
            ) : (
              <Button
                onClick={() => register()}
                className="w-full h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all"
              >
                Continue with Clerk Registration
              </Button>
            )}

            <div className="text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
