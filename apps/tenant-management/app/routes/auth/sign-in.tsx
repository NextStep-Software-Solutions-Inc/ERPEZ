import { ArrowLeft, KeyRound, Shield, Building, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useKeycloak } from "~/providers/KeycloakProvider";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";

export function meta() {
  return [
    { title: "Sign In - ERPEZ Tenant Management" },
    { name: "description", content: "Sign In with Keycloak SSO" },
  ];
}

export default function SignInPage() {
  const { isAuthenticated, isSuperAdmin, login, switchDevUser, activeDevUser } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isSuperAdmin) {
        navigate("/super-admin/overview");
      } else {
        navigate("/overview");
      }
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleDevLogin = async (username: string) => {
    await switchDevUser(username);
    if (username === "dev_superadmin") {
      navigate("/super-admin/overview");
    } else {
      navigate("/overview");
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sign In Form Section */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome to ERPEZ
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in via Enterprise Single Sign-On (Keycloak) or select a dev persona
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => login()}
              className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
            >
              Sign In with Keycloak SSO
            </Button>

            {import.meta.env.DEV && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Development Personas</span>
                  <span className="text-[10px] lowercase text-blue-500">1-click test</span>
                </div>

                <div className="grid gap-2">
                  <button
                    onClick={() => handleDevLogin("dev_admin")}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      activeDevUser === "dev_admin"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600">
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Tenant Administrator</div>
                        <div className="text-[11px] text-muted-foreground">admin@erpez.dev</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => handleDevLogin("dev_superadmin")}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      activeDevUser === "dev_superadmin"
                        ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Super Administrator</div>
                        <div className="text-[11px] text-muted-foreground">superadmin@erpez.dev</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                      Global Bypass
                    </span>
                  </button>
                </div>
              </div>
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
          Seamless multi-tenant orchestration, licensing, and role-based access control.
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
