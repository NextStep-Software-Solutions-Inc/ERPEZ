import { useState } from "react";
import { ArrowLeft, UserPlus, Building2, User, AtSign, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useKeycloak } from "~/providers/KeycloakProvider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [
    { title: "Sign Up - ERPEZ Tenant Management" },
    { name: "description", content: "Create an ERPEZ Account and Organization Workspace" },
  ];
}

export default function SignUpPage() {
  const { registerInApp, register } = useKeycloak();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!formData.firstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!formData.username.trim()) {
      setErrorMessage("Username is required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("A valid email address is required.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerInApp({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        organizationName: formData.organizationName.trim() || undefined,
      });

      if (result.success) {
        navigate("/overview");
      } else {
        setErrorMessage(result.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Illustration Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-emerald-500 text-white p-12 relative overflow-hidden">
        <div className="max-w-lg text-center z-10 space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            Enterprise Resource Planning <br />
            <span className="text-emerald-100">Tenant & Workspace Portal</span>
          </h1>
          <p className="text-blue-50 text-sm leading-relaxed">
            Join organizations streamlining multi-tenant budgeting, asset tracking, and procurement with isolated physical databases and fail-closed security.
          </p>
        </div>
        <img
          src="/image/SignUp.png"
          alt="ERP Registration"
          className="max-w-md drop-shadow-2xl z-10 mt-6"
        />
        {/* Subtle decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {/* Right Form Section */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-lg space-y-6 my-auto pt-8 pb-8">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Create Your Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Register your administrator account and dedicated tenant workspace
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <Label htmlFor="organizationName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Organization / Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="e.g. Department of Agriculture or Acme Corp"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {/* Username & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Work Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9 pr-9 h-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-9 pr-9 h-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account & Workspace...
                </>
              ) : (
                "Create Account & Workspace"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="space-y-3 pt-2 text-center text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800">
            <div>
              Already have an account?{" "}
              <Link to="/sign-in" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </div>

            <div>
              <button
                type="button"
                onClick={() => register()}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline text-[11px]"
              >
                Or register via Keycloak SSO server
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
