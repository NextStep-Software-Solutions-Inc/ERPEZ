import { useState, useEffect } from "react";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useKeycloak } from "~/providers/KeycloakProvider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [
    { title: "Sign In - ERPEZ Tenant Management" },
    { name: "description", content: "Sign in to your ERPEZ account and workspace" },
  ];
}

export default function SignInPage() {
  const { isAuthenticated, isSuperAdmin, login, loginInApp, switchDevUser, activeDevUser } = useKeycloak();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("erpez_remembered_username") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("erpez_remembered_username"));
    }
    return false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const envAllowsDevPersonas = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_PERSONAS !== "false";
  const [showDevPersonas, setShowDevPersonas] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erpez_show_dev_personas");
      if (saved !== null) return saved === "true";
    }
    return envAllowsDevPersonas;
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (isSuperAdmin) {
        navigate("/super-admin/overview");
      } else {
        navigate("/overview");
      }
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim()) {
      setErrorMessage("Username or email is required.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginInApp({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
        rememberMe,
      });

      if (result.success) {
        if (isSuperAdmin) {
          navigate("/super-admin/overview");
        } else {
          navigate("/overview");
        }
      } else {
        setErrorMessage(result.error || "Invalid username or password. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async (username: string) => {
    await switchDevUser(username);
    if (username === "dev_superadmin") {
      navigate("/super-admin/overview");
    } else {
      navigate("/overview");
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Form Section */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md space-y-6 my-auto pt-10 pb-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your ERP workspaces
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in-50">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Authentication failed: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Native In-App Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  placeholder="admin@erpez.dev or username"
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="pl-10 h-11"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Please contact your workspace administrator or Keycloak realm admin to reset your credentials.")
                  }
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="pl-10 pr-10 h-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800"
              />
              <Label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember me on this browser
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center text-sm text-muted-foreground">
            New user?{" "}
            <Link to="/sign-up" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create an account & workspace
            </Link>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 dark:bg-slate-900 px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Secondary Keycloak SSO Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => login()}
            className="w-full h-11 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors gap-2 text-sm font-medium"
          >
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            Enterprise Keycloak SSO Redirect
          </Button>

          {/* Dev Personas 1-Click Login (Dev only) */}
          {envAllowsDevPersonas && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span>Development Personas</span>
                  <span className="text-[10px] lowercase text-blue-500 font-normal">(dev only)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showDevPersonas;
                    setShowDevPersonas(next);
                    localStorage.setItem("erpez_show_dev_personas", String(next));
                  }}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer lowercase"
                >
                  {showDevPersonas ? "Hide test personas" : "Show test personas"}
                </button>
              </div>

              {showDevPersonas && (
                <div className="grid gap-2 animate-in fade-in-50 duration-200">
                  <button
                    type="button"
                    onClick={() => handleDevLogin("dev_admin")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      activeDevUser === "dev_admin"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600">
                        <Building className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Tenant Administrator</div>
                        <div className="text-[10px] text-muted-foreground">admin@erpez.dev</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDevLogin("dev_superadmin")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      activeDevUser === "dev_superadmin"
                        ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Super Administrator</div>
                        <div className="text-[10px] text-muted-foreground">superadmin@erpez.dev</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                      Global Bypass
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDevLogin("dev_planner")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      activeDevUser === "dev_planner"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600">
                        <UserCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Planning Officer</div>
                        <div className="text-[10px] text-muted-foreground">planner@erpez.dev</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                      Member
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Illustration Section */}
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

