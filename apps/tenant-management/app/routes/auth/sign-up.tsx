import { ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "react-router";
import { useKeycloak } from "~/providers/KeycloakProvider";
import { Button } from "~/components/ui/button";

export function meta() {
  return [
    { title: "Sign Up - ERPEZ" },
    { name: "description", content: "Create an ERPEZ Account with Keycloak" },
  ];
}

export default function SignUpPage() {
  const { register } = useKeycloak();

  return (
    <div className="flex h-screen w-full">
      {/* Left side illustration */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-emerald-500 text-white p-10">
        <h1 className="text-4xl font-extrabold mb-4 leading-tight text-center">
          Enterprise Resource Planning <br />
          <span className="text-blue-100">Made Simple</span>
        </h1>
        <p className="text-blue-50 text-sm max-w-md text-center mb-8">
          Join thousands of organizations streamlining budgeting, planning, and procurement.
        </p>
        <img
          src="/image/SignUp.png"
          alt="ERP Illustration"
          className="max-w-md drop-shadow-2xl"
        />
      </div>

      {/* Right side form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Register your organization through Keycloak Identity Services
          </p>

          <div className="pt-4 space-y-3">
            <Button
              onClick={() => register()}
              className="w-full h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all"
            >
              Continue to Keycloak Registration
            </Button>
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
